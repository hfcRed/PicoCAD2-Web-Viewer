<script lang="ts">
	import { onMount } from 'svelte';
	import { Tabs } from 'bits-ui';
	import { viewer } from './viewer-state.svelte';
	import { model } from './model';
	import Camera from './Camera.svelte';
	import Settings from './Settings.svelte';

	let viewportCanvas: HTMLCanvasElement;

	let tab = $state('camera');

	onMount(() => {
		viewer.init(viewportCanvas);
		viewer.loadModel(JSON.stringify(model));

		const handleKeyDown = (e: KeyboardEvent) => {
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
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => window.removeEventListener('keydown', handleKeyDown);
	});
</script>

<div class="grid-container">
	<div class="canvas-container">
		<canvas bind:this={viewportCanvas}></canvas>
	</div>
	<Tabs.Root orientation="horizontal" bind:value={tab}>
		<Tabs.List>
			{#snippet child()}
				<div class="tablist-container scrollbar">
					<div class="tablist">
						<Tabs.Trigger value="camera">
							{#snippet child({ props })}
								<div class="tab">
									<button class="btn-reset" {...props}>Camera</button>
								</div>
							{/snippet}
						</Tabs.Trigger>
						<Tabs.Trigger value="settings">
							{#snippet child({ props })}
								<div class="tab">
									<button class="btn-reset" {...props}>Settings</button>
								</div>
							{/snippet}
						</Tabs.Trigger>
						<Tabs.Trigger value="extras">
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
			<!-- <Extras /> -->
		</Tabs.Content>
		<Tabs.Content value="models">
			<!-- <Models /> -->
		</Tabs.Content>
	</Tabs.Root>
</div>

<style>
	.grid-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 1rem 0;

		@media (max-width: 768px) {
			grid-template-columns: 1fr;
			padding: 0;
		}
	}

	.canvas-container {
		padding-top: 2rem;
		position: sticky;
		top: 0;
		left: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
		aspect-ratio: 1 / 1;
		z-index: 10;

		canvas {
			border: var(--pico-border-width) solid var(--pico-form-element-border-color);
			border-radius: var(--pico-border-radius);
			background-color: black;
			aspect-ratio: 1 / 1;
			width: 100% !important;
			height: auto !important;
		}
	}

	.btn-reset {
		--pico-color: var(--pico-color) !important;
		color: var(--pico-color);
		background-color: transparent;
		outline: none;
		border: none;
		border-radius: 0;
		margin: 0;
		padding: 0;
		box-shadow: none;
		transition: none;
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
