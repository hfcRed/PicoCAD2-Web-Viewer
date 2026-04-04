import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ url }) => {
	const embed = url.searchParams.get('embed') === 'true';

	return {
		embed
	};
};
