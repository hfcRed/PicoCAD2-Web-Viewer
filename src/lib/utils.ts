import { deflateRaw, inflateRaw } from 'pako';
import { encode, decode } from '@msgpack/msgpack';
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
	return btoa(String.fromCharCode(...deflateRaw(encode(state), { level: 9 })))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

export function decompressState(compressed: string) {
	try {
		const base64 = compressed.replace(/-/g, '+').replace(/_/g, '/');
		const data = inflateRaw(Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)));
		if (!data) throw new Error('Failed to decompress state');

		return decode(data) as PicoCAD2ViewerState;
	} catch (e) {
		console.error('Error decompressing state:', e);
		return null;
	}
}
