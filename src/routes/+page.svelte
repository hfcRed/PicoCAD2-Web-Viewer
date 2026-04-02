<script lang="ts">
	import { COMPATIBLE_VERSION } from 'picocad2-web';
	import Viewer from '../lib/components/Viewer.svelte';
</script>

<h1>PicoCAD 2 Web Viewer</h1>

<p>
	A web-based viewer for PicoCAD 2 models. View, edit, apply effects, and share your PicoCAD 2
	creations directly in the browser.
</p>
<p>
	Built on top of
	<a href="https://github.com/hfcRed/PicoCAD2-Web" target="_blank" rel="noopener noreferrer"
		>PicoCAD2-Web</a
	>, a JavaScript library for rendering PicoCAD2 models in the browser.
</p>
<p>
	Buy PicoCAD 2 on
	<a
		href="https://store.steampowered.com/app/3675940/picoCAD_2/"
		target="_blank"
		rel="noopener noreferrer"
		>Steam
	</a>
	or on
	<a href="https://johanpeitz.itch.io/picocad2/" target="_blank" rel="noopener noreferrer">
		itch.io
	</a>, or visit the
	<a href="https://picocad.net/" target="_blank" rel="noopener noreferrer">PicoCAD website</a>.
</p>

<div class="credits">
	<small
		>Made by
		<a href="https://github.com/hfcRed" target="_blank" rel="noopener noreferrer">hfcRed</a>
	</small>
	<span>•</span>
	<small
		>Source code on
		<a
			href="https://github.com/hfcRed/PicoCAD2-Web-Viewer"
			target="_blank"
			rel="noopener noreferrer"
			>GitHub
		</a>
	</small>
	<span>•</span>
	<small>Compatible with PicoCAD 2 version &lt;= {COMPATIBLE_VERSION}</small>
</div>

<hr />

<Viewer />

<style>
	h1 {
		margin-top: calc(var(--pico-typography-spacing-vertical) * 2);
	}

	hr {
		margin-block: calc(var(--pico-typography-spacing-vertical) * 2);
	}

	.credits {
		color: var(--pico-muted-color);
	}
</style>
