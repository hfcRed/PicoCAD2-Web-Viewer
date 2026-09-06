<script lang="ts">
	import { viewer } from '../viewer-state.svelte';
	import NumericControl from '$lib/components/NumericControl.svelte';
	import EffectInfo from './EffectInfo.svelte';
	import MaskSelector from './MaskSelector.svelte';
	import MeshSelector from './MeshSelector.svelte';
	import PaletteSwapSelector from './PaletteSwapSelector.svelte';
	import { hexToRGB, rgbToHex } from '../utils';
	import { EFFECT_SECTIONS, type Control, type EffectKey } from '../effect-schema';

	function getValue(key: EffectKey, path: string): unknown {
		let value: unknown = viewer.extras[key];
		for (const part of path.split('.')) {
			value = (value as Record<string, unknown> | undefined)?.[part];
		}
		return value;
	}

	function setValue(key: EffectKey, path: string, value: unknown) {
		viewer.update((pico) => {
			const parts = path.split('.');
			const last = parts.pop()!;
			let target = pico.extras[key] as unknown as Record<string, unknown>;
			for (const part of parts) {
				target = target[part] as Record<string, unknown>;
			}
			target[last] = value;
		});
	}

	const num = (key: EffectKey, path: string) => getValue(key, path) as number;
	const bool = (key: EffectKey, path: string) => getValue(key, path) as boolean;
	const choice = (key: EffectKey, path: string) => getValue(key, path) as string | number;
	const hex = (key: EffectKey, path: string) =>
		rgbToHex(getValue(key, path) as [number, number, number]);
</script>

{#snippet controlInput(key: EffectKey, control: Control)}
	{#if control.kind === 'slider'}
		<NumericControl
			label={control.label}
			min={control.min}
			max={control.max}
			step={control.step}
			bind:value={() => num(key, control.path), (v) => setValue(key, control.path, v)}
		/>
	{:else if control.kind === 'select'}
		<label>
			{control.label}
			<select bind:value={() => choice(key, control.path), (v) => setValue(key, control.path, v)}>
				{#each control.options as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
		</label>
	{:else if control.kind === 'color'}
		<label>
			{control.label}
			<input
				type="color"
				bind:value={
					() => hex(key, control.path), (v: string) => setValue(key, control.path, hexToRGB(v))
				}
			/>
		</label>
	{:else if control.kind === 'colorList'}
		{@const colors = getValue(key, control.path) as [number, number, number][]}
		{#each colors, i (i)}
			<label>
				{control.label}
				{i + 1}
				<input
					type="color"
					bind:value={
						() => hex(key, `${control.path}.${i}`),
						(v: string) => setValue(key, `${control.path}.${i}`, hexToRGB(v))
					}
				/>
			</label>
		{/each}
	{:else if control.kind === 'toggle'}
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={() => bool(key, control.path), (v) => setValue(key, control.path, v)}
			/>
			{control.label}
		</label>
	{:else if control.kind === 'mask'}
		<MaskSelector
			selected={getValue(key, control.path) as number[]}
			title={control.title}
			onChange={(selectedColors) => setValue(key, control.path, selectedColors)}
		/>
	{:else if control.kind === 'meshes'}
		<MeshSelector
			selected={getValue(key, control.path) as string[]}
			title={control.title}
			onChange={(selectedMeshes) => setValue(key, control.path, selectedMeshes)}
		/>
	{:else if control.kind === 'paletteMap'}
		<PaletteSwapSelector onChange={(map) => setValue(key, control.path, map)} />
	{/if}
{/snippet}

<fieldset>
	<div class="effect">
		<label>
			Transparency
			<select
				bind:value={
					() => viewer.settings.transparency,
					(v) => viewer.update((pico) => (pico.transparency = v))
				}
			>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
		<EffectInfo
			description="How every fade against the background renders. The dissolve, the floor edge and its grid, shadow and reflection without a surface, twinkling particles, and the outlines around them. Dithered removes whole pixels through an ordered dither, so the image stays palette-pure and fades are still visible in GIFs with a transparent background. Smooth blends real alpha, which looks better over an opaque background. GIFs have no alpha and drop every partially transparent pixel, so recording over a transparent background always forces dithered fades and switches back afterwards."
		/>
	</div>
</fieldset>
<hr />

{#each EFFECT_SECTIONS as section, sectionIndex (section.title)}
	<div class="effect">
		<h3>{section.title}</h3>
		<EffectInfo description={section.info} />
	</div>
	{#each section.effects as effect, effectIndex (effect.key)}
		<fieldset>
			<div class="effect">
				<legend>
					<label class="form-collapse">
						<h4>{effect.title}</h4>
						<input
							type="checkbox"
							bind:checked={
								() => bool(effect.key, 'enabled'), (v) => setValue(effect.key, 'enabled', v)
							}
						/>
					</label>
				</legend>
				<EffectInfo description={effect.info} />
			</div>
			{#if bool(effect.key, 'enabled')}
				{#each effect.controls as control (control.path)}
					{#if !control.showIf || control.showIf(viewer.extras)}
						<div class="effect">
							<div>{@render controlInput(effect.key, control)}</div>
							<EffectInfo description={control.info} />
						</div>
					{/if}
				{/each}
			{/if}
		</fieldset>
		{#if sectionIndex < EFFECT_SECTIONS.length - 1 || effectIndex < section.effects.length - 1}
			<hr />
		{/if}
	{/each}
{/each}

<style>
	h3 {
		background-color: var(--pico-form-element-background-color);
		border: var(--pico-border-width) solid var(--pico-form-element-border-color);
		border-radius: var(--pico-border-radius);
		padding: var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);
		text-align: center;
	}

	.effect {
		display: grid;
		gap: var(--pico-form-element-spacing-horizontal);
		grid-template-columns: 1fr 1.25rem;
		align-items: center;
	}

	fieldset {
		margin-bottom: 0 !important;
	}

	hr {
		margin-top: 0 !important;
	}
</style>
