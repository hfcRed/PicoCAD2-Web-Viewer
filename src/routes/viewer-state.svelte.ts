import {
	PicoCAD2Viewer,
	type ViewerSettings,
	type ExtrasOptions,
	type PicoCAD2ViewerState
} from 'picocad2-web';

export class Viewer {
	settings = $state<ViewerSettings>();
	extras = $state<Required<ExtrasOptions>>();
	pico!: PicoCAD2Viewer;

	init(canvas: HTMLCanvasElement) {
		this.pico = new PicoCAD2Viewer({
			canvas,
			resolution: { width: 128, height: 128, scale: 4 }
		});
	}

	loadModel(model: string, state?: PicoCAD2ViewerState) {
		if (state) {
			this.pico.setState(state);
		} else {
			this.pico.load(model);
		}

		this.pico.startRenderLoop();
		this.pico.enableCameraControls();

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
}
