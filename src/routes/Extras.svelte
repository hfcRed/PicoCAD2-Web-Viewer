<script lang="ts">
	import { viewer } from './viewer-state.svelte';
	import NumericControl from '$lib/components/NumericControl.svelte';
	import { hexToRGB, rgbToHex } from './utils';
</script>

<h3>Extra Settings</h3>
<p>
	Effects apply in the same order they are listed. Disabling <code>Model Only</code> on any effect will
	apply all following effects to the entire screen as well!
</p>
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
			max={10}
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
			min={-1}
			max={1}
			step={0.01}
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
			<h4>CRT</h4>
			<input
				type="checkbox"
				bind:checked={
					() => viewer.extras.crt.enabled!,
					(v) => viewer.update((pico) => (pico.extras.crt.enabled = v))
				}
			/>
		</label>
	</legend>
	{#if viewer.extras.crt.enabled}
		<NumericControl
			label="Curvature"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.crt.curvature!,
				(v) => viewer.update((pico) => (pico.extras.crt.curvature = v))
			}
		/>
		<NumericControl
			label="Scanline Intensity"
			min={0}
			max={1}
			step={0.01}
			bind:value={
				() => viewer.extras.crt.scanlineIntensity!,
				(v) => viewer.update((pico) => (pico.extras.crt.scanlineIntensity = v))
			}
		/>
		<label class="form-margin">
			<input
				type="checkbox"
				role="switch"
				bind:checked={
					() => viewer.extras.crt.modelOnly!,
					(v) => viewer.update((pico) => (pico.extras.crt.modelOnly = v))
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
			max={2}
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
