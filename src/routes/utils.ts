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
