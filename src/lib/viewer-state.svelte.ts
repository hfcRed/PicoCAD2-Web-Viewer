import {
	PicoCAD2Viewer,
	PicoCAD2Context,
	type ViewerSettings,
	type ExtrasOptions,
	type PicoCAD2ViewerState,
	type RenderStats,
	type CameraMode
} from 'picocad2-web';
import { DEFAULT_SETTINGS, DEFAULT_EXTRAS, CAMERA_LIMITS } from './constants';

type Stats = RenderStats & { fps: number };

interface Gif {
	url: string | null;
	recording: boolean;
	time: number;
	progress: number;
	initialRotation: number;
}

class Viewer {
	settings = $state<ViewerSettings>({ ...DEFAULT_SETTINGS });
	extras = $state<Required<ExtrasOptions>>({ ...DEFAULT_EXTRAS });
	animationDuration = $state(0);
	stats = $state<Stats>({ drawCalls: 0, polyCount: 0, fps: 0 });
	loaded = $state(false);
	name = $state('untitled');

	gif = $state<Gif>({
		url: null,
		recording: false,
		time: 0,
		progress: 0,
		initialRotation: 0
	});

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
			resolution: { width: 128, height: 128, scale: 4 }
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

	loadModel({ model, state }: { model?: string; state?: PicoCAD2ViewerState }) {
		this.stopGIFRecording();

		const currentState = this.loaded ? this.pico.getState() : null;
		try {
			if (state) {
				this.pico.setState(state);
			} else if (model) {
				this.pico.load(model, true);
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
	}

	update(fn: (pico: PicoCAD2Viewer) => void) {
		if (!this.loaded) return;
		fn(this.pico);
		this.updateState();
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
		const duration = this.pico.animation.playing
			? animationDuration / this.pico.animation.speed
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
				this.pico.animation.setTime(progress * animationDuration);
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
