import {
	PicoCAD2Viewer,
	PicoCAD2Context,
	getDefaultExtras,
	getDefaultModelSettings,
	getDefaultViewerSettings,
	mergeDefaults,
	type ModelSettings,
	type ViewerSettings,
	type ColorScheme,
	type ExtrasState,
	type PicoCAD2ViewerState,
	type RawGraphNode,
	type RenderStats,
	type DeepReadonly
} from 'picocad2-web';
import {
	BufferTarget,
	Mp4OutputFormat,
	Output,
	QUALITY_VERY_HIGH,
	VideoSample,
	VideoSampleSource,
	getFirstEncodableVideoCodec
} from 'mediabunny';
import { untrack } from 'svelte';
import { CAMERA_LIMITS, CAPTURE_FPS_LIMITS } from './constants';

type Stats = RenderStats & { fps: number };

type AppSettings = ModelSettings & ViewerSettings;

export type CaptureFormat = keyof typeof CAPTURE_FPS_LIMITS;

interface Capture {
	url: string | null;
	recording: boolean;
	progress: number;
	error: string | null;
}

interface FrameSink {
	addFrame: (index: number) => Promise<void> | void;
	finish: () => Promise<Blob>;
	cancel: () => Promise<void> | void;
}

export interface SceneNodeEntry {
	name: string;
	depth: number;
	group: boolean;
}

interface LoadRequest {
	model?: string;
	state?: PicoCAD2ViewerState;
	name?: string;
}

const UI_SYNC_INTERVAL = 100;

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return (
		typeof value === 'object' &&
		value !== null &&
		!Array.isArray(value) &&
		!ArrayBuffer.isView(value)
	);
}

function sameValue(a: unknown, b: unknown): boolean {
	if (a === b) return true;

	if (Array.isArray(a) && Array.isArray(b)) {
		return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
	}

	if (isPlainObject(a) && isPlainObject(b)) {
		const keys = Object.keys(a);
		return keys.length === Object.keys(b).length && keys.every((k) => sameValue(a[k], b[k]));
	}

	return false;
}

function patchState<T extends object>(target: T, source: Partial<T>) {
	for (const key of Object.keys(source) as (keyof T)[]) {
		const next = source[key];
		const current = target[key];

		if (isPlainObject(next) && isPlainObject(current)) {
			patchState<Record<string, unknown>>(current, next);
		} else if (!sameValue(current, next)) {
			target[key] = next as T[keyof T];
		}
	}
}

class Viewer {
	settings = $state<AppSettings>({
		...getDefaultModelSettings(),
		...getDefaultViewerSettings()
	});
	extras = $state<ExtrasState>(getDefaultExtras());
	// The page's scheme, not part of the viewer state, so it stays out of cards and links
	colorScheme = $state<ColorScheme>('auto');
	meshNames = $state<SceneNodeEntry[]>([]);
	animationDuration = $state(0);
	stats = $state<Stats>({ drawCalls: 0, polyCount: 0, fps: 0 });
	loaded = $state(false);
	name = $state('untitled');
	usingCustomResolution = $state(false);
	revision = $state(0);

	capture = $state<Capture>({
		url: null,
		recording: false,
		progress: 0,
		error: null
	});
	captureSettings = $state<{ format: CaptureFormat; fps: number }>({
		format: 'gif',
		fps: 30
	});

	pendingLoad = $state<LoadRequest | null>(null);

	context!: PicoCAD2Context;
	pico!: PicoCAD2Viewer;

	private worker: Worker | null = null;
	private workerReady = false;
	private recordingCancelled = false;
	private resolveGif: ((data: Uint8Array<ArrayBuffer>) => void) | null = null;

	init(canvas: HTMLCanvasElement) {
		const colorScheme = untrack(() => this.colorScheme);

		this.context = new PicoCAD2Context();
		this.pico = new PicoCAD2Viewer({
			canvas,
			context: this.context,
			resolution: { width: 128, height: 128, scale: 4 },
			maxFps: 0,
			clampCameraDistance: { enabled: true, minimumDistance: 2 },
			colorScheme
		});

		this.setupWorker();
		this.pico.startRenderLoop();
		this.pico.enableCameraControls();
	}

	private setupWorker() {
		this.worker?.terminate();
		this.workerReady = false;
		this.worker = new Worker(new URL('./gifworker.ts', import.meta.url), {
			type: 'module'
		});

		this.worker.onmessage = (e: MessageEvent) => {
			if (e.data.type === 'load') {
				this.workerReady = true;
			} else if (e.data.type === 'gif') {
				this.resolveGif?.(e.data.data);
				this.resolveGif = null;
			}
		};
	}

	requestLoad(request: LoadRequest) {
		if (!this.loaded) {
			this.applyLoad(request, false);
			return;
		}

		this.pendingLoad = request;
	}

	confirmPendingLoad(keepSettings: boolean) {
		if (!this.pendingLoad) return;

		const request = $state.snapshot(this.pendingLoad) as LoadRequest;
		this.pendingLoad = null;
		this.applyLoad(request, keepSettings);
	}

	cancelPendingLoad() {
		this.pendingLoad = null;
	}

	private applyLoad(request: LoadRequest, keepSettings: boolean) {
		this.loadModel({ model: request.model, state: request.state, keepSettings });
		if (request.name) this.name = request.name;
	}

	loadModel({
		model,
		state,
		keepSettings = false
	}: {
		model?: string;
		state?: PicoCAD2ViewerState;
		keepSettings?: boolean;
	}) {
		this.stopRecording();

		const currentState = this.loaded ? this.pico.getState() : null;
		try {
			if (state) {
				this.pico.setState(state);
			} else if (model) {
				this.pico.load(model);
				if (!keepSettings) this.pico.extras.reset();
			}

			if (keepSettings && currentState) {
				const model = {
					...currentState.model,
					animation: { ...currentState.model?.animation, time: 0 }
				};

				delete model.bookmark;
				this.pico.setState({
					source: this.pico.getState().source,
					model,
					viewer: currentState.viewer,
					extras: currentState.extras
				});
			}
		} catch (e) {
			console.error('Failed to load model:', e);
			if (!currentState) return;
			this.pico.setState(currentState);
		}

		let lastTime = performance.now();
		let lastSync = 0;
		let frameCount = 0;

		this.pico.onFrame = () => {
			const now = performance.now();
			frameCount++;

			if (now - lastTime >= 1000) {
				this.stats.fps = Math.round((frameCount * 1000) / (now - lastTime));
				lastTime = now;
				frameCount = 0;
			}

			if (now - lastSync < UI_SYNC_INTERVAL) return;
			lastSync = now;
			this.syncFromViewer();
		};

		this.loaded = true;
		this.updateState();
		this.syncFromViewer();
		this.updateMeshNames();

		if (this.settings.resolution.width !== this.settings.resolution.height) {
			this.usingCustomResolution = true;
		} else {
			this.usingCustomResolution = false;
		}
	}

	loadEmbedState(state: PicoCAD2ViewerState) {
		this.pico.setState(state);
		this.pico.stopRenderLoop();
		this.pico.disableCameraControls();

		this.pico.startRenderLoop(false);
		this.pico.enableCameraControls({
			useFixedOnInteract: { enabled: true, delayBeforeRestore: 1000, restoreTime: 1000 }
		});

		this.loaded = true;
		this.updateState();
		this.updateMeshNames();
	}

	// The library resolves effect nodes by name but does not expose the
	// scene graph, so the node tree is read from the raw model source.
	// Groups are listed too, selecting one selects its whole subtree.
	private updateMeshNames() {
		const source = this.pico.getState().source;
		if (!source) {
			this.meshNames = [];
			return;
		}

		const entries: SceneNodeEntry[] = [];
		const listed = (name: string) => entries.some((e) => e.name === name);
		const walk = (node: DeepReadonly<RawGraphNode>, depth: number) => {
			// Effects match by name, so a repeated name is listed once, at
			// its first (shallowest) occurrence.
			if (node.name && !listed(node.name)) {
				entries.push({ name: node.name, depth, group: !node.mesh });
			}
			for (const child of node.children ?? []) walk(child, depth + 1);
		};
		for (const child of source.graph.children ?? []) walk(child, 0);
		this.meshNames = entries;
	}

	private syncFromViewer() {
		patchState(this.stats, this.context.stats);

		const { rotation, tilt, distance } = CAMERA_LIMITS;
		const camera = this.pico.camera;

		this.settings.animation.time = this.pico.animation.time;
		this.animationDuration = this.pico.modelInfo?.animationDuration ?? 0;

		patchState(this.settings.camera, {
			omega: ((camera.omega % rotation.max) + rotation.max) % rotation.max,
			theta: Math.max(tilt.min, Math.min(tilt.max, camera.theta)),
			distanceToTarget: Math.max(distance.min, Math.min(distance.max, camera.distanceToTarget)),
			target: [camera.target[0], camera.target[1], camera.target[2]],
			zoom: camera.zoom
		});
	}

	setColorScheme(scheme: ColorScheme) {
		this.colorScheme = scheme;
		this.pico.colorScheme = scheme;
	}

	update(fn: (pico: PicoCAD2Viewer) => void) {
		if (!this.loaded) return;
		fn(this.pico);
		this.updateState();

		this.pico.camera.initFromState({
			omega: this.settings.camera.omega,
			theta: this.settings.camera.theta,
			distanceToTarget: this.settings.camera.distanceToTarget,
			target: new Float32Array(this.settings.camera.target)
		});
	}

	private updateState() {
		const state = this.pico.getState();
		const fileSettings = this.pico.modelInfo?.settings ?? getDefaultModelSettings();

		patchState(this.settings, {
			...mergeDefaults(fileSettings, state.model),
			...mergeDefaults(getDefaultViewerSettings(), state.viewer)
		});
		patchState(this.extras, mergeDefaults(getDefaultExtras(), state.extras));
		this.revision++;
	}

	getState() {
		return this.pico?.getState();
	}

	async getImage() {
		await this.pico.whenReady();
		this.pico.draw();
		return this.pico.toDataURL();
	}

	loadBookmark() {
		this.pico.useBookmark();
		this.updateState();
	}

	setBookmark() {
		this.pico.setBookmark({
			omega: this.settings.camera.omega,
			theta: this.settings.camera.theta,
			distanceToTarget: this.settings.camera.distanceToTarget,
			target: new Float32Array(this.settings.camera.target)
		});
		this.updateState();
	}

	async startRecording() {
		if (this.capture.recording) return;

		const format = this.captureSettings.format;
		if (format === 'gif' && (!this.worker || !this.workerReady)) return;

		const info = this.pico.modelInfo;
		if (!info) return;

		const { backgroundColor, animationDuration, transparentColor } = info;

		this.capture.recording = true;
		this.capture.progress = 0;
		this.capture.error = null;

		const { min, max } = CAPTURE_FPS_LIMITS[format];
		const fps = Math.max(min, Math.min(max, this.captureSettings.fps || 30));
		const animated = this.pico.animation.playing;
		const loops = Math.max(1, this.pico.animation.loops);
		const duration = animated
			? (animationDuration * loops) / this.pico.animation.speed
			: this.pico.cameraModeSpeed;

		const totalFrames = Math.max(
			1,
			Math.min(Math.round(fps * duration), Math.floor(max * duration))
		);
		const frameDuration = duration / totalFrames;

		const bgColor = [
			Math.round(backgroundColor[0] * 255),
			Math.round(backgroundColor[1] * 255),
			Math.round(backgroundColor[2] * 255),
			255
		];
		const trColor: [number, number, number] = [
			Math.round(transparentColor[0] * 255),
			Math.round(transparentColor[1] * 255),
			Math.round(transparentColor[2] * 255)
		];

		const savedAnimTime = this.pico.animation.time;
		const savedAnimPlaying = this.pico.animation.playing;
		const savedTransparency = this.pico.transparency;

		this.pico.stopRenderLoop();
		this.pico.disableCameraControls();
		this.recordingCancelled = false;

		const bgIsTransparent = backgroundColor.every(
			(c, i) => Math.fround(c) === Math.fround(transparentColor[i])
		);
		if (format === 'gif' && bgIsTransparent) this.pico.transparency = 'dithered';

		try {
			await this.pico.whenReady();

			const sink =
				format === 'gif'
					? this.createGifSink(frameDuration, bgColor, trColor)
					: await this.createVideoSink(fps, frameDuration, bgColor);

			for (let i = 0; i < totalFrames; i++) {
				if (this.recordingCancelled) break;

				this.pico.advanceTime(frameDuration);

				const progress = i / totalFrames;

				if (animated) {
					this.pico.animation.setTime((progress * animationDuration * loops) % animationDuration);
				}

				this.pico.draw();
				await sink.addFrame(i);

				this.capture.progress = Math.round(progress * 100);

				await new Promise((r) => setTimeout(r, 0));
			}

			if (this.recordingCancelled) {
				await sink.cancel();
			} else {
				this.download(await sink.finish(), format === 'gif' ? 'gif' : 'mp4');
				this.capture.progress = 100;
			}
		} catch (e) {
			console.error('Recording failed:', e);
			this.capture.error = e instanceof Error ? e.message : 'Recording failed.';
		} finally {
			this.pico.animation.setTime(savedAnimTime);
			this.pico.animation.playing = savedAnimPlaying;
			this.pico.transparency = savedTransparency;
			this.pico.startRenderLoop();
			this.pico.enableCameraControls();
			this.capture.recording = false;
		}
	}

	stopRecording() {
		this.recordingCancelled = true;
	}

	private createGifSink(
		frameDuration: number,
		background: number[],
		transparentColor: [number, number, number]
	): FrameSink {
		const worker = this.worker!;
		const width = this.pico.canvas.width;
		const height = this.pico.canvas.height;

		return {
			addFrame: () => {
				const pixelData = this.pico.toPixelData();
				worker.postMessage({ type: 'frame', data: pixelData }, [pixelData.buffer]);
			},
			finish: () =>
				new Promise<Blob>((resolve) => {
					this.resolveGif = (data) => resolve(new Blob([data], { type: 'image/gif' }));
					worker.postMessage({
						type: 'generate',
						width,
						height,
						frameDuration,
						background,
						transparentColor
					});
				}),
			cancel: () => worker.postMessage({ type: 'reset' })
		};
	}

	private async createVideoSink(
		fps: number,
		frameDuration: number,
		background: number[]
	): Promise<FrameSink> {
		const width = this.pico.canvas.width & ~1;
		const height = this.pico.canvas.height & ~1;

		const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
		const codec = await getFirstEncodableVideoCodec(output.format.getSupportedVideoCodecs(), {
			width,
			height,
			frameRate: fps,
			quality: QUALITY_VERY_HIGH
		});
		if (!codec) throw new Error(`This browser cannot encode a ${width}x${height} video.`);

		const source = new VideoSampleSource({ codec, quality: QUALITY_VERY_HIGH });
		output.addVideoTrack(source);
		await output.start();

		const frame = new OffscreenCanvas(width, height);
		const ctx = frame.getContext('2d')!;
		ctx.fillStyle = `rgb(${background[0]} ${background[1]} ${background[2]})`;

		return {
			addFrame: async (index) => {
				ctx.fillRect(0, 0, width, height);
				ctx.drawImage(this.pico.canvas, 0, 0);

				const sample = new VideoSample(frame, {
					timestamp: index * frameDuration,
					duration: frameDuration
				});
				await source.add(sample);
				sample.close();
			},
			finish: async () => {
				await output.finalize();
				return new Blob([output.target.buffer!], { type: 'video/mp4' });
			},
			cancel: () => output.cancel()
		};
	}

	private download(blob: Blob, extension: string) {
		if (this.capture.url) URL.revokeObjectURL(this.capture.url);
		this.capture.url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		const name = this.name ? this.name.replace(/\.[^/.]+$/, '') : 'model';
		link.href = this.capture.url;
		link.download = `${name}.${extension}`;
		link.click();
		link.remove();
	}
}

export const viewer = new Viewer();
