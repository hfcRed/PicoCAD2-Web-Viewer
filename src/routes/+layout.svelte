<script lang="ts">
	import { attachViewer } from '$lib/utils';
	import favicon from '$lib/assets/favicon.svg';

	import '../styles/normalize.css';
	import '../styles/pico.css';
	import '../styles/global.css';

	let { children, data } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#if data.embed}
	<canvas {@attach attachViewer} class="embed"></canvas>
{:else}
	<main class="container">{@render children()}</main>
{/if}

<style>
	:global {
		html:has(.embed) {
			overflow: hidden;

			body {
				overflow: hidden;
			}
		}
	}

	canvas {
		aspect-ratio: 1 / 1;
		width: 100% !important;
		height: auto !important;
	}
</style>
