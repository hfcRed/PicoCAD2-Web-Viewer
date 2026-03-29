<script lang="ts">
	import { viewer } from '../viewer-state.svelte';
	import { hexToRGB, rgbToHex } from '../utils';
	import NumericControl from '$lib/components/NumericControl.svelte';

	let customBackground = $state(!!viewer.settings.backgroundColor);
	let lastBackgroundColor = $state(viewer.settings.backgroundColor);

	function handleBackgroundToggle(e: Event) {
		const checked = (e.currentTarget as HTMLInputElement).checked;

		if (!checked) {
			lastBackgroundColor = viewer.settings.backgroundColor;
			viewer.update((pico) => (pico.backgroundColor = null));
		} else {
			viewer.update((pico) => (pico.backgroundColor = lastBackgroundColor));
		}
	}

	function handleTagInput(rawValue: string, side: 'left' | 'right') {
		const value = rawValue === '' ? null : rawValue;
		const key = `${side}Tag` as const;

		if (!value) {
			viewer.update((pico) => (pico[key] = null));
			return;
		}

		viewer.update(
			(pico) =>
				(pico[key] = {
					text: value,
					color: viewer.settings[key]?.color
				})
		);
	}
</script>

<fieldset>
	<legend>
		<h4>Rendering</h4>
	</legend>
	<label>
		Render Mode
		<select
			bind:value={
				() => viewer.settings.renderMode, (v) => viewer.update((pico) => (pico.renderMode = v))
			}
		>
			<option value="texture">Texture</option>
			<option value="color">Color</option>
			<option value="none">None</option>
		</select>
	</label>
	<label class="form-margin">
		<input
			type="checkbox"
			role="switch"
			bind:checked={
				() => viewer.settings.shading, (v) => viewer.update((pico) => (pico.shading = v))
			}
		/>
		Shading
	</label>
</fieldset>

<hr />

<fieldset>
	<legend>
		<h4>Outline</h4>
	</legend>
	<NumericControl
		label="Size"
		min={0}
		max={10}
		step={1}
		bind:value={
			() => viewer.settings.outlineSize, (v) => viewer.update((pico) => (pico.outlineSize = v))
		}
	/>
	<label>
		Color
		<input
			type="color"
			bind:value={
				() => rgbToHex(viewer.settings.outlineColor),
				(v: string) => viewer.update((pico) => (pico.outlineColor = hexToRGB(v)))
			}
		/>
	</label>
</fieldset>

<hr />

<fieldset>
	<legend>
		<h4>Tags</h4>
	</legend>
	<label>
		Left Text
		<input
			type="text"
			bind:value={() => viewer.settings.leftTag?.text ?? '', (v) => handleTagInput(v, 'left')}
			placeholder="Left Tag Text"
		/>
	</label>
	<label>
		Left Color
		<input
			type="color"
			bind:value={
				() => rgbToHex(viewer.settings.leftTag?.color ?? [0, 0, 0]),
				(v: string) =>
					viewer.update((pico) =>
						pico.leftTag ? (pico.leftTag = { ...pico.leftTag, color: hexToRGB(v) }) : null
					)
			}
		/>
	</label>
	<label>
		Right Text
		<input
			type="text"
			bind:value={() => viewer.settings.rightTag?.text ?? '', (v) => handleTagInput(v, 'right')}
			placeholder="Right Tag Text"
		/>
	</label>
	<label>
		Right Color
		<input
			type="color"
			bind:value={
				() => rgbToHex(viewer.settings.rightTag?.color ?? [0, 0, 0]),
				(v: string) =>
					viewer.update((pico) =>
						pico.rightTag ? (pico.rightTag = { ...pico.rightTag, color: hexToRGB(v) }) : null
					)
			}
		/>
	</label>
</fieldset>

<hr />

<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Background Color</h4>
			<input
				type="checkbox"
				bind:checked={customBackground}
				onchange={(e) => handleBackgroundToggle(e)}
			/>
		</label>
	</legend>
	{#if customBackground}
		<input
			type="color"
			bind:value={
				() => (lastBackgroundColor ? rgbToHex(lastBackgroundColor) : '#000000'),
				(v: string) => {
					const rgb = hexToRGB(v);
					viewer.update((pico) => (pico.backgroundColor = rgb));
					lastBackgroundColor = rgb;
				}
			}
		/>
	{/if}
</fieldset>

<hr />

<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Scanlines</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.settings.scanlines, (v) => viewer.update((pico) => (pico.scanlines = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.settings.scanlines}
		<label>
			Scanline Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.settings.scanlineColor),
					(v: string) => viewer.update((pico) => (pico.scanlineColor = hexToRGB(v)))
				}
			/>
		</label>
	{/if}
</fieldset>

<hr />

<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Animation</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.settings.animation.playing,
					(v) => viewer.update((pico) => (pico.animation.playing = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.settings.animation.playing}
		<NumericControl
			label="Speed"
			min={0}
			max={5}
			step={0.1}
			bind:value={
				() => viewer.settings.animation.speed,
				(v) => viewer.update((pico) => (pico.animation.speed = v))
			}
		/>
		<NumericControl
			label="Time"
			min={0}
			max={4}
			step={0.01}
			bind:value={
				() => viewer.settings.animation.time,
				(v) => viewer.update((pico) => (pico.animation.time = v))
			}
		/>
		<label>
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.settings.animation.loop,
					(v) => viewer.update((pico) => (pico.animation.loop = v))
				}
			/>
			Loop
		</label>
	{/if}
</fieldset>
