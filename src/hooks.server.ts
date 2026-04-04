import type { Handle } from '@sveltejs/kit';

export const handle: Handle = ({ event, resolve }) => {
	const url = new URL(event.request.url);
	const background = url.searchParams.get('background');

	return resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace('style', `style="background-color: #${background}"`)
	});
};
