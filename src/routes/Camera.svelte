<script lang="ts">
	import { viewer } from './viewer-state.svelte';
	import { CAMERA_LIMITS } from './constants';
	import NumericControl from '$lib/components/NumericControl.svelte';

	let disableSpeed = $derived(viewer.settings.animation.playing);
</script>

<fieldset>
	<legend>
		<h3>Camera Settings</h3>
	</legend>
	<label>
		Projection Mode
		<select
			bind:value={
				() => viewer.settings.projectionMode,
				(v) => viewer.update((pico) => (pico.projectionMode = v))
			}
		>
			<option value="perspective">Perspective</option>
			<option value="orthographic">Orthographic</option>
			<option value="fisheye">Fisheye</option>
		</select>
	</label>
	<fieldset>
		<legend>
			<h4>Camera Mode</h4>
		</legend>
		<label>
			Mode
			<select
				bind:value={
					() => viewer.settings.cameraMode, (v) => viewer.update((pico) => (pico.cameraMode = v))
				}
			>
				<option value="spin">Spin</option>
				<option value="sway">Sway</option>
				<option value="pingpong">Pingpong</option>
				<option value="fixed">Fixed</option>
			</select>
		</label>
		<label>
			Direction
			<select
				bind:value={
					() => viewer.settings.cameraModeDirection,
					(v) => viewer.update((pico) => (pico.cameraModeDirection = v))
				}
			>
				<option value="left">Left</option>
				<option value="right">Right</option>
			</select>
		</label>
		<NumericControl
			disabled={disableSpeed}
			label="Speed"
			min={0}
			max={10}
			step={0.01}
			bind:value={
				() => viewer.settings.cameraModeSpeed,
				(v) => viewer.update((pico) => (pico.cameraModeSpeed = v))
			}
		/>
		{#if disableSpeed}
			<small class="disabledSpeed"
				>When animation is enabled, speed is synchronized with animation time</small
			>
		{/if}
	</fieldset>
</fieldset>
<hr />
<fieldset>
	<legend>
		<h3>Camera Values</h3>
	</legend>
	<NumericControl
		label="Distance"
		min={CAMERA_LIMITS.distance.min}
		max={CAMERA_LIMITS.distance.max}
		step={0.01}
		bind:value={
			() => viewer.settings.camera.distanceToTarget,
			(v) => viewer.update((pico) => (pico.camera.distanceToTarget = v))
		}
	/>
	<NumericControl
		label="Tilt"
		min={CAMERA_LIMITS.tilt.min}
		max={CAMERA_LIMITS.tilt.max}
		step={0.01}
		bind:value={
			() => viewer.settings.camera.theta, (v) => viewer.update((pico) => (pico.camera.theta = v))
		}
	/>
	<NumericControl
		label="Rotation"
		min={CAMERA_LIMITS.rotation.min}
		max={CAMERA_LIMITS.rotation.max}
		step={0.01}
		bind:value={
			() => viewer.settings.camera.omega, (v) => viewer.update((pico) => (pico.camera.omega = v))
		}
	/>
	<fieldset>
		<legend>
			<h4>Target</h4>
		</legend>
		<NumericControl
			label="X"
			min={-50}
			max={50}
			step={0.01}
			bind:value={
				() => viewer.settings.camera.target[0],
				(v) => viewer.update((pico) => (pico.camera.target[0] = v))
			}
		/>
		<NumericControl
			label="Y"
			min={-50}
			max={50}
			step={0.01}
			bind:value={
				() => viewer.settings.camera.target[1],
				(v) => viewer.update((pico) => (pico.camera.target[1] = v))
			}
		/>
		<NumericControl
			label="Z"
			min={-50}
			max={50}
			step={0.01}
			bind:value={
				() => viewer.settings.camera.target[2],
				(v) => viewer.update((pico) => (pico.camera.target[2] = v))
			}
		/>
	</fieldset>
</fieldset>

<style>
	.disabledSpeed {
		display: block;
		width: 100%;
		margin-top: calc(var(--pico-spacing) * -0.75);
		margin-bottom: var(--pico-spacing);
		color: var(--pico-muted-color);
	}
</style>
