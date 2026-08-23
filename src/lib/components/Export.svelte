<script lang="ts">
	import { compressState, rgbToHex } from '../utils';
	import { viewer } from '../viewer-state.svelte';
	import Dialog from '$lib/components/Dialog.svelte';

	const resolutions = [
		{ label: '2048x2048', value: 2048 },
		{ label: '1024x1024', value: 1024 },
		{ label: '512x512', value: 512 },
		{ label: '256x256', value: 256 },
		{ label: '192x192', value: 192 },
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

	let generatedLink = $state<string | null>('');
	let embedLink = $state<string | null>('');
	let currentState = $state<string | null>('');

	function generateLinks() {
		const param = compressState(viewer.getState());
		if (!param || param.length > 20000) {
			generatedLink = null;
			return;
		}

		generatedLink = `${window.location.origin}${window.location.pathname}?state=${param}`;
		embedLink = `<iframe width="512" height="512" src="${generatedLink}&embed=true&background=${rgbToHex(viewer.settings.backgroundColor ?? [0, 0, 0]).replace('#', '')}" frameborder="0" allowfullscreen></iframe>`;
	}

	function copyData(data: unknown) {
		if (!data || typeof data !== 'string') return;

		navigator.clipboard.writeText(data);
	}

	function toggleCustomResolution() {
		viewer.update((pico) => {
			if (viewer.usingCustomResolution) {
				pico.setResolution(
					viewer.settings.resolution.width,
					viewer.settings.resolution.height,
					viewer.settings.resolution.scale
				);
			} else {
				pico.setResolution(128, 128, viewer.settings.resolution.scale);
			}
		});
	}

	$effect(() => {
		void viewer.settings;
		void viewer.extras;

		generatedLink = '';
		embedLink = '';
		currentState = '';
	});
</script>

<fieldset>
	<legend>
		<h4>Record Gif</h4>
	</legend>
	<label class="form-margin">
		<input
			type="checkbox"
			role="switch"
			bind:checked={viewer.usingCustomResolution}
			onchange={toggleCustomResolution}
		/>
		Custom resolution
	</label>
	<div class="grid gif">
		{#if viewer.usingCustomResolution}
			<label>
				Width
				<input
					class="no-margin"
					type="number"
					min="1"
					max="2048"
					bind:value={viewer.settings.resolution.width}
					onchange={() =>
						viewer.update((pico) =>
							pico.setResolution(
								viewer.settings.resolution.width,
								viewer.settings.resolution.height,
								viewer.settings.resolution.scale
							)
						)}
				/>
			</label>
			<label>
				Height
				<input
					class="no-margin"
					type="number"
					min="1"
					max="2048"
					bind:value={viewer.settings.resolution.height}
					onchange={() =>
						viewer.update((pico) =>
							pico.setResolution(
								viewer.settings.resolution.width,
								viewer.settings.resolution.height,
								viewer.settings.resolution.scale
							)
						)}
				/>
			</label>
		{:else}
			<label>
				Resolution
				<select
					bind:value={
						() => viewer.settings.resolution.width,
						(v) =>
							viewer.update((pico) => pico.setResolution(v, v, viewer.settings.resolution.scale))
					}
				>
					{#each resolutions as { label, value } (value)}
						<option {value} selected={value === viewer.settings.resolution.width}>{label}</option>
					{/each}
				</select>
			</label>
		{/if}
		<label>
			Scale
			<select
				bind:value={
					() => viewer.settings.resolution.scale,
					(v) =>
						viewer.update((pico) =>
							pico.setResolution(
								viewer.settings.resolution.width,
								viewer.settings.resolution.height,
								v
							)
						)
				}
			>
				{#each scales as { label, value } (value)}
					<option {value} selected={value === viewer.settings.resolution.scale}>{label}</option>
				{/each}
			</select>
		</label>
		<button
			class={{ 'custom-resolution': viewer.usingCustomResolution, record: true }}
			onclick={() => viewer.startGIFRecording()}
			disabled={viewer.gif.recording}
			type="submit">{viewer.gif.recording ? `${viewer.gif.progress}%` : 'Start'}</button
		>
	</div>
	{#if viewer.settings.resolution.width >= 512}
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

	.no-margin {
		margin-bottom: 0;
	}

	.record {
		grid-row: 2;
		grid-column: auto / span 2;

		&.custom-resolution {
			grid-column: auto / span 3;
		}
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
