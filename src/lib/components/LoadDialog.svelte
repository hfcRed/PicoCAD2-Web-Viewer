<script lang="ts">
	import { viewer } from '../viewer-state.svelte';

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (viewer.pendingLoad) {
			if (!dialog.open) dialog.showModal();
		} else if (dialog.open) {
			dialog.close();
		}
	});
</script>

<dialog bind:this={dialog} closedby="any" onclose={() => viewer.cancelPendingLoad()}>
	<article>
		<header>
			<p><strong>Load Model</strong></p>
		</header>
		<p>Do you want to keep your current settings or reset them?</p>
		<footer>
			<button class="secondary" onclick={() => viewer.confirmPendingLoad(false)}>
				Reset Settings
			</button>
			<button onclick={() => viewer.confirmPendingLoad(true)}>Keep Settings</button>
		</footer>
	</article>
</dialog>
