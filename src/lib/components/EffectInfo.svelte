<script lang="ts">
	import { Popover } from 'bits-ui';

	interface Props {
		description?: string;
	}

	let { description }: Props = $props();
</script>

{#if description}
	<Popover.Root>
		<div>
			<Popover.Trigger>
				{#snippet child({ props })}
					<button class="outline secondary" {...props}>?</button>
				{/snippet}
			</Popover.Trigger>
		</div>
		<Popover.Portal>
			<Popover.Content side="top" sideOffset={5} align="center" collisionPadding={16}>
				<div class="description">{description}</div>
			</Popover.Content>
		</Popover.Portal>
	</Popover.Root>
{/if}

<style>
	button {
		height: 1.25rem;
		padding: 0;
		aspect-ratio: 1 / 1;
		line-height: 0;
		font-weight: bold;
		font-size: 0.875em;
		opacity: 0.8;
	}

	.description {
		background-color: var(--pico-background-color);
		border: var(--pico-border-width) solid var(--pico-form-element-border-color);
		border-radius: var(--pico-border-radius);
		padding: var(--pico-form-element-spacing-horizontal);
		max-width: 50vw;
		filter: drop-shadow(0 0 0.5rem rgba(0, 0, 0, 0.25));
	}
</style>
