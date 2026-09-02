import {
	PicoCAD2Viewer,
	PicoCAD2Context,
	getDefaultExtras,
	type ViewerSettings,
	type ExtrasState,
	type PicoCAD2ViewerState,
	type RenderStats,
	type CameraMode
} from 'picocad2-web';
import { DEFAULT_SETTINGS, CAMERA_LIMITS } from './constants';

type Stats = RenderStats & { fps: number };

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

class Viewer {
	settings = $state<ViewerSettings>({ ...DEFAULT_SETTINGS });
	extras = $state<ExtrasState>(getDefaultExtras());
	meshNames = $state<SceneNodeEntry[]>([]);
	animationDuration = $state(0);
	stats = $state<Stats>({ drawCalls: 0, polyCount: 0, fps: 0 });
	loaded = $state(false);
	name = $state('untitled');
	usingCustomResolution = $state(false);

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
		this.context = new PicoCAD2Context();
		this.pico = new PicoCAD2Viewer({
			canvas,
			context: this.context,
			resolution: { width: 128, height: 128, scale: 4 },
			maxFps: 0,
			clampCameraDistance: { enabled: true, minimumDistance: 2 }
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
			}

			if (keepSettings && currentState) {
				const newState = this.pico.getState();
				this.pico.setState({
					source: newState.source,
					settings: {
						...currentState.settings,
						animation: { ...currentState.settings.animation, time: 0 },
						bookmark: newState.settings.bookmark
					},
					extras: currentState.extras
				});
			}
		} catch (e) {
			console.error('Failed to load model:', e);
			if (!currentState) return;
			this.pico.setState(currentState);
		}

		let lastTime = performance.now();
		let frameCount = 0;

		this.pico.onFrame = () => {
			const now = performance.now();
			frameCount++;

			if (now - lastTime >= 1000) {
				this.stats.fps = Math.round((frameCount * 1000) / (now - lastTime));
				lastTime = now;
				frameCount = 0;
			}

			this.stats = { ...this.context.stats, fps: this.stats.fps };

			const { rotation, tilt, distance } = CAMERA_LIMITS;

			this.settings.animation.time = this.pico.animation.time;
			this.animationDuration = this.pico.modelInfo?.animationDuration ?? 0;
			this.settings.camera = {
				omega: ((this.pico.camera.omega % rotation.max) + rotation.max) % rotation.max,
				theta: Math.max(tilt.min, Math.min(tilt.max, this.pico.camera.theta)),
				distanceToTarget: Math.max(
					distance.min,
					Math.min(distance.max, this.pico.camera.distanceToTarget)
				),
				target: [...this.pico.camera.target] as [number, number, number],
				zoom: this.pico.camera.zoom
			};
		};

		this.loaded = true;
		this.updateState();
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

		try {
			// getState() returns the source as a parsed object despite the
			// string type, so handle both forms.
			const raw = typeof source === 'string' ? JSON.parse(source) : source;
			const entries: SceneNodeEntry[] = [];
			const listed = (name: string) => entries.some((e) => e.name === name);
			const walk = (
				node: { name?: string; mesh?: unknown; children?: unknown[] },
				depth: number
			) => {
				// Effects match by name, so a repeated name is listed once, at
				// its first (shallowest) occurrence.
				if (node.name && !listed(node.name)) {
					entries.push({ name: node.name, depth, group: !node.mesh });
				}
				for (const child of node.children ?? []) walk(child as typeof node, depth + 1);
			};
			for (const child of raw.graph?.children ?? []) walk(child, 0);
			this.meshNames = entries;
		} catch {
			this.meshNames = [];
		}
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
		this.settings = state.settings;
		this.extras = state.extras;
	}

	getState() {
		return this.pico?.getState();
	}

	getImage() {
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
		if (cameraMode === 'fixed' && !this.pico.animation.playing) return;

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

		this.restoreAfterRecording = () => {
			this.pico.camera.omega = savedOmega;
			this.pico.animation.setTime(savedAnimTime);
			this.pico.animation.playing = savedAnimPlaying;
			this.pico.startRenderLoop();
			this.pico.enableCameraControls();
			this.restoreAfterRecording = null;
		};

		this.pico.stopRenderLoop();
		this.pico.disableCameraControls();
		this.recordingCancelled = false;

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
