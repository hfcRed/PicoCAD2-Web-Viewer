<script lang="ts">
	import { viewer } from '$lib/viewer-state.svelte';
	import { rgbToHex } from '$lib/utils';

	interface Props {
		onChange: (map: number[]) => void;
		title?: string;
	}

	let { onChange, title }: Props = $props();

	function currentTarget(index: number) {
		const target = viewer.extras.paletteSwap.map?.[index];
		return Number.isInteger(target) && target! >= 0 && target! < 16 ? target! : index;
	}

	function updateSwap(source: number, target: number) {
		const map = Array.from({ length: 16 }, (_, i) => currentTarget(i));
		map[source] = target;
		onChange(map);
	}
</script>

{#if viewer.pico.modelInfo?.palette}
	{@const palette = viewer.pico.modelInfo.palette}
	<details>
		<summary>{title ?? 'Color Swap'}</summary>
		<div class="swap-list">
			{#each palette as color, i (i)}
				<div class="swap-row">
					<span class="source" style="background-color: {rgbToHex(color)}"></span>
					<div class="color-grid">
						{#each palette as target, j (j)}
							<input
								type="radio"
								name="palette-swap-{i}"
								style="background-color: {rgbToHex(target)}"
								checked={currentTarget(i) === j}
								onchange={() => updateSwap(i, j)}
							/>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</details>
{/if}

<style>
	summary,
	.swap-list {
		padding: var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);
		border: var(--pico-border-width) solid var(--pico-form-element-border-color);
		border-radius: var(--pico-border-radius);
		background-color: var(--pico-form-element-background-color);
	}

	summary {
		display: flex;
		align-items: center;
		height: calc(
			1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 +
				var(--pico-border-width) * 2
		);
		margin-bottom: calc(var(--pico-spacing) * 0.5) !important;
	}

	.swap-list {
		display: flex;
		flex-direction: column;
		gap: calc(var(--pico-spacing) * 0.5);
	}

	.swap-row {
		display: grid;
		grid-template-columns: 1.5rem 1fr;
		align-items: center;
		gap: calc(var(--pico-spacing) * 0.5);
	}

	.source {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: var(--pico-border-radius);
		outline: 2px solid white;
		border: 2px solid black;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: calc(var(--pico-spacing) * 0.25);
	}

	input {
		background-image: none !important;
		outline: 2px solid transparent !important;
		border: 2px solid transparent !important;
		box-shadow: none !important;
		transition: none !important;
		border-radius: var(--pico-border-radius) !important;
		margin: 0;
		width: 100%;
		aspect-ratio: 1;
		height: auto;

		&:checked {
			outline: 2px solid white !important;
			border: 2px solid black !important;
			outline-offset: 1px !important;
		}
	}
</style>
