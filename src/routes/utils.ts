import LZString from 'lz-string';
import type { PicoCAD2ViewerState } from 'picocad2-web';

export function hexToRGB(s: string) {
	return [s.slice(1, 3), s.slice(3, 5), s.slice(5, 7)].map((s) => parseInt(s, 16) / 255) as [
		number,
		number,
		number
	];
}

export function rgbToHex(c: [number, number, number]): string {
	return (
		'#' +
		c
			.map((v) =>
				Math.round(v * 255)
					.toString(16)
					.padStart(2, '0')
			)
			.join('')
	);
}

export function compressState(state: PicoCAD2ViewerState) {
	return LZString.compressToEncodedURIComponent(JSON.stringify(state));
}

export function decompressState(compressed: string) {
	try {
		const json = LZString.decompressFromEncodedURIComponent(compressed);
		if (!json) throw new Error('Failed to decompress state');

		return JSON.parse(json) as PicoCAD2ViewerState;
	} catch (e) {
		console.error('Error decompressing state:', e);
		return null;
	}
}
