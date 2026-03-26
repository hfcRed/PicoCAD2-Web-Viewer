import {
	PicoCAD2Viewer,
	PicoCAD2Context,
	type ViewerSettings,
	type ExtrasOptions,
	type PicoCAD2ViewerState,
	type RenderStats
} from 'picocad2-web';
import { DEFAULT_SETTINGS, DEFAULT_EXTRAS, CAMERA_LIMITS } from './constants';

type Stats = RenderStats & { fps: number };

class Viewer {
	settings = $state<ViewerSettings>({ ...DEFAULT_SETTINGS });
	extras = $state<Required<ExtrasOptions>>({ ...DEFAULT_EXTRAS });
	stats = $state<Stats>({ drawCalls: 0, polyCount: 0, fps: 0 });

	context!: PicoCAD2Context;
	pico!: PicoCAD2Viewer;

	init(canvas: HTMLCanvasElement) {
		this.context = new PicoCAD2Context();
		this.pico = new PicoCAD2Viewer({
			canvas,
			context: this.context,
			resolution: { width: 128, height: 128, scale: 4 }
		});

		this.pico.startRenderLoop();
		this.pico.enableCameraControls();
	}

	loadModel({ model, state }: { model?: string; state?: PicoCAD2ViewerState }) {
		const currentState = this.pico.getState();
		try {
			if (state) {
				this.pico.setState(state);
			} else if (model) {
				this.pico.load(model, true);
			}
		} catch (e) {
			console.error('Failed to load model:', e);
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

		this.updateState();
	}

	update(fn: (pico: PicoCAD2Viewer) => void) {
		fn(this.pico);
		this.updateState();
	}

	updateState() {
		const state = this.pico.getState();
		this.settings = state.settings;
		this.extras = state.extras;
	}

	getState() {
		return this.pico.getState();
	}

	getImage() {
		return this.pico.toDataURL();
	}
}

export const viewer = new Viewer();
