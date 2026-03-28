<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		buttonText: string;
		title: string;
		children: Snippet;
	}

	let { buttonText, title, children }: Props = $props();
	const id = $props.id();
</script>

<button commandfor={id} command="show-modal">
	{buttonText}
</button>

<dialog {id} closedby="any">
	<article class="scrollbar">
		<header>
			<p><strong>{title}</strong></p>
		</header>
		{@render children()}
		<footer>
			<button command="close" commandfor={id}>Close</button>
		</footer>
	</article>
</dialog>

<style>
	dialog {
		min-width: 100%;
		overscroll-behavior: contain;
	}
</style>
