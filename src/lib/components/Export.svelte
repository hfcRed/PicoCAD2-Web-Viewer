<script lang="ts">
	import { compressState } from '../utils';
	import { viewer } from '../viewer-state.svelte';
	import Dialog from '$lib/components/Dialog.svelte';

	const resolutions = [
		{ label: '2048x2048', value: 2048 },
		{ label: '1024x1024', value: 1024 },
		{ label: '512x512', value: 512 },
		{ label: '256x256', value: 256 },
		{ label: '128x128', value: 128 },
		{ label: '64x64', value: 64 },
		{ label: '32x32', value: 32 }
	] as const;

	const scales = [
		{ label: '1x', value: 1 },
		{ label: '2x', value: 2 },
		{ label: '3x', value: 3 },
		{ label: '4x', value: 4 },
		{ label: '5x', value: 5 }
	] as const;

	let selectedResolution = $state(resolutions[4].value);
	let selectedScale = $state(scales[3].value);

	let generatedLink = $state<string | null>('');
	let embedLink = $state<string | null>('');
	let currentState = $state<string | null>('');

	function handleSelection() {
		viewer.update((pico) =>
			pico.setResolution(selectedResolution, selectedResolution, selectedScale)
		);
	}

	function generateLinks() {
		const param = compressState(viewer.getState());
		if (!param || param.length > 20000) {
			generatedLink = null;
			return;
		}

		generatedLink = `${window.location.origin}${window.location.pathname}?state=${param}`;
		embedLink = `<iframe width="512" height="512" src="${generatedLink}&embed=true" frameborder="0" allowfullscreen></iframe>`;
		console.log(`${generatedLink}&embed=true`);
	}

	function copyData(data: unknown) {
		if (!data || typeof data !== 'string') return;

		navigator.clipboard.writeText(data);
	}

	$effect(() => {
		void viewer.settings;
		void viewer.extras;

		generatedLink = '';
		embedLink = '';
		currentState = '';
	});
</script>

<fieldset class="grid gif">
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
	{#if selectedResolution >= 512}
		<p class="error record-error">
			Recording at resolutions at or above 512x512 may cause performance issues, crashes, or
			unwanted results if the scale is too high.
		</p>
	{/if}
</fieldset>

<hr />

<fieldset>
	<legend>
		<h4>Generate Link</h4>
	</legend>
	<input type="text" readonly value={generatedLink} />
	<div class="grid">
		<button onclick={() => generateLinks()}>Generate</button>
		<button disabled={!generatedLink} onclick={() => copyData(generatedLink)}>Copy</button>
	</div>
	{#if generatedLink === null}
		<p class="error">Model is too large to encode in a link!</p>
	{/if}
</fieldset>

<hr />

<fieldset>
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
		<Dialog buttonText="Embed" title="Iframe Embed Code">
			<p>
				An iframe embed code with the current state of the viewer encoded in the URL. This is ideal
				for embedding your model on websites, blogs, or sharing it with others without them needing
				to use the PicoCAD2-Web library directly.
			</p>
			<fieldset>
				<textarea class="state-text" value={embedLink} readonly></textarea>
				<div class="grid">
					<button onclick={() => generateLinks()}>Get Embed</button>
					<button disabled={!embedLink} onclick={() => copyData(embedLink)}>Copy</button>
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

	.record-error {
		grid-row: 3;
		grid-column: auto / span 2;
		margin-top: calc(var(--pico-typography-spacing-vertical) * -1);
	}

	.error {
		color: var(--pico-del-color);
	}

	.state-text {
		min-height: 25vh;
	}
</style>
