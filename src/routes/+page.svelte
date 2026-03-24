<script lang="ts">
	import { viewer } from './viewer-state.svelte';
	import { model } from './model';

	function runViewer(element: HTMLCanvasElement) {
		viewer.init(element);
		viewer.loadModel(JSON.stringify(model));
	}
</script>

<canvas {@attach runViewer}></canvas>

<input
	type="number"
	bind:value={
		() => viewer.settings.outlineSize, (v) => viewer.update((pico) => (pico.outlineSize = v))
	}
/>
