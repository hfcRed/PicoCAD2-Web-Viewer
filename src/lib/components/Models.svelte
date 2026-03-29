<script lang="ts">
	import { PersistedState } from 'runed';
	import { compressState, decompressState } from '../utils';
	import { viewer } from '../viewer-state.svelte';

	interface SavedModel {
		state: string;
		image: string;
		selected: boolean;
		name: string;
	}

	const defaultModels = import.meta.glob<SavedModel>('/src/lib/example-models/*.json', {
		eager: true,
		import: 'default'
	});

	let savedModels = new PersistedState<SavedModel[]>('savedModels', [
		...Object.values(defaultModels)
	]);
	let savedSelected = $derived(savedModels.current.find((model) => model.selected));

	function saveModel() {
		const state = compressState(viewer.getState());
		const image = viewer.getImage();

		const existingIndex = savedModels.current.findIndex((model) => model.name === viewer.name);
		if (existingIndex !== -1) {
			const selected = savedModels.current[existingIndex].selected;
			savedModels.current.splice(existingIndex, 1);
			savedModels.current.unshift({ state, image, selected, name: viewer.name });
		} else {
			savedModels.current.unshift({ state, image, selected: false, name: viewer.name });
		}
	}

	function loadModel() {
		const model = savedModels.current.find((model) => model.selected);
		if (!model) return;

		const state = decompressState(model.state);
		if (!state) return;

		viewer.loadModel({ state });
		viewer.name = model.name;
	}

	function deleteModel() {
		const model = savedModels.current.find((model) => model.selected);
		if (!model) return;

		const index = savedModels.current.findIndex((m) => m.name === model.name);
		if (index === -1) return;

		savedModels.current.splice(index, 1);
		if (savedModels.current.length === 0) savedModels.disconnect();
	}
</script>

<div class="images-container">
	<label>
		Name
		<input type="text" autocomplete="off" autocorrect="off" bind:value={viewer.name} />
	</label>
	<fieldset class="grid">
		<button onclick={() => saveModel()} disabled={!viewer.loaded}>Save</button>
		<button onclick={() => loadModel()} disabled={!savedSelected}>Load</button>
		<button onclick={() => deleteModel()} disabled={!savedSelected}>Delete</button>
	</fieldset>
	<div class="img-display scrollbar">
		{#each savedModels.current as model, i (model.name)}
			<button
				class="btn-reset model-preview"
				data-selected={model.selected}
				onclick={() => {
					savedModels.current.forEach((m) => (m.selected = false));
					savedModels.current[i].selected = true;
				}}
			>
				<small>{model.name}</small>
				<img src={model.image} alt={model.name} draggable="false" />
			</button>
		{/each}
	</div>
</div>

<style>
	label {
		margin-bottom: -1rem;
	}

	.images-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		& img {
			width: 100%;
			aspect-ratio: 1 / 1;
		}
	}

	.img-display {
		border: var(--pico-border-width) solid var(--pico-form-element-border-color);
		border-radius: var(--pico-border-radius);
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(3, 1fr);
		gap: 0.5rem 0.25rem;
		padding: 0.5rem;
		background-color: var(--pico-form-element-background-color);
		aspect-ratio: 1 / 1;
		overflow-y: auto;

		& button {
			margin: 0;
			padding: 0;
			overflow: clip;
			border-radius: var(--pico-border-radius);
			border: 2px solid transparent;

			&:focus-visible,
			&[data-selected='true'] {
				border: 2px solid var(--pico-primary);
			}
		}
	}

	.model-preview {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		margin-bottom: 0.5rem;
		padding: 0.25rem;

		& small {
			background-color: var(--pico-initial-background-color);
			margin: 0;
			padding: 0.1rem 0.25rem;
			text-overflow: ellipsis;
			text-wrap: nowrap;
			overflow: hidden;
		}
	}
</style>
