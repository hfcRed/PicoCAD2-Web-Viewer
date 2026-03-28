<script lang="ts">
	import { compressState } from './utils';
	import { viewer } from './viewer-state.svelte';
	import Dialog from '$lib/components/Dialog.svelte';

	const resolutions = [
		{ label: '192x192', value: 192 },
		{ label: '128x128', value: 128 },
		{ label: '64x64', value: 64 }
	] as const;

	const scales = [
		{ label: '1x', value: 1 },
		{ label: '2x', value: 2 },
		{ label: '3x', value: 3 },
		{ label: '4x', value: 4 },
		{ label: '5x', value: 5 }
	] as const;

	let selectedResolution = $state(resolutions[1].value);
	let selectedScale = $state(scales[3].value);

	let generatedLink = $state<string | null>('');
	let currentState = $state<string | null>('');

	function handleSelection() {
		viewer.update((pico) =>
			pico.setResolution(selectedResolution, selectedResolution, selectedScale)
		);
	}

	function generateLink() {
		const param = compressState(viewer.getState());
		if (!param || param.length > 20000) {
			generatedLink = null;
			return;
		}

		generatedLink = `${window.location.origin}${window.location.pathname}?state=${param}`;
	}

	function copyData(data: unknown) {
		if (!data || typeof data !== 'string') return;

		navigator.clipboard.writeText(data);
	}

	$effect(() => {
		void viewer.settings;
		void viewer.extras;

		generatedLink = '';
		currentState = '';
	});
</script>

<fieldset class="grid gif" disabled={!viewer.loaded}>
	<legend>
		<h4>Record Gif</h4>
	</legend>
	<label>
		Resolution
		<select bind:value={selectedResolution} onchange={() => handleSelection()}>
			{#each resolutions as { label, value } (value)}
				<option {value} selected={value === selectedResolution}>{label}</option>
			{/each}
		</select>
	</label>
	<label>
		Scale
		<select bind:value={selectedScale} onchange={() => handleSelection()}>
			{#each scales as { label, value } (value)}
				<option {value} selected={value === selectedScale}>{label}</option>
			{/each}
		</select>
	</label>
	<button
		class="record"
		onclick={() => viewer.startGIFRecording()}
		disabled={viewer.gif.recording}
		type="submit">{viewer.gif.recording ? `${viewer.gif.progress}%` : 'Start'}</button
	>
</fieldset>

<hr />

<fieldset disabled={!viewer.loaded}>
	<legend>
		<h4>Generate Link</h4>
	</legend>
	<input type="text" readonly value={generatedLink} />
	<div class="grid">
		<button onclick={() => generateLink()}>Generate</button>
		<button disabled={!generatedLink} onclick={() => copyData(generatedLink)}>Copy</button>
	</div>
	{#if generatedLink === null}
		<p class="error">Model is too large to encode in a link!</p>
	{/if}
</fieldset>

<hr />

<fieldset disabled={!viewer.loaded}>
	<legend>
		<h4>Export Formats</h4>
	</legend>
	<div class="grid">
		<Dialog buttonText="State" title="Export Viewer State">
			<p>
				The current state of the viewer as an object. When using the PicoCAD2-Web library, you can
				pass this object into the Viewers <code>setState()</code> function to load the model and its settings.
			</p>
			<fieldset>
				<textarea class="state-text" value={currentState} readonly></textarea>
				<div class="grid">
					<button onclick={() => (currentState = JSON.stringify(viewer.getState(), null, 2))}
						>Get State</button
					>
					<button disabled={!currentState} onclick={() => copyData(currentState)}>Copy</button>
				</div>
			</fieldset>
		</Dialog>
		<Dialog buttonText="Compressed" title="Export Compressed Viewer State">
			<p>
				The current state of the viewer, compressed using LZString's <code
					>compressToEncodedURIComponent()</code
				>
				function. This is mostly for internal usage, but can be useful if you want to store models to
				a database or share them in a more compact form.
			</p>
			<fieldset>
				<textarea
					class="state-text"
					value={currentState ? compressState(JSON.parse(currentState)) : ''}
					readonly
				></textarea>
				<div class="grid">
					<button onclick={() => (currentState = JSON.stringify(viewer.getState(), null, 2))}
						>Get State</button
					>
					<button disabled={!currentState} onclick={() => copyData(currentState)}>Copy</button>
				</div>
			</fieldset>
		</Dialog>
	</div>
</fieldset>

<style>
	.grid.gif {
		grid-template-rows: auto auto;

		select,
		label {
			margin-bottom: 0;
		}
	}

	.record {
		grid-row: 2;
		grid-column: auto / span 2;
	}

	.error {
		color: var(--pico-del-color);
	}

	.state-text {
		min-height: 25vh;
	}
</style>
