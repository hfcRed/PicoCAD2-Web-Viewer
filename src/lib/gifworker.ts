import { GIFEncoder, quantize, applyPalette, nearestColorIndexWithDistance } from 'gifenc';

const frames: Uint8Array[] = [];

addEventListener('message', (event) => {
	const data = event.data;

	if (data.type === 'frame') {
		frames.push(data.data);
	} else if (data.type === 'reset') {
		frames.length = 0;
	} else if (data.type === 'generate') {
		generateAndReset(
			data.width,
			data.height,
			data.frameDuration,
			data.background,
			data.transparentColor
		);
	}
});

// GIF is the dumbest standard ever created it's genuinely dogshit
// GIF delays are in centiseconds so we can't just round every frame or it drifts
function frameDelay(index: number, frameDuration: number) {
	const start = Math.round(index * frameDuration * 100);
	const end = Math.round((index + 1) * frameDuration * 100);
	return (end - start) * 10;
}

function generateAndReset(
	width: number,
	height: number,
	frameDuration: number,
	background: number[],
	transparentColor: [number, number, number]
) {
	const encoder = GIFEncoder();

	for (let i = 0; i < frames.length; i++) {
		const frame = frames[i];

		for (let j = 0; j < frame.length; j += 4) {
			if (frame[j + 3] < 255) {
				frame[j] = background[0];
				frame[j + 1] = background[1];
				frame[j + 2] = background[2];
				frame[j + 3] = 255;
			}
		}

		const palette = quantize(frame, 256, { format: 'rgba4444' });

		let isTransparent = false;
		let transparentIndex = 0;

		const [idx, dist] = nearestColorIndexWithDistance(palette, transparentColor);
		if (Math.sqrt(dist) <= 5) {
			isTransparent = true;
			transparentIndex = idx;
		}

		const indices = applyPalette(frame, palette, 'rgba4444');

		encoder.writeFrame(indices, width, height, {
			palette,
			delay: frameDelay(i, frameDuration),
			transparent: isTransparent,
			transparentIndex
		});
	}

	encoder.finish();

	const buffer = encoder.bytesView();
	postMessage({ type: 'gif', data: buffer }, { transfer: [buffer.buffer as ArrayBuffer] });

	encoder.reset();
	frames.length = 0;
}

postMessage({ type: 'load' });
