<script lang="ts">
	import { Tabs } from 'bits-ui';
	import { viewer } from '../viewer-state.svelte';
	import Camera from './Camera.svelte';
	import Settings from './Settings.svelte';
	import Extras from './Extras.svelte';
	import Models from './Models.svelte';
	import Export from './Export.svelte';
	import { attachViewer } from '$lib/utils';

	let tab = $state('models');

	function handleKeyDown(e: KeyboardEvent) {
		if (e.ctrlKey || e.metaKey) return;
		if (e.target !== document.body) return;

		if (e.key === '1') {
			tab = 'camera';
		} else if (e.key === '2') {
			tab = 'settings';
		} else if (e.key === '3') {
			tab = 'extras';
		} else if (e.key === '4') {
			tab = 'models';
		} else if (e.key === '5') {
			tab = 'export';
		}
	}

	function loadFromString(text: string) {
		const json = JSON.parse(text || '{}');
		const isState = !!json.source;

		if (isState) {
			viewer.loadModel({ state: json });
		} else {
			viewer.loadModel({ model: text });
		}
	}

	function handleFile(file: File) {
		const reader = new FileReader();
		reader.onload = (event) => {
			const content = event.target?.result;
			if (typeof content === 'string') {
				loadFromString(content);
			}
		};
		reader.readAsText(file);
	}

	function getFile(items: DataTransferItemList | undefined): File | null {
		if (!items) return null;

		for (const item of items) {
			if (item.kind === 'file') {
				return item.getAsFile();
			}
		}

		return null;
	}

	function handlePaste(e: ClipboardEvent) {
		const file = getFile(e.clipboardData?.items);
		if (file) return handleFile(file);

		const text = e.clipboardData?.getData('text/plain');
		if (text) loadFromString(text);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();

		const file = getFile(e.dataTransfer?.items);
		if (file) return handleFile(file);

		const text = e.dataTransfer?.getData('text/plain');
		if (text) loadFromString(text);
	}
</script>

<svelte:window
	onkeydown={handleKeyDown}
	onpaste={handlePaste}
	ondrop={handleDrop}
	ondragenter={(e: Event) => e.preventDefault()}
	ondragover={(e: Event) => e.preventDefault()}
	ondragleave={(e: Event) => e.preventDefault()}
/>

<div class="grid-container">
	<div class="canvas-container">
		<div class="canvas-wrapper">
			<canvas {@attach attachViewer}></canvas>
			{#if !viewer.loaded}
				<small
					>Drag and drop or copy and paste a model file or string to load it into the viewer</small
				>
			{/if}
		</div>
		<div class="stats">
			<small>FPS: {viewer.stats.fps}</small>
			<small>Draw Calls: {viewer.stats.drawCalls}</small>
			<small>Poly Count: {viewer.stats.polyCount}</small>
		</div>
	</div>
	<Tabs.Root orientation="horizontal" bind:value={tab}>
		<Tabs.List>
			{#snippet child()}
				<div class="tablist-container scrollbar">
					<div class="tablist">
						<Tabs.Trigger value="camera" disabled={!viewer.loaded}>
							{#snippet child({ props })}
								<div class="tab">
									<button class="btn-reset" {...props}>Camera</button>
								</div>
							{/snippet}
						</Tabs.Trigger>
						<Tabs.Trigger value="settings" disabled={!viewer.loaded}>
							{#snippet child({ props })}
								<div class="tab">
									<button class="btn-reset" {...props}>Settings</button>
								</div>
							{/snippet}
						</Tabs.Trigger>
						<Tabs.Trigger value="extras" disabled={!viewer.loaded}>
							{#snippet child({ props })}
								<div class="tab">
									<button class="btn-reset" {...props}>Extras</button>
								</div>
							{/snippet}
						</Tabs.Trigger>
						<Tabs.Trigger value="models">
							{#snippet child({ props })}
								<div class="tab">
									<button class="btn-reset" {...props}>Models</button>
								</div>
							{/snippet}
						</Tabs.Trigger>
						<Tabs.Trigger value="export" disabled={!viewer.loaded}>
							{#snippet child({ props })}
								<div class="tab">
									<button class="btn-reset" {...props}>Export</button>
								</div>
							{/snippet}
						</Tabs.Trigger>
					</div>
				</div>
			{/snippet}
		</Tabs.List>
		<Tabs.Content value="camera">
			<Camera />
		</Tabs.Content>
		<Tabs.Content value="settings">
			<Settings />
		</Tabs.Content>
		<Tabs.Content value="extras">
			<Extras />
		</Tabs.Content>
		<Tabs.Content value="models">
			<Models />
		</Tabs.Content>
		<Tabs.Content value="export">
			<Export />
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	.grid-container {
		margin-bottom: calc(var(--pico-typography-spacing-vertical) * 2);
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;

		@media (max-width: 768px) {
			grid-template-columns: 1fr;
			padding: 0;
		}
	}

	.canvas-container {
		background-color: var(--pico-initial-background-color);
		position: sticky;
		top: 2rem;
		left: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
		aspect-ratio: 1 / 1;
		z-index: 10;

		canvas {
			border: var(--pico-border-width) solid var(--pico-form-element-border-color);
			border-radius: var(--pico-border-radius);
			background-color: var(--pico-form-element-background-color);
			aspect-ratio: 1 / 1;
			width: 100% !important;
			height: auto !important;
		}
	}

	.canvas-wrapper {
		position: relative;

		small {
			color: var(--pico-muted-color);
			position: absolute;
			inset: 0;
			top: 50%;
			padding-inline: 5rem;
			text-align: center;
			text-wrap: balance;
		}
	}

	.stats {
		padding-bottom: 0.5rem;
		display: flex;
		gap: 0.5rem;

		small {
			color: var(--pico-muted-color);
		}
	}

	.tablist-container {
		margin-bottom: 1rem;
		padding-bottom: 0.5rem;
		overflow-x: auto;
		overflow-y: hidden;
	}

	.tablist {
		border-bottom: 3px solid var(--pico-form-element-border-color);
		display: flex;
		min-width: fit-content;
	}

	.tab {
		min-width: fit-content;
		margin-bottom: -3px;

		& button {
			border-bottom: 3px solid transparent;
			padding: 0 0.5rem 0.5rem 0.5rem;
			font-weight: 600;

			&[aria-selected='true'] {
				color: var(--pico-h2-color);
				border-bottom: 3px solid var(--pico-primary);
			}
		}
	}
</style>
