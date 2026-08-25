<script lang="ts">
	import { viewer } from '$lib/viewer-state.svelte';
	import { rgbToHex } from '$lib/utils';

	interface Props {
		onChange: (selectedColors: number[]) => void;
	}

	let { onChange }: Props = $props();

	const selectedColors: number[] = [];

	function updateSelection(index: number) {
		if (selectedColors.includes(index)) {
			selectedColors.splice(selectedColors.indexOf(index), 1);
		} else {
			selectedColors.push(index);
		}

		onChange(selectedColors);
	}
</script>

{#if viewer.pico.modelInfo?.palette}
	<details>
		<summary>Color Mask</summary>
		<div class="color-grid">
			{#each viewer.pico.modelInfo?.palette as color, i (i)}
				<input
					type="checkbox"
					style="background-color: {rgbToHex(color)}"
					onchange={() => updateSelection(i)}
				/>
			{/each}
		</div>
	</details>
{/if}

<style>
	summary,
	.color-grid {
		padding: var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);
		border: var(--pico-border-width) solid var(--pico-form-element-border-color);
		border-radius: var(--pico-border-radius);
		background-color: var(--pico-form-element-background-color);
		display: flex;
		align-items: center;
	}

	summary {
		height: calc(
			1rem * var(--pico-line-height) + var(--pico-form-element-spacing-vertical) * 2 +
				var(--pico-border-width) * 2
		);
		margin-bottom: calc(var(--pico-spacing) * 0.5) !important;
	}

	.color-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(1.5rem, 1fr));
		gap: calc(var(--pico-spacing) * 0.5);
	}

	input {
		background-image: none !important;
		outline: 2px solid transparent !important;
		border: 2px solid transparent !important;
		box-shadow: none !important;
		transition: none !important;
		margin: 0;

		&:checked {
			outline: 2px solid white !important;
			border: 2px solid black !important;
			outline-offset: 1px !important;
		}
	}
</style>
