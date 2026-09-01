<script lang="ts">
	import { viewer } from '../viewer-state.svelte';
	import NumericControl from '$lib/components/NumericControl.svelte';
	import { hexToRGB, rgbToHex } from '../utils';
	import MaskSelector from './MaskSelector.svelte';
	import MeshSelector from './MeshSelector.svelte';
	import PaletteSwapSelector from './PaletteSwapSelector.svelte';
</script>

<p>
	Effects apply in the same order they are listed. With an opaque background, disabling
	<code>Model Only</code> on any effect applies all following effects to the entire screen as well. With
	a transparent background, following effects only apply to the pixels earlier effects painted (like bloom
	glow). Fully transparent areas stay untouched.
</p>
<p>
	Effects can also produce partially transparent pixels if the background is transparent, which the
	GIF format does not support, so those pixels will not appear in exported GIFs. Keep <code
		>Model Only</code
	> enabled if you need clean GIF exports with a transparent background.
</p>

<h3>Material Effects</h3>

<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Color Palette</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.paletteSwap.enabled!,
					(v) => viewer.update((pico) => (pico.extras.paletteSwap.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.paletteSwap.enabled}
		<PaletteSwapSelector
			onChange={(map) => viewer.update((pico) => (pico.extras.paletteSwap.map = map))}
		/>
		<MaskSelector
			selected={viewer.extras.paletteSwap.cycleIndices!}
			title="Colors to Cycle"
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.paletteSwap.cycleIndices = selectedColors))}
		/>
		<NumericControl
			label="Cycle Speed"
			min={0}
			max={20}
			step={1}
			bind:value={
				() => viewer.extras.paletteSwap.cycleSpeed!,
				(v) => viewer.update((pico) => (pico.extras.paletteSwap.cycleSpeed = v))
			}
		/>
		<NumericControl
			label="Blend Time"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.paletteSwap.cycleBlendTime!,
				(v) => viewer.update((pico) => (pico.extras.paletteSwap.cycleBlendTime = v))
			}
		/>
		<label>
			Blend Style
			<select
				bind:value={
					() => viewer.extras.paletteSwap.cycleStyle!,
					(v) => viewer.update((pico) => (pico.extras.paletteSwap.cycleStyle = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Cutout</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.colorCutout.enabled!,
					(v) => viewer.update((pico) => (pico.extras.colorCutout.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.colorCutout.enabled}
		<MaskSelector
			selected={viewer.extras.colorCutout.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.colorCutout.maskedColors = selectedColors))}
		/>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Dissolve</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.dissolve.enabled!,
					(v) => viewer.update((pico) => (pico.extras.dissolve.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.dissolve.enabled}
		<MaskSelector
			selected={viewer.extras.dissolve.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.dissolve.maskedColors = selectedColors))}
		/>
		<label>
			Mode
			<select
				bind:value={
					() => viewer.extras.dissolve.mode!,
					(v) => viewer.update((pico) => (pico.extras.dissolve.mode = v))
				}
			>
				<option value="noise">Noise</option>
				<option value="directional">Directional</option>
				<option value="point">Point</option>
				<option value="proximity">Proximity</option>
			</select>
		</label>
		<NumericControl
			label="Progress"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.progress!,
				(v) => viewer.update((pico) => (pico.extras.dissolve.progress = v))
			}
		/>
		<NumericControl
			label="Scale"
			min={0}
			max={10}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.scale!,
				(v) => viewer.update((pico) => (pico.extras.dissolve.scale = v))
			}
		/>
		<NumericControl
			label="Softness"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.softness!,
				(v) => viewer.update((pico) => (pico.extras.dissolve.softness = v))
			}
		/>
		<NumericControl
			label="Edge Width"
			min={0}
			max={10}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.edgeWidth!,
				(v) => viewer.update((pico) => (pico.extras.dissolve.edgeWidth = v))
			}
		/>
		<label>
			Edge Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.dissolve.edgeColor!),
					(v: string) => viewer.update((pico) => (pico.extras.dissolve.edgeColor = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Direction X"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.direction![0],
				(v) => viewer.update((pico) => (pico.extras.dissolve.direction[0] = v))
			}
		/>
		<NumericControl
			label="Direction Y"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.direction![1],
				(v) => viewer.update((pico) => (pico.extras.dissolve.direction[1] = v))
			}
		/>
		<NumericControl
			label="Direction Z"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.direction![2],
				(v) => viewer.update((pico) => (pico.extras.dissolve.direction[2] = v))
			}
		/>
		<NumericControl
			label="Point X"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.point![0],
				(v) => viewer.update((pico) => (pico.extras.dissolve.point[0] = v))
			}
		/>
		<NumericControl
			label="Point Y"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.point![1],
				(v) => viewer.update((pico) => (pico.extras.dissolve.point[1] = v))
			}
		/>
		<NumericControl
			label="Point Z"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.dissolve.point![2],
				(v) => viewer.update((pico) => (pico.extras.dissolve.point[2] = v))
			}
		/>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.dissolve.style!,
					(v) => viewer.update((pico) => (pico.extras.dissolve.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
		<label>
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.dissolve.invert!,
					(v) => viewer.update((pico) => (pico.extras.dissolve.invert = v))
				}
			/>
			Invert
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Emission</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.emission.enabled!,
					(v) => viewer.update((pico) => (pico.extras.emission.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.emission.enabled}
		<MaskSelector
			selected={viewer.extras.emission.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.emission.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Strength"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.emission.strength!,
				(v) => viewer.update((pico) => (pico.extras.emission.strength = v))
			}
		/>
		<label>
			Blink Mode
			<select
				bind:value={
					() => viewer.extras.emission.blinkMode!,
					(v) => viewer.update((pico) => (pico.extras.emission.blinkMode = v))
				}
			>
				<option value="smooth">Smooth</option>
				<option value="pulse">Pulse</option>
			</select>
		</label>
		<NumericControl
			label="Blink Rate"
			min={0}
			max={20}
			step={0.1}
			bind:value={
				() => viewer.extras.emission.blinkRate!,
				(v) => viewer.update((pico) => (pico.extras.emission.blinkRate = v))
			}
		/>
		<NumericControl
			label="Blink Minimum"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.emission.blinkMin!,
				(v) => viewer.update((pico) => (pico.extras.emission.blinkMin = v))
			}
		/>
		<NumericControl
			label="Scroll Gap"
			min={0}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.emission.scrollGap!,
				(v) => viewer.update((pico) => (pico.extras.emission.scrollGap = v))
			}
		/>
		<NumericControl
			label="Scroll Width"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.emission.scrollWidth!,
				(v) => viewer.update((pico) => (pico.extras.emission.scrollWidth = v))
			}
		/>
		<NumericControl
			label="Scroll Speed"
			min={-10}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.emission.scrollSpeed!,
				(v) => viewer.update((pico) => (pico.extras.emission.scrollSpeed = v))
			}
		/>
		<NumericControl
			label="Scroll Direction X"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.emission.scrollDirection![0],
				(v) => viewer.update((pico) => (pico.extras.emission.scrollDirection[0] = v))
			}
		/>
		<NumericControl
			label="Scroll Direction Y"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.emission.scrollDirection![1],
				(v) => viewer.update((pico) => (pico.extras.emission.scrollDirection[1] = v))
			}
		/>
		<NumericControl
			label="Scroll Direction Z"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.emission.scrollDirection![2],
				(v) => viewer.update((pico) => (pico.extras.emission.scrollDirection[2] = v))
			}
		/>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.emission.style!,
					(v) => viewer.update((pico) => (pico.extras.emission.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Interior</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.interior.enabled!,
					(v) => viewer.update((pico) => (pico.extras.interior.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.interior.enabled}
		<MaskSelector
			selected={viewer.extras.interior.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.interior.maskedColors = selectedColors))}
		/>
		<label>
			Pattern
			<select
				bind:value={
					() => viewer.extras.interior.pattern!,
					(v) => viewer.update((pico) => (pico.extras.interior.pattern = v))
				}
			>
				<option value="stars">Stars</option>
				<option value="dust">Dust</option>
				<option value="voronoi">Voronoi</option>
				<option value="lava">Lava</option>
				<option value="grid">Grid</option>
				<option value="truchet">Truchet</option>
				<option value="constellations">Constellations</option>
			</select>
		</label>
		<NumericControl
			label="Depth"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.interior.depth!,
				(v) => viewer.update((pico) => (pico.extras.interior.depth = v))
			}
		/>
		<NumericControl
			label="Layers"
			min={1}
			max={5}
			step={1}
			bind:value={
				() => viewer.extras.interior.layers!,
				(v) => viewer.update((pico) => (pico.extras.interior.layers = v))
			}
		/>
		<NumericControl
			label="Scale"
			min={0}
			max={20}
			step={0.1}
			bind:value={
				() => viewer.extras.interior.scale!,
				(v) => viewer.update((pico) => (pico.extras.interior.scale = v))
			}
		/>
		<NumericControl
			label="Speed"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.interior.speed!,
				(v) => viewer.update((pico) => (pico.extras.interior.speed = v))
			}
		/>
		<label>
			Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.interior.color!),
					(v: string) => viewer.update((pico) => (pico.extras.interior.color = hexToRGB(v)))
				}
			/>
		</label>
		<label>
			Background Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.interior.backgroundColor!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.interior.backgroundColor = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Hue Range"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.interior.hueRange!,
				(v) => viewer.update((pico) => (pico.extras.interior.hueRange = v))
			}
		/>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.interior.style!,
					(v) => viewer.update((pico) => (pico.extras.interior.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.interior.randomHue!,
					(v) => viewer.update((pico) => (pico.extras.interior.randomHue = v))
				}
			/>
			Random Hue
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Gradient Light</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.gradientLight.enabled!,
					(v) => viewer.update((pico) => (pico.extras.gradientLight.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.gradientLight.enabled}
		<MaskSelector
			selected={viewer.extras.gradientLight.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.gradientLight.maskedColors = selectedColors))}
		/>
		<label>
			Lit Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.gradientLight.litColor!),
					(v: string) => viewer.update((pico) => (pico.extras.gradientLight.litColor = hexToRGB(v)))
				}
			/>
		</label>
		<label>
			Shadow Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.gradientLight.shadowColor!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.gradientLight.shadowColor = hexToRGB(v)))
				}
			/>
		</label>
		<label>
			Source
			<select
				bind:value={
					() => viewer.extras.gradientLight.source!,
					(v) => viewer.update((pico) => (pico.extras.gradientLight.source = v))
				}
			>
				<option value="light">Light</option>
				<option value="worldY">World Y</option>
				<option value="screenY">Screen Y</option>
			</select>
		</label>
		<NumericControl
			label="Blend"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.gradientLight.blend!,
				(v) => viewer.update((pico) => (pico.extras.gradientLight.blend = v))
			}
		/>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.gradientLight.style!,
					(v) => viewer.update((pico) => (pico.extras.gradientLight.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Specular</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.specular.enabled!,
					(v) => viewer.update((pico) => (pico.extras.specular.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.specular.enabled}
		<MaskSelector
			selected={viewer.extras.specular.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.specular.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Strength"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.specular.strength!,
				(v) => viewer.update((pico) => (pico.extras.specular.strength = v))
			}
		/>
		<NumericControl
			label="Smoothness"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.specular.smoothness!,
				(v) => viewer.update((pico) => (pico.extras.specular.smoothness = v))
			}
		/>
		<label>
			Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.specular.color!),
					(v: string) => viewer.update((pico) => (pico.extras.specular.color = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Anisotropy"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.specular.anisotropy!,
				(v) => viewer.update((pico) => (pico.extras.specular.anisotropy = v))
			}
		/>
		<NumericControl
			label="Environment Strength"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.specular.environment!.strength!,
				(v) => viewer.update((pico) => (pico.extras.specular.environment.strength = v))
			}
		/>
		<label>
			Sky Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.specular.environment!.skyColor!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.specular.environment.skyColor = hexToRGB(v)))
				}
			/>
		</label>
		<label>
			Ground Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.specular.environment!.groundColor!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.specular.environment.groundColor = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Horizon"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.specular.environment!.horizon!,
				(v) => viewer.update((pico) => (pico.extras.specular.environment.horizon = v))
			}
		/>
		<NumericControl
			label="Fresnel"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.specular.environment!.fresnel!,
				(v) => viewer.update((pico) => (pico.extras.specular.environment.fresnel = v))
			}
		/>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.specular.style!,
					(v) => viewer.update((pico) => (pico.extras.specular.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Rim Light</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.rimLight.enabled!,
					(v) => viewer.update((pico) => (pico.extras.rimLight.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.rimLight.enabled}
		<MaskSelector
			selected={viewer.extras.rimLight.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.rimLight.maskedColors = selectedColors))}
		/>
		<label>
			Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.rimLight.color!),
					(v: string) => viewer.update((pico) => (pico.extras.rimLight.color = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Width"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.rimLight.width!,
				(v) => viewer.update((pico) => (pico.extras.rimLight.width = v))
			}
		/>
		<NumericControl
			label="Sharpness"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.rimLight.sharpness!,
				(v) => viewer.update((pico) => (pico.extras.rimLight.sharpness = v))
			}
		/>
		<NumericControl
			label="Light Align"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.rimLight.lightAlign!,
				(v) => viewer.update((pico) => (pico.extras.rimLight.lightAlign = v))
			}
		/>
		<NumericControl
			label="Blend"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.rimLight.blend!,
				(v) => viewer.update((pico) => (pico.extras.rimLight.blend = v))
			}
		/>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.rimLight.style!,
					(v) => viewer.update((pico) => (pico.extras.rimLight.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.rimLight.invert!,
					(v) => viewer.update((pico) => (pico.extras.rimLight.invert = v))
				}
			/>
			Invert
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Glitter</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.glitter.enabled!,
					(v) => viewer.update((pico) => (pico.extras.glitter.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.glitter.enabled}
		<MaskSelector
			selected={viewer.extras.glitter.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.glitter.maskedColors = selectedColors))}
		/>
		<label>
			Space
			<select
				bind:value={
					() => viewer.extras.glitter.space!,
					(v) => viewer.update((pico) => (pico.extras.glitter.space = v))
				}
			>
				<option value="uv">UV</option>
				<option value="screen">Screen</option>
				<option value="world">World</option>
			</select>
		</label>
		<NumericControl
			label="Density"
			min={1}
			max={128}
			step={1}
			bind:value={
				() => viewer.extras.glitter.density!,
				(v) => viewer.update((pico) => (pico.extras.glitter.density = v))
			}
		/>
		<NumericControl
			label="Size"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.glitter.size!,
				(v) => viewer.update((pico) => (pico.extras.glitter.size = v))
			}
		/>
		<label>
			Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.glitter.color!),
					(v: string) => viewer.update((pico) => (pico.extras.glitter.color = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Hue Range"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.glitter.hueRange!,
				(v) => viewer.update((pico) => (pico.extras.glitter.hueRange = v))
			}
		/>
		<NumericControl
			label="Brightness"
			min={0}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.glitter.brightness!,
				(v) => viewer.update((pico) => (pico.extras.glitter.brightness = v))
			}
		/>
		<NumericControl
			label="Angle Range"
			min={0}
			max={90}
			step={1}
			bind:value={
				() => viewer.extras.glitter.angleRange!,
				(v) => viewer.update((pico) => (pico.extras.glitter.angleRange = v))
			}
		/>
		<NumericControl
			label="Speed"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.glitter.speed!,
				(v) => viewer.update((pico) => (pico.extras.glitter.speed = v))
			}
		/>
		<label>
			Shape
			<select
				bind:value={
					() => viewer.extras.glitter.shape!,
					(v) => viewer.update((pico) => (pico.extras.glitter.shape = v))
				}
			>
				<option value="square">Square</option>
				<option value="circle">Circle</option>
			</select>
		</label>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.glitter.style!,
					(v) => viewer.update((pico) => (pico.extras.glitter.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.glitter.randomHue!,
					(v) => viewer.update((pico) => (pico.extras.glitter.randomHue = v))
				}
			/>
			Random Hue
		</label>
	{/if}
</fieldset>
<hr />

<h3>Geometry Effects</h3>

<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Mesh Deform</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.meshDeform.enabled!,
					(v) => viewer.update((pico) => (pico.extras.meshDeform.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.meshDeform.enabled}
		<label class="form-margin">
			Voxel
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.meshDeform.voxel!.enabled!,
					(v) => viewer.update((pico) => (pico.extras.meshDeform.voxel.enabled = v))
				}
			/>
		</label>
		<NumericControl
			label="Voxel Grid Size"
			min={0.05}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.meshDeform.voxel!.gridSize!,
				(v) => viewer.update((pico) => (pico.extras.meshDeform.voxel.gridSize = v))
			}
		/>
		<NumericControl
			label="Barrel"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.meshDeform.barrel!.amount!,
				(v) => viewer.update((pico) => (pico.extras.meshDeform.barrel.amount = v))
			}
		/>
		<label>
			Barrel Axis
			<select
				bind:value={
					() => viewer.extras.meshDeform.barrel!.axis!,
					(v) => viewer.update((pico) => (pico.extras.meshDeform.barrel.axis = v))
				}
			>
				<option value="x">X</option>
				<option value="y">Y</option>
				<option value="z">Z</option>
			</select>
		</label>
		<NumericControl
			label="Spherify"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.meshDeform.spherify!.amount!,
				(v) => viewer.update((pico) => (pico.extras.meshDeform.spherify.amount = v))
			}
		/>
		<NumericControl
			label="Twist"
			min={-5}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.meshDeform.twist!.amount!,
				(v) => viewer.update((pico) => (pico.extras.meshDeform.twist.amount = v))
			}
		/>
		<label>
			Twist Axis
			<select
				bind:value={
					() => viewer.extras.meshDeform.twist!.axis!,
					(v) => viewer.update((pico) => (pico.extras.meshDeform.twist.axis = v))
				}
			>
				<option value="x">X</option>
				<option value="y">Y</option>
				<option value="z">Z</option>
			</select>
		</label>
		<NumericControl
			label="Twist Speed"
			min={-10}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.meshDeform.twist!.speed!,
				(v) => viewer.update((pico) => (pico.extras.meshDeform.twist.speed = v))
			}
		/>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Triangle Flash</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.triangleFlash.enabled!,
					(v) => viewer.update((pico) => (pico.extras.triangleFlash.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.triangleFlash.enabled}
		<MaskSelector
			selected={viewer.extras.triangleFlash.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.triangleFlash.maskedColors = selectedColors))}
		/>
		<label>
			Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.triangleFlash.color!),
					(v: string) => viewer.update((pico) => (pico.extras.triangleFlash.color = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Rate"
			min={0}
			max={30}
			step={1}
			bind:value={
				() => viewer.extras.triangleFlash.rate!,
				(v) => viewer.update((pico) => (pico.extras.triangleFlash.rate = v))
			}
		/>
		<NumericControl
			label="Density"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.triangleFlash.density!,
				(v) => viewer.update((pico) => (pico.extras.triangleFlash.density = v))
			}
		/>
		<NumericControl
			label="Duration"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.triangleFlash.duration!,
				(v) => viewer.update((pico) => (pico.extras.triangleFlash.duration = v))
			}
		/>
		<NumericControl
			label="Softness"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.triangleFlash.softness!,
				(v) => viewer.update((pico) => (pico.extras.triangleFlash.softness = v))
			}
		/>
		<label>
			Mode
			<select
				bind:value={
					() => viewer.extras.triangleFlash.mode!,
					(v) => viewer.update((pico) => (pico.extras.triangleFlash.mode = v))
				}
			>
				<option value="replace">Replace</option>
				<option value="add">Add</option>
			</select>
		</label>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.triangleFlash.style!,
					(v) => viewer.update((pico) => (pico.extras.triangleFlash.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Triangle Shatter</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.triangleShatter.enabled!,
					(v) => viewer.update((pico) => (pico.extras.triangleShatter.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.triangleShatter.enabled}
		<MaskSelector
			selected={viewer.extras.triangleShatter.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.triangleShatter.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Progress"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.triangleShatter.progress!,
				(v) => viewer.update((pico) => (pico.extras.triangleShatter.progress = v))
			}
		/>
		<label>
			Mode
			<select
				bind:value={
					() => viewer.extras.triangleShatter.mode!,
					(v) => viewer.update((pico) => (pico.extras.triangleShatter.mode = v))
				}
			>
				<option value="normal">Normal</option>
				<option value="radial">Radial</option>
				<option value="directional">Directional</option>
			</select>
		</label>
		<NumericControl
			label="Direction X"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.triangleShatter.direction![0],
				(v) => viewer.update((pico) => (pico.extras.triangleShatter.direction[0] = v))
			}
		/>
		<NumericControl
			label="Direction Y"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.triangleShatter.direction![1],
				(v) => viewer.update((pico) => (pico.extras.triangleShatter.direction[1] = v))
			}
		/>
		<NumericControl
			label="Direction Z"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.triangleShatter.direction![2],
				(v) => viewer.update((pico) => (pico.extras.triangleShatter.direction[2] = v))
			}
		/>
		<NumericControl
			label="Distance"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.triangleShatter.distance!,
				(v) => viewer.update((pico) => (pico.extras.triangleShatter.distance = v))
			}
		/>
		<NumericControl
			label="Spread"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.triangleShatter.spread!,
				(v) => viewer.update((pico) => (pico.extras.triangleShatter.spread = v))
			}
		/>
		<NumericControl
			label="Rotation"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.triangleShatter.rotation!,
				(v) => viewer.update((pico) => (pico.extras.triangleShatter.rotation = v))
			}
		/>
		<NumericControl
			label="Gravity"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.triangleShatter.gravity!,
				(v) => viewer.update((pico) => (pico.extras.triangleShatter.gravity = v))
			}
		/>
		<NumericControl
			label="Shrink"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.triangleShatter.shrink!,
				(v) => viewer.update((pico) => (pico.extras.triangleShatter.shrink = v))
			}
		/>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Fur</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.fur.enabled!,
					(v) => viewer.update((pico) => (pico.extras.fur.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.fur.enabled}
		<MaskSelector
			selected={viewer.extras.fur.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.fur.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Length"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.fur.length!,
				(v) => viewer.update((pico) => (pico.extras.fur.length = v))
			}
		/>
		<NumericControl
			label="Layers"
			min={1}
			max={32}
			step={1}
			bind:value={
				() => viewer.extras.fur.layers!,
				(v) => viewer.update((pico) => (pico.extras.fur.layers = v))
			}
		/>
		<NumericControl
			label="Density"
			min={1}
			max={128}
			step={1}
			bind:value={
				() => viewer.extras.fur.density!,
				(v) => viewer.update((pico) => (pico.extras.fur.density = v))
			}
		/>
		<NumericControl
			label="Gravity X"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.fur.gravity![0],
				(v) => viewer.update((pico) => (pico.extras.fur.gravity[0] = v))
			}
		/>
		<NumericControl
			label="Gravity Y"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.fur.gravity![1],
				(v) => viewer.update((pico) => (pico.extras.fur.gravity[1] = v))
			}
		/>
		<NumericControl
			label="Gravity Z"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.fur.gravity![2],
				(v) => viewer.update((pico) => (pico.extras.fur.gravity[2] = v))
			}
		/>
		<NumericControl
			label="Root Shade"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.fur.rootShade!,
				(v) => viewer.update((pico) => (pico.extras.fur.rootShade = v))
			}
		/>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Billboard</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.billboard.enabled!,
					(v) => viewer.update((pico) => (pico.extras.billboard.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.billboard.enabled}
		<MeshSelector
			selected={viewer.extras.billboard.nodes!}
			title="Billboard Meshes"
			onChange={(selectedMeshes) =>
				viewer.update((pico) => (pico.extras.billboard.nodes = selectedMeshes))}
		/>
		<label>
			Mode
			<select
				bind:value={
					() => viewer.extras.billboard.mode!,
					(v) => viewer.update((pico) => (pico.extras.billboard.mode = v))
				}
			>
				<option value="full">Full</option>
				<option value="yaw">Yaw</option>
			</select>
		</label>
	{/if}
</fieldset>
<hr />

<h3>Scene Effects</h3>

<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Wireframe</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.wireframe.enabled!,
					(v) => viewer.update((pico) => (pico.extras.wireframe.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.wireframe.enabled}
		<label>
			Wireframe Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.wireframe.color!),
					(v: string) => viewer.update((pico) => (pico.extras.wireframe.color = hexToRGB(v)))
				}
			/>
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.wireframe.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.wireframe.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Particles</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.particles.enabled!,
					(v) => viewer.update((pico) => (pico.extras.particles.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.particles.enabled}
		<MaskSelector
			selected={viewer.extras.particles.paletteIndices!}
			title="Particle Colors"
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.particles.paletteIndices = selectedColors))}
		/>
		<NumericControl
			label="Count"
			min={0}
			max={2000}
			step={10}
			bind:value={
				() => viewer.extras.particles.count!,
				(v) => viewer.update((pico) => (pico.extras.particles.count = v))
			}
		/>
		<label>
			Shape
			<select
				bind:value={
					() => viewer.extras.particles.shape!,
					(v) => viewer.update((pico) => (pico.extras.particles.shape = v))
				}
			>
				<option value="pixel">Pixel</option>
				<option value="quad">Quad</option>
				<option value="cube">Cube</option>
				<option value="triangle">Triangle</option>
			</select>
		</label>
		<label>
			Motion
			<select
				bind:value={
					() => viewer.extras.particles.motion!,
					(v) => viewer.update((pico) => (pico.extras.particles.motion = v))
				}
			>
				<option value="drift">Drift</option>
				<option value="orbit">Orbit</option>
				<option value="linear">Linear</option>
			</select>
		</label>
		<NumericControl
			label="Size"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.particles.size!,
				(v) => viewer.update((pico) => (pico.extras.particles.size = v))
			}
		/>
		<NumericControl
			label="Size Jitter"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.particles.sizeJitter!,
				(v) => viewer.update((pico) => (pico.extras.particles.sizeJitter = v))
			}
		/>
		<NumericControl
			label="Speed"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.particles.speed!,
				(v) => viewer.update((pico) => (pico.extras.particles.speed = v))
			}
		/>
		<NumericControl
			label="Velocity X"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.particles.velocity![0],
				(v) => viewer.update((pico) => (pico.extras.particles.velocity[0] = v))
			}
		/>
		<NumericControl
			label="Velocity Y"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.particles.velocity![1],
				(v) => viewer.update((pico) => (pico.extras.particles.velocity[1] = v))
			}
		/>
		<NumericControl
			label="Velocity Z"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.particles.velocity![2],
				(v) => viewer.update((pico) => (pico.extras.particles.velocity[2] = v))
			}
		/>
		<NumericControl
			label="Area Scale"
			min={0.1}
			max={5}
			step={0.1}
			bind:value={
				() => viewer.extras.particles.areaScale!,
				(v) => viewer.update((pico) => (pico.extras.particles.areaScale = v))
			}
		/>
		<NumericControl
			label="Twinkle"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.particles.twinkle!,
				(v) => viewer.update((pico) => (pico.extras.particles.twinkle = v))
			}
		/>
		<NumericControl
			label="Hue Range"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.particles.hueRange!,
				(v) => viewer.update((pico) => (pico.extras.particles.hueRange = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.particles.randomHue!,
					(v) => viewer.update((pico) => (pico.extras.particles.randomHue = v))
				}
			/>
			Random Hue
		</label>
	{/if}
</fieldset>
<hr />

<h3>Post Processing</h3>

<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Gradient Outline</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.gradientOutline.enabled!,
					(v) => viewer.update((pico) => (pico.extras.gradientOutline.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.gradientOutline.enabled}
		<NumericControl
			label="Width"
			min={0}
			max={10}
			step={1}
			bind:value={
				() => viewer.extras.gradientOutline.size!,
				(v) => viewer.update((pico) => (pico.extras.gradientOutline.size = v))
			}
		/>
		<label>
			Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.gradientOutline.colorFrom!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.gradientOutline.colorFrom = hexToRGB(v)))
				}
			/>
		</label>
		<label>
			Gradient Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.gradientOutline.colorTo!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.gradientOutline.colorTo = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Gradient Strength"
			min={0}
			max={10}
			step={0.01}
			bind:value={
				() => viewer.extras.gradientOutline.gradient!,
				(v) => viewer.update((pico) => (pico.extras.gradientOutline.gradient = v))
			}
		/>
		<NumericControl
			label="Gradient Direction"
			min={0}
			max={Math.PI * 2}
			step={0.01}
			bind:value={
				() => viewer.extras.gradientOutline.gradientDirection!,
				(v) => viewer.update((pico) => (pico.extras.gradientOutline.gradientDirection = v))
			}
		/>
		<label>
			Mode
			<select
				bind:value={
					() => viewer.extras.gradientOutline.mode!,
					(v) => viewer.update((pico) => (pico.extras.gradientOutline.mode = v))
				}
			>
				<option value="outline">Outline</option>
				<option value="dropShadow">Drop Shadow</option>
			</select>
		</label>
		{#if viewer.extras.gradientOutline.mode === 'dropShadow'}
			<NumericControl
				label="Shadow Offset X"
				min={-20}
				max={20}
				step={1}
				bind:value={
					() => viewer.extras.gradientOutline.shadowOffset![0],
					(v) => viewer.update((pico) => (pico.extras.gradientOutline.shadowOffset[0] = v))
				}
			/>
			<NumericControl
				label="Shadow Offset Y"
				min={-20}
				max={20}
				step={1}
				bind:value={
					() => viewer.extras.gradientOutline.shadowOffset![1],
					(v) => viewer.update((pico) => (pico.extras.gradientOutline.shadowOffset[1] = v))
				}
			/>
		{:else}
			<NumericControl
				label="Growth Direction"
				min={0}
				max={360}
				step={1}
				bind:value={
					() => viewer.extras.gradientOutline.growthDirection!,
					(v) => viewer.update((pico) => (pico.extras.gradientOutline.growthDirection = v))
				}
			/>
			<NumericControl
				label="Growth Factor"
				min={0}
				max={1}
				step={0.01}
				bind:value={
					() => viewer.extras.gradientOutline.growthFactor!,
					(v) => viewer.update((pico) => (pico.extras.gradientOutline.growthFactor = v))
				}
			/>
		{/if}
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.gradientOutline.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.gradientOutline.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Procedural Background</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.proceduralBackground.enabled!,
					(v) => viewer.update((pico) => (pico.extras.proceduralBackground.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.proceduralBackground.enabled}
		<label>
			Pattern
			<select
				bind:value={
					() => viewer.extras.proceduralBackground.pattern!,
					(v) => viewer.update((pico) => (pico.extras.proceduralBackground.pattern = v))
				}
			>
				<option value="stars">Stars</option>
				<option value="dust">Dust</option>
				<option value="voronoi">Voronoi</option>
				<option value="lava">Lava</option>
				<option value="grid">Grid</option>
				<option value="truchet">Truchet</option>
				<option value="constellations">Constellations</option>
			</select>
		</label>
		<label>
			Color A
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.proceduralBackground.colorA!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.proceduralBackground.colorA = hexToRGB(v)))
				}
			/>
		</label>
		<label>
			Color B
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.proceduralBackground.colorB!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.proceduralBackground.colorB = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Scale"
			min={1}
			max={50}
			step={1}
			bind:value={
				() => viewer.extras.proceduralBackground.scale!,
				(v) => viewer.update((pico) => (pico.extras.proceduralBackground.scale = v))
			}
		/>
		<NumericControl
			label="Speed"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.proceduralBackground.speed!,
				(v) => viewer.update((pico) => (pico.extras.proceduralBackground.speed = v))
			}
		/>
		<NumericControl
			label="Seed"
			min={0}
			max={100}
			step={1}
			bind:value={
				() => viewer.extras.proceduralBackground.seed!,
				(v) => viewer.update((pico) => (pico.extras.proceduralBackground.seed = v))
			}
		/>
		<NumericControl
			label="Camera Parallax"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.proceduralBackground.cameraParallax!,
				(v) => viewer.update((pico) => (pico.extras.proceduralBackground.cameraParallax = v))
			}
		/>
		<NumericControl
			label="Hue Range"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.proceduralBackground.hueRange!,
				(v) => viewer.update((pico) => (pico.extras.proceduralBackground.hueRange = v))
			}
		/>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.proceduralBackground.style!,
					(v) => viewer.update((pico) => (pico.extras.proceduralBackground.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.proceduralBackground.randomHue!,
					(v) => viewer.update((pico) => (pico.extras.proceduralBackground.randomHue = v))
				}
			/>
			Random Hue
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Ambient Occlusion</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.ssao.enabled!,
					(v) => viewer.update((pico) => (pico.extras.ssao.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.ssao.enabled}
		<MaskSelector
			selected={viewer.extras.ssao.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.ssao.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Radius"
			min={0}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.ssao.radius!,
				(v) => viewer.update((pico) => (pico.extras.ssao.radius = v))
			}
		/>
		<NumericControl
			label="Intensity"
			min={0}
			max={3}
			step={0.01}
			bind:value={
				() => viewer.extras.ssao.intensity!,
				(v) => viewer.update((pico) => (pico.extras.ssao.intensity = v))
			}
		/>
		<NumericControl
			label="Power"
			min={0.1}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.ssao.power!,
				(v) => viewer.update((pico) => (pico.extras.ssao.power = v))
			}
		/>
		<label>
			Samples
			<select
				bind:value={
					() => viewer.extras.ssao.samples!,
					(v) => viewer.update((pico) => (pico.extras.ssao.samples = v))
				}
			>
				<option value={8}>8</option>
				<option value={16}>16</option>
				<option value={32}>32</option>
			</select>
		</label>
		<label>
			Style
			<select
				bind:value={
					() => viewer.extras.ssao.style!,
					(v) => viewer.update((pico) => (pico.extras.ssao.style = v))
				}
			>
				<option value="palette">Palette</option>
				<option value="dithered">Dithered</option>
				<option value="smooth">Smooth</option>
			</select>
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Depth Fog</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.depthFog.enabled!,
					(v) => viewer.update((pico) => (pico.extras.depthFog.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.depthFog.enabled}
		<MaskSelector
			selected={viewer.extras.depthFog.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.depthFog.maskedColors = selectedColors))}
		/>
		<label>
			Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.depthFog.color!),
					(v: string) => viewer.update((pico) => (pico.extras.depthFog.color = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Near"
			min={0}
			max={100}
			step={0.1}
			bind:value={
				() => viewer.extras.depthFog.near!,
				(v) => viewer.update((pico) => (pico.extras.depthFog.near = v))
			}
		/>
		<NumericControl
			label="Far"
			min={0}
			max={100}
			step={0.1}
			bind:value={
				() => viewer.extras.depthFog.far!,
				(v) => viewer.update((pico) => (pico.extras.depthFog.far = v))
			}
		/>
		<NumericControl
			label="Density"
			min={0}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.depthFog.density!,
				(v) => viewer.update((pico) => (pico.extras.depthFog.density = v))
			}
		/>
		<label>
			Mode
			<select
				bind:value={
					() => viewer.extras.depthFog.mode!,
					(v) => viewer.update((pico) => (pico.extras.depthFog.mode = v))
				}
			>
				<option value="linear">Linear</option>
				<option value="exponential">Exponential</option>
				<option value="exponentialSquared">Exponential Squared</option>
			</select>
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.depthFog.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.depthFog.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Edge Detection</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.edgeDetection.enabled!,
					(v) => viewer.update((pico) => (pico.extras.edgeDetection.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.edgeDetection.enabled}
		<MaskSelector
			selected={viewer.extras.edgeDetection.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.edgeDetection.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Threshold"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.edgeDetection.threshold!,
				(v) => viewer.update((pico) => (pico.extras.edgeDetection.threshold = v))
			}
		/>
		<label>
			Line Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.edgeDetection.lineColor!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.edgeDetection.lineColor = hexToRGB(v)))
				}
			/>
		</label>
		<label>
			Background Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.edgeDetection.backgroundColor!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.edgeDetection.backgroundColor = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Blend"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.edgeDetection.blend!,
				(v) => viewer.update((pico) => (pico.extras.edgeDetection.blend = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.edgeDetection.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.edgeDetection.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Color Grading</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.colorGrading.enabled!,
					(v) => viewer.update((pico) => (pico.extras.colorGrading.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.colorGrading.enabled}
		<MaskSelector
			selected={viewer.extras.colorGrading.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.colorGrading.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Brightness"
			min={0}
			max={3}
			step={0.01}
			bind:value={
				() => viewer.extras.colorGrading.brightness!,
				(v) => viewer.update((pico) => (pico.extras.colorGrading.brightness = v))
			}
		/>
		<NumericControl
			label="Contrast"
			min={0}
			max={3}
			step={0.01}
			bind:value={
				() => viewer.extras.colorGrading.contrast!,
				(v) => viewer.update((pico) => (pico.extras.colorGrading.contrast = v))
			}
		/>
		<NumericControl
			label="Saturation"
			min={0}
			max={3}
			step={0.01}
			bind:value={
				() => viewer.extras.colorGrading.saturation!,
				(v) => viewer.update((pico) => (pico.extras.colorGrading.saturation = v))
			}
		/>
		<NumericControl
			label="Hue"
			min={-180}
			max={180}
			step={1}
			bind:value={
				() => viewer.extras.colorGrading.hue!,
				(v) => viewer.update((pico) => (pico.extras.colorGrading.hue = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.colorGrading.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.colorGrading.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Color Tint</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.colorTint.enabled!,
					(v) => viewer.update((pico) => (pico.extras.colorTint.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.colorTint.enabled}
		<MaskSelector
			selected={viewer.extras.colorTint.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.colorTint.maskedColors = selectedColors))}
		/>
		<label>
			Mode
			<select
				bind:value={
					() => viewer.extras.colorTint.mode!,
					(v) => viewer.update((pico) => (pico.extras.colorTint.mode = v))
				}
			>
				<option value="tint">Tint</option>
				<option value="duotone">Duotone</option>
				<option value="splitTone">Split Tone</option>
			</select>
		</label>
		<label>
			Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.colorTint.color!),
					(v: string) => viewer.update((pico) => (pico.extras.colorTint.color = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Intensity"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.colorTint.intensity!,
				(v) => viewer.update((pico) => (pico.extras.colorTint.intensity = v))
			}
		/>
		<label>
			Shadow Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.colorTint.shadowColor!),
					(v: string) => viewer.update((pico) => (pico.extras.colorTint.shadowColor = hexToRGB(v)))
				}
			/>
		</label>
		<label>
			Highlight Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.colorTint.highlightColor!),
					(v: string) =>
						viewer.update((pico) => (pico.extras.colorTint.highlightColor = hexToRGB(v)))
				}
			/>
		</label>
		<NumericControl
			label="Blend"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.colorTint.blend!,
				(v) => viewer.update((pico) => (pico.extras.colorTint.blend = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.colorTint.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.colorTint.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Posterize</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.posterization.enabled!,
					(v) => viewer.update((pico) => (pico.extras.posterization.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.posterization.enabled}
		<MaskSelector
			selected={viewer.extras.posterization.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.posterization.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Levels"
			min={2}
			max={10}
			step={1}
			bind:value={
				() => viewer.extras.posterization.levels!,
				(v) => viewer.update((pico) => (pico.extras.posterization.levels = v))
			}
		/>
		<NumericControl
			label="Red Levels"
			min={0}
			max={5}
			step={1}
			bind:value={
				() => viewer.extras.posterization.channelLevels![0],
				(v) => viewer.update((pico) => (pico.extras.posterization.channelLevels[0] = v))
			}
		/>
		<NumericControl
			label="Green Levels"
			min={0}
			max={5}
			step={1}
			bind:value={
				() => viewer.extras.posterization.channelLevels![1],
				(v) => viewer.update((pico) => (pico.extras.posterization.channelLevels[1] = v))
			}
		/>
		<NumericControl
			label="Blue Levels"
			min={0}
			max={5}
			step={1}
			bind:value={
				() => viewer.extras.posterization.channelLevels![2],
				(v) => viewer.update((pico) => (pico.extras.posterization.channelLevels[2] = v))
			}
		/>
		<NumericControl
			label="Gamma"
			min={0}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.posterization.gamma!,
				(v) => viewer.update((pico) => (pico.extras.posterization.gamma = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.posterization.colorBanding!,
					(v) => viewer.update((pico) => (pico.extras.posterization.colorBanding = v))
				}
			/>
			Color Banding
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.posterization.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.posterization.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Sharpen</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.sharpen.enabled!,
					(v) => viewer.update((pico) => (pico.extras.sharpen.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.sharpen.enabled}
		<MaskSelector
			selected={viewer.extras.sharpen.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.sharpen.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Strength"
			min={0}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.sharpen.strength!,
				(v) => viewer.update((pico) => (pico.extras.sharpen.strength = v))
			}
		/>
		<NumericControl
			label="Threshold"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.sharpen.threshold!,
				(v) => viewer.update((pico) => (pico.extras.sharpen.threshold = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.sharpen.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.sharpen.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Bloom</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.bloom.enabled!,
					(v) => viewer.update((pico) => (pico.extras.bloom.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.bloom.enabled}
		<MaskSelector
			selected={viewer.extras.bloom.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.bloom.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Threshold"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.bloom.threshold!,
				(v) => viewer.update((pico) => (pico.extras.bloom.threshold = v))
			}
		/>
		<NumericControl
			label="Intensity"
			min={0}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.bloom.intensity!,
				(v) => viewer.update((pico) => (pico.extras.bloom.intensity = v))
			}
		/>
		<NumericControl
			label="Blur"
			min={0}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.bloom.blur!,
				(v) => viewer.update((pico) => (pico.extras.bloom.blur = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.bloom.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.bloom.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Dithering</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.dithering.enabled!,
					(v) => viewer.update((pico) => (pico.extras.dithering.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.dithering.enabled}
		<MaskSelector
			selected={viewer.extras.dithering.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.dithering.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Amount"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.dithering.amount!,
				(v) => viewer.update((pico) => (pico.extras.dithering.amount = v))
			}
		/>
		<NumericControl
			label="Blend"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.dithering.blend!,
				(v) => viewer.update((pico) => (pico.extras.dithering.blend = v))
			}
		/>
		<NumericControl
			label="Red Channel"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.dithering.channelAmount![0],
				(v) => viewer.update((pico) => (pico.extras.dithering.channelAmount[0] = v))
			}
		/>
		<NumericControl
			label="Green Channel"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.dithering.channelAmount![1],
				(v) => viewer.update((pico) => (pico.extras.dithering.channelAmount[1] = v))
			}
		/>
		<NumericControl
			label="Blue Channel"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.dithering.channelAmount![2],
				(v) => viewer.update((pico) => (pico.extras.dithering.channelAmount[2] = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.dithering.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.dithering.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Halftone</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.halftone.enabled!,
					(v) => viewer.update((pico) => (pico.extras.halftone.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.halftone.enabled}
		<MaskSelector
			selected={viewer.extras.halftone.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.halftone.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Dot Size"
			min={0}
			max={20}
			step={0.1}
			bind:value={
				() => viewer.extras.halftone.dotSize!,
				(v) => viewer.update((pico) => (pico.extras.halftone.dotSize = v))
			}
		/>
		<NumericControl
			label="Angle"
			min={0}
			max={Math.PI}
			step={0.01}
			bind:value={
				() => viewer.extras.halftone.angle!,
				(v) => viewer.update((pico) => (pico.extras.halftone.angle = v))
			}
		/>
		<NumericControl
			label="Blend"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.halftone.blend!,
				(v) => viewer.update((pico) => (pico.extras.halftone.blend = v))
			}
		/>
		<label>
			Mode
			<select
				bind:value={
					() => viewer.extras.halftone.mode!,
					(v) => viewer.update((pico) => (pico.extras.halftone.mode = v))
				}
			>
				<option value="dots">Dots</option>
				<option value="lines">Lines</option>
				<option value="crosshatch">Crosshatch</option>
			</select>
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.halftone.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.halftone.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Video Effects</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.videoEffects.enabled!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.videoEffects.enabled}
		<label>
			Screen Type
			<select
				bind:value={
					() => viewer.extras.videoEffects.screenType!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.screenType = v))
				}
			>
				<option value="crt">CRT</option>
				<option value="lcd">LCD</option>
				<option value="tn">TN</option>
				<option value="oled">OLED</option>
				<option value="gameboy">Gameboy</option>
				<option value="projector">Projector</option>
			</select>
		</label>
		<NumericControl
			label="Resolution"
			min={0}
			max={256}
			step={1}
			bind:value={
				() => viewer.extras.videoEffects.resolution!,
				(v) => viewer.update((pico) => (pico.extras.videoEffects.resolution = v))
			}
		/>
		<NumericControl
			label="Brightness"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.videoEffects.brightness!,
				(v) => viewer.update((pico) => (pico.extras.videoEffects.brightness = v))
			}
		/>
		<NumericControl
			label="Saturation"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.videoEffects.saturation!,
				(v) => viewer.update((pico) => (pico.extras.videoEffects.saturation = v))
			}
		/>
		<NumericControl
			label="Contrast Boost"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.videoEffects.contrastBoost!,
				(v) => viewer.update((pico) => (pico.extras.videoEffects.contrastBoost = v))
			}
		/>
		<NumericControl
			label="Grid Strength"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.videoEffects.gridStrength!,
				(v) => viewer.update((pico) => (pico.extras.videoEffects.gridStrength = v))
			}
		/>
		{#if viewer.extras.videoEffects.screenType === 'crt'}
			<NumericControl
				label="Curvature"
				min={0}
				max={1}
				step={0.01}
				bind:value={
					() => viewer.extras.videoEffects.crt!.curvature!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.crt.curvature = v))
				}
			/>
			<NumericControl
				label="Scanline Intensity"
				min={0}
				max={1}
				step={0.01}
				bind:value={
					() => viewer.extras.videoEffects.crt!.scanlineIntensity!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.crt.scanlineIntensity = v))
				}
			/>
			<NumericControl
				label="Refresh Rate"
				min={0}
				max={10}
				step={0.1}
				bind:value={
					() => viewer.extras.videoEffects.crt!.refreshRate!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.crt.refreshRate = v))
				}
			/>
			<NumericControl
				label="Pixel Fade Time"
				min={0}
				max={2}
				step={0.01}
				bind:value={
					() => viewer.extras.videoEffects.crt!.pixelFadeTime!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.crt.pixelFadeTime = v))
				}
			/>
		{:else if viewer.extras.videoEffects.screenType === 'gameboy'}
			<label>
				Palette
				<select
					bind:value={
						() => viewer.extras.videoEffects.gameboy!.palette!,
						(v) => viewer.update((pico) => (pico.extras.videoEffects.gameboy.palette = v))
					}
				>
					<option value="dmg">DMG</option>
					<option value="pocket">Pocket</option>
					<option value="custom">Custom</option>
				</select>
			</label>
			{#if viewer.extras.videoEffects.gameboy!.palette === 'custom'}
				{#each viewer.extras.videoEffects.gameboy!.customColors!, i (i)}
					<label>
						Shade {i + 1}
						<input
							type="color"
							bind:value={
								() => rgbToHex(viewer.extras.videoEffects.gameboy!.customColors![i]),
								(v: string) =>
									viewer.update(
										(pico) => (pico.extras.videoEffects.gameboy.customColors[i] = hexToRGB(v))
									)
							}
						/>
					</label>
				{/each}
			{/if}
			<NumericControl
				label="Ghosting"
				min={0}
				max={1}
				step={0.01}
				bind:value={
					() => viewer.extras.videoEffects.gameboy!.ghosting!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.gameboy.ghosting = v))
				}
			/>
		{:else if viewer.extras.videoEffects.screenType === 'tn'}
			<NumericControl
				label="Angle Shift"
				min={0}
				max={1}
				step={0.01}
				bind:value={
					() => viewer.extras.videoEffects.tn!.angleShift!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.tn.angleShift = v))
				}
			/>
		{:else if viewer.extras.videoEffects.screenType === 'oled'}
			<NumericControl
				label="Black Crush"
				min={0}
				max={1}
				step={0.01}
				bind:value={
					() => viewer.extras.videoEffects.oled!.blackCrush!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.oled.blackCrush = v))
				}
			/>
			<label class="form-margin">
				<input
					type="checkbox"
					role="switch"
					bind:checked={
						() => viewer.extras.videoEffects.oled!.pentile!,
						(v) => viewer.update((pico) => (pico.extras.videoEffects.oled.pentile = v))
					}
				/>
				Pentile
			</label>
		{:else if viewer.extras.videoEffects.screenType === 'projector'}
			<NumericControl
				label="Keystone"
				min={0}
				max={1}
				step={0.01}
				bind:value={
					() => viewer.extras.videoEffects.projector!.keystone!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.projector.keystone = v))
				}
			/>
			<NumericControl
				label="Hotspot"
				min={0}
				max={1}
				step={0.01}
				bind:value={
					() => viewer.extras.videoEffects.projector!.hotspot!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.projector.hotspot = v))
				}
			/>
			<NumericControl
				label="Halo"
				min={0}
				max={1}
				step={0.01}
				bind:value={
					() => viewer.extras.videoEffects.projector!.halo!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.projector.halo = v))
				}
			/>
		{/if}
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.videoEffects.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.videoEffects.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Pixelation</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.pixelation.enabled!,
					(v) => viewer.update((pico) => (pico.extras.pixelation.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.pixelation.enabled}
		<MaskSelector
			selected={viewer.extras.pixelation.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.pixelation.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Pixel Size"
			min={1}
			max={10}
			step={0.01}
			bind:value={
				() => viewer.extras.pixelation.pixelSize!,
				(v) => viewer.update((pico) => (pico.extras.pixelation.pixelSize = v))
			}
		/>
		<label>
			Shape
			<select
				bind:value={
					() => viewer.extras.pixelation.shape!,
					(v) => viewer.update((pico) => (pico.extras.pixelation.shape = v))
				}
			>
				<option value="square">Square</option>
				<option value="hex">Hex</option>
				<option value="diamond">Diamond</option>
				<option value="circle">Circle</option>
				<option value="triangle">Triangle</option>
				<option value="cross">Cross</option>
				<option value="star">Star</option>
			</select>
		</label>
		<NumericControl
			label="Blend"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.pixelation.blend!,
				(v) => viewer.update((pico) => (pico.extras.pixelation.blend = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.pixelation.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.pixelation.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Lens Distortion</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.lensDistortion.enabled!,
					(v) => viewer.update((pico) => (pico.extras.lensDistortion.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.lensDistortion.enabled}
		<NumericControl
			label="Strength"
			min={-2}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.lensDistortion.strength!,
				(v) => viewer.update((pico) => (pico.extras.lensDistortion.strength = v))
			}
		/>
		<NumericControl
			label="Zoom"
			min={0.1}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.lensDistortion.zoom!,
				(v) => viewer.update((pico) => (pico.extras.lensDistortion.zoom = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.lensDistortion.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.lensDistortion.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Chromatic Aberration</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.chromaticAberration.enabled!,
					(v) => viewer.update((pico) => (pico.extras.chromaticAberration.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.chromaticAberration.enabled}
		<MaskSelector
			selected={viewer.extras.chromaticAberration.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.chromaticAberration.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Strength"
			min={0}
			max={5}
			step={0.01}
			bind:value={
				() => viewer.extras.chromaticAberration.strength!,
				(v) => viewer.update((pico) => (pico.extras.chromaticAberration.strength = v))
			}
		/>
		<NumericControl
			label="Red Offset"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.chromaticAberration.redOffset!,
				(v) => viewer.update((pico) => (pico.extras.chromaticAberration.redOffset = v))
			}
		/>
		<NumericControl
			label="Green Offset"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.chromaticAberration.greenOffset!,
				(v) => viewer.update((pico) => (pico.extras.chromaticAberration.greenOffset = v))
			}
		/>
		<NumericControl
			label="Blue Offset"
			min={-1}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.chromaticAberration.blueOffset!,
				(v) => viewer.update((pico) => (pico.extras.chromaticAberration.blueOffset = v))
			}
		/>
		<NumericControl
			label="Radial Falloff"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.chromaticAberration.radialFalloff!,
				(v) => viewer.update((pico) => (pico.extras.chromaticAberration.radialFalloff = v))
			}
		/>
		<NumericControl
			label="Center X"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.chromaticAberration.centerX!,
				(v) => viewer.update((pico) => (pico.extras.chromaticAberration.centerX = v))
			}
		/>
		<NumericControl
			label="Center Y"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.chromaticAberration.centerY!,
				(v) => viewer.update((pico) => (pico.extras.chromaticAberration.centerY = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.chromaticAberration.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.chromaticAberration.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Noise</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.noise.enabled!,
					(v) => viewer.update((pico) => (pico.extras.noise.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.noise.enabled}
		<MaskSelector
			selected={viewer.extras.noise.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.noise.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Amount"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.noise.amount!,
				(v) => viewer.update((pico) => (pico.extras.noise.amount = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.noise.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.noise.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Glitch</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.glitch.enabled!,
					(v) => viewer.update((pico) => (pico.extras.glitch.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.glitch.enabled}
		<MaskSelector
			selected={viewer.extras.glitch.maskedColors!}
			onChange={(selectedColors) =>
				viewer.update((pico) => (pico.extras.glitch.maskedColors = selectedColors))}
		/>
		<NumericControl
			label="Intensity"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.glitch.intensity!,
				(v) => viewer.update((pico) => (pico.extras.glitch.intensity = v))
			}
		/>
		<NumericControl
			label="Speed"
			min={0}
			max={10}
			step={0.1}
			bind:value={
				() => viewer.extras.glitch.speed!,
				(v) => viewer.update((pico) => (pico.extras.glitch.speed = v))
			}
		/>
		<NumericControl
			label="Block Size"
			min={0}
			max={100}
			step={1}
			bind:value={
				() => viewer.extras.glitch.blockSize!,
				(v) => viewer.update((pico) => (pico.extras.glitch.blockSize = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.glitch.rgbSplit!,
					(v) => viewer.update((pico) => (pico.extras.glitch.rgbSplit = v))
				}
			/>
			RGB Split
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.glitch.lineShift!,
					(v) => viewer.update((pico) => (pico.extras.glitch.lineShift = v))
				}
			/>
			Line Shift
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.glitch.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.glitch.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>
<hr />
<fieldset>
	<legend>
		<label class="form-collapse">
			<h4>Vignette</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.vignette.enabled!,
					(v) => viewer.update((pico) => (pico.extras.vignette.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.vignette.enabled}
		<NumericControl
			label="Intensity"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.vignette.intensity!,
				(v) => viewer.update((pico) => (pico.extras.vignette.intensity = v))
			}
		/>
		<NumericControl
			label="Smoothness"
			min={0}
			max={2}
			step={0.01}
			bind:value={
				() => viewer.extras.vignette.smoothness!,
				(v) => viewer.update((pico) => (pico.extras.vignette.smoothness = v))
			}
		/>
		<NumericControl
			label="Roundness"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.vignette.roundness!,
				(v) => viewer.update((pico) => (pico.extras.vignette.roundness = v))
			}
		/>
		<label>
			Color
			<input
				type="color"
				bind:value={
					() => rgbToHex(viewer.extras.vignette.color!),
					(v: string) => viewer.update((pico) => (pico.extras.vignette.color = hexToRGB(v)))
				}
			/>
		</label>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.vignette.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.vignette.modelOnly = v))
				}
			/>
			Model Only
		</label>
	{/if}
</fieldset>

<style>
	code {
		padding-block: 0.15rem;
	}

	h3 {
		background-color: var(--pico-form-element-background-color);
		border: var(--pico-border-width) solid var(--pico-form-element-border-color);
		border-radius: var(--pico-border-radius);
		padding: var(--pico-form-element-spacing-vertical) var(--pico-form-element-spacing-horizontal);
		text-align: center;
	}
</style>
