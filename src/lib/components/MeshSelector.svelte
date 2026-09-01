<script lang="ts">
	import { viewer } from '$lib/viewer-state.svelte';

	interface Props {
		selected: string[];
		onChange: (selectedMeshes: string[]) => void;
		title?: string;
	}

	let { selected, onChange, title }: Props = $props();

	function updateSelection(name: string) {
		const next = selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name];

		onChange(next);
	}
</script>

{#if viewer.meshNames.length > 0}
	<details>
		<summary>{title ?? 'Mesh Selection'}</summary>
		<div class="mesh-list">
			{#each viewer.meshNames as name (name)}
				<label>
					<input
						type="checkbox"
						checked={selected.includes(name)}
						onchange={() => updateSelection(name)}
					/>
					{name}
				</label>
			{/each}
		</div>
	</details>
{/if}

<style>
	summary,
	.mesh-list {
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

	.mesh-list {
		display: flex;
		flex-direction: column;
		gap: calc(var(--pico-spacing) * 0.25);
		max-height: 12rem;
		overflow-y: auto;
	}

	label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin: 0;
		overflow-wrap: anywhere;
	}

	input {
		margin: 0;
		flex-shrink: 0;
	}
</style>
