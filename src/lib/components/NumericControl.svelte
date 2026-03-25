<script lang="ts">
	import type { FormEventHandler } from 'svelte/elements';

	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		step: number;
		disabled?: boolean;
		oninput?: FormEventHandler<HTMLInputElement>;
	}

	let { label, min, max, step, disabled, value = $bindable(), oninput }: Props = $props();

	function updateValue(v: number) {
		if (v === null) return v;
		return Math.max(min, Math.min(max, v));
	}
</script>

<div>
	<label>
		{label}
		<input type="range" {min} {max} {step} bind:value {oninput} {disabled} />
	</label>
	<input
		type="number"
		{min}
		{max}
		{step}
		{oninput}
		{disabled}
		bind:value={() => value, (v) => (value = updateValue(v))}
	/>
</div>

<style>
	div {
		display: grid;
		grid-template-columns: 1fr calc(
				(var(--pico-form-element-spacing-vertical) * 2) + (var(--pico-border-width) * 2) + 5ch
			);
		align-items: center;
		gap: 0.5rem;

		& input[type='number'] {
			padding: var(--pico-form-element-spacing-vertical) 0.5rem;
			font-family: var(--pico-font-family-monospace);
			font-size: 0.8rem;
		}

		input::-webkit-outer-spin-button,
		input::-webkit-inner-spin-button {
			-webkit-appearance: none;
			margin: 0;
		}
	}
</style>
