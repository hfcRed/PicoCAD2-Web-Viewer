<script lang="ts">
	import Viewer from '../lib/components/Viewer.svelte';
</script>

<Viewer />

<!-- <input
	type="number"
	bind:value={
		() => viewer.settings.outlineSize, (v) => viewer.update((pico) => (pico.outlineSize = v))
	}
/> -->
