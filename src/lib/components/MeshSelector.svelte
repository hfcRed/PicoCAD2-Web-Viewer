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
		<div class="mesh-list scrollbar">
			{#each viewer.meshNames as entry (entry.name)}
				<label style:padding-left="{entry.depth * 1.25}rem" class:group={entry.group}>
					<input
						type="checkbox"
						checked={selected.includes(entry.name)}
						onchange={() => updateSelection(entry.name)}
					/>
					<span class="name">{entry.name}</span>
					{#if entry.group}<small>(group)</small>{/if}
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

	.name {
		min-width: 0;
	}

	.group small {
		flex-shrink: 0;
		color: var(--pico-muted-color);
	}
</style>
