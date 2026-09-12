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
	type CameraMode,
	type DeepReadonly
} from 'picocad2-web';
import { untrack } from 'svelte';
import { CAMERA_LIMITS } from './constants';

type Stats = RenderStats & { fps: number };

type AppSettings = ModelSettings & ViewerSettings;

interface Gif {
	url: string | null;
	recording: boolean;
	time: number;
	progress: number;
	initialRotation: number;
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

	gif = $state<Gif>({
		url: null,
		recording: false,
		time: 0,
		progress: 0,
		initialRotation: 0
	});

	pendingLoad = $state<LoadRequest | null>(null);

	context!: PicoCAD2Context;
	pico!: PicoCAD2Viewer;

	private worker: Worker | null = null;
	private workerReady = false;
	private recordingCancelled = false;
	private restoreAfterRecording: (() => void) | null = null;

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
				const blob = new Blob([e.data.data], { type: 'image/gif' });

				this.gif.url = URL.createObjectURL(blob);
				this.gif.recording = false;
				this.gif.progress = 100;

				const link = document.createElement('a');
				const name = this.name ? this.name.replace(/\.[^/.]+$/, '') : 'model';
				link.href = this.gif.url ?? '';
				link.download = `${name}.gif`;
				link.click();
				link.remove();

				this.restoreAfterRecording?.();
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
		this.stopGIFRecording();

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

	async startGIFRecording() {
		if (this.gif.recording || !this.worker || !this.workerReady) return;

		const cameraMode = this.pico.cameraMode;
		const info = this.pico.modelInfo;
		if (!info) return;

		const { backgroundColor, animationDuration, transparentColor } = info;

		if (this.gif.url) URL.revokeObjectURL(this.gif.url);

		this.gif = {
			url: null,
			recording: true,
			time: 0,
			progress: 0,
			initialRotation: this.pico.camera.omega
		};

		const fps = 30;
		const loops = Math.max(1, this.pico.animation.loops);
		const duration = this.pico.animation.playing
			? (animationDuration * loops) / this.pico.animation.speed
			: this.pico.cameraModeSpeed;
		const totalFrames = Math.ceil(fps * duration);
		const delay = Math.round((1 / fps) * 1000);

		const direction = this.pico.cameraModeDirection === 'right' ? 1 : -1;
		const canvasWidth = this.pico.canvas.width;
		const canvasHeight = this.pico.canvas.height;

		const bgColor = [
			Math.round(backgroundColor[0] * 255),
			Math.round(backgroundColor[1] * 255),
			Math.round(backgroundColor[2] * 255),
			255
		];
		const trColor = [
			Math.round(transparentColor[0] * 255),
			Math.round(transparentColor[1] * 255),
			Math.round(transparentColor[2] * 255)
		];

		const savedOmega = this.pico.camera.omega;
		const savedAnimTime = this.pico.animation.time;
		const savedAnimPlaying = this.pico.animation.playing;
		const savedTransparency = this.pico.transparency;

		this.restoreAfterRecording = () => {
			this.pico.camera.omega = savedOmega;
			this.pico.animation.setTime(savedAnimTime);
			this.pico.animation.playing = savedAnimPlaying;
			this.pico.transparency = savedTransparency;
			this.pico.startRenderLoop();
			this.pico.enableCameraControls();
			this.restoreAfterRecording = null;
		};

		this.pico.stopRenderLoop();
		this.pico.disableCameraControls();
		this.recordingCancelled = false;

		await this.pico.whenReady();

		const bgIsTransparent = backgroundColor.every(
			(c, i) => Math.fround(c) === Math.fround(transparentColor[i])
		);
		if (bgIsTransparent) this.pico.transparency = 'dithered';

		const frozenOffset = this.pico.camera.omegaOffset;
		const frameDt = 1 / fps;

		for (let i = 0; i < totalFrames; i++) {
			if (this.recordingCancelled) break;
			this.pico.advanceTime(frameDt);

			const progress = i / totalFrames;

			if (this.settings.animation.playing) {
				this.pico.animation.setTime((progress * animationDuration * loops) % animationDuration);
			} else {
				const simulatedOffset = this.computeSimulatedOffset(progress, cameraMode, direction);
				this.pico.camera.omega = savedOmega - frozenOffset + simulatedOffset;
				this.pico.camera.rotate(0, 0);
			}

			this.pico.draw();
			const pixelData = this.pico.toPixelData();

			this.worker.postMessage({ type: 'frame', data: pixelData }, [pixelData.buffer]);

			this.gif.progress = Math.round(progress * 100);
			this.gif.time = i / fps;

			await new Promise((r) => setTimeout(r, 0));
		}

		if (!this.recordingCancelled) {
			this.worker.postMessage({
				type: 'generate',
				width: canvasWidth,
				height: canvasHeight,
				delay,
				background: bgColor,
				transparentColor: trColor
			});
		} else {
			this.gif.recording = false;
			this.restoreAfterRecording?.();
		}
	}

	stopGIFRecording() {
		this.recordingCancelled = true;
	}

	private computeSimulatedOffset(progress: number, cameraMode: CameraMode, direction: number) {
		switch (cameraMode) {
			case 'spin':
				return progress * 2 * Math.PI * direction;
			case 'sway':
				return -direction * Math.sin(progress * 2 * Math.PI) * (Math.PI / 4);
			case 'pingpong': {
				let r = progress % 1;
				if (r > 0.5) r = 1 - r;
				return -direction * r * 2 * Math.PI;
			}
			case 'fixed':
				return 0;
		}
	}
}

export const viewer = new Viewer();
