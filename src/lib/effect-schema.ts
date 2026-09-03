import type { Color3, ExtrasState } from 'picocad2-web';

export type EffectKey = Exclude<keyof ExtrasState, 'crt'>;

export interface SelectOption {
	value: string | number;
	label: string;
}

interface ControlBase {
	path: string;
	info?: string;
	showIf?: (extras: ExtrasState) => boolean;
}

export type Control =
	| ({
			kind: 'slider';
			label: string;
			min: number;
			max: number;
			step: number;
	  } & ControlBase)
	| ({ kind: 'select'; label: string; options: readonly SelectOption[] } & ControlBase)
	| ({ kind: 'color'; label: string } & ControlBase)
	| ({ kind: 'colorList'; label: string } & ControlBase)
	| ({ kind: 'toggle'; label: string } & ControlBase)
	| ({ kind: 'mask'; title?: string } & ControlBase)
	| ({ kind: 'meshes'; title?: string } & ControlBase)
	| ({ kind: 'paletteMap' } & ControlBase);

export interface EffectSchema {
	key: EffectKey;
	title: string;
	info: string;
	controls: Control[];
}

interface EffectSchemaOf<K extends EffectKey> extends EffectSchema {
	key: K;
}

export interface EffectSection {
	title: string;
	info: string;
	effects: EffectSchema[];
}

type Extra = Pick<ControlBase, 'info' | 'showIf'>;

/** The value type at a dot-separated path inside T, with optionality stripped. */
type PathValue<T, P extends string> = P extends `${infer Head}.${infer Rest}`
	? Head extends keyof NonNullable<T>
		? PathValue<NonNullable<T>[Head], Rest>
		: never
	: P extends keyof NonNullable<T>
		? NonNullable<NonNullable<T>[P]>
		: never;

/** Resolves to P when the path exists in T and its value type fits V, never otherwise. */
type PathOf<T, P extends string, V> = P &
	([PathValue<T, P>] extends [never] ? never : PathValue<T, P> extends V ? unknown : never);

interface BaseBuilders<T> {
	slider<P extends string>(
		path: PathOf<T, P, number>,
		label: string,
		min: number,
		max: number,
		step: number,
		extra?: Extra
	): Control;
	vec<P extends string>(
		path: PathOf<T, P, readonly number[]>,
		label: string,
		min: number,
		max: number,
		step: number,
		extra?: Extra,
		axes?: readonly string[]
	): Control[];
	rgb<P extends string>(
		path: PathOf<T, P, readonly [number, number, number]>,
		suffix: string,
		min: number,
		max: number,
		step: number,
		info?: string
	): Control[];
	select<P extends string>(
		path: PathOf<T, P, string | number>,
		label: string,
		options: readonly { value: PathValue<T, P>; label: string }[],
		extra?: Extra
	): Control;
	color<P extends string>(
		path: PathOf<T, P, readonly [number, number, number]>,
		label: string,
		extra?: Extra
	): Control;
	colorList<P extends string>(
		path: PathOf<T, P, readonly Color3[]>,
		label: string,
		extra?: Extra
	): Control;
	toggle<P extends string>(path: PathOf<T, P, boolean>, label: string, extra?: Extra): Control;
	maskAt<P extends string>(
		path: PathOf<T, P, readonly number[]>,
		title: string,
		extra?: Extra
	): Control;
	paletteMap<P extends string>(path: PathOf<T, P, readonly number[]>): Control;
}

type ControlBuilders<T> = BaseBuilders<T> &
	('maskedColors' extends keyof NonNullable<T> ? { mask(extra?: Extra): Control } : unknown) &
	('nodes' extends keyof NonNullable<T> ? { nodes(): Control } : unknown) &
	('style' extends keyof NonNullable<T> ? { style(): Control } : unknown) &
	('modelOnly' extends keyof NonNullable<T> ? { modelOnly(): Control } : unknown);

const NODES_TITLE = 'Meshes';

const STYLE_INFO =
	"Palette renders the effect with the model's palette only, so colors snap to the nearest palette entry and soft edges dither with the shading checkerboard. Dithered keeps the checkerboard but uses the configured colors as-is. Smooth blends colors directly.";

const MODEL_ONLY_INFO =
	'Applies the effect to model pixels only. When disabled with an opaque background, this and every following effect covers the whole screen. With a transparent background, disabling it can produce partially transparent pixels, which exported GIFs cannot display.';

const RANDOM_HUE_INFO =
	'Gives each element a random hue shift within the hue range. Not available in palette style.';

const CYCLE_INFO =
	'Runs the progress from 0 to 1 and back automatically. One cycle takes the cycle duration in seconds, including a rest of the hold length at each end. The manual progress is ignored while cycling.';

const SWEEP_MODE_INFO =
	'Where the front runs. Uniform applies to the whole model at once, noise applies to random cells, directional sweeps a plane along the direction, point grows a sphere from the point, and proximity wipes front to back from the camera.';

const SWEEP_WAVE_INFO =
	'Width of a traveling wave as a fraction of the sweep range. The wave enters at progress 0 and has left at progress 1, restoring the model behind it. 0 sweeps a front that stays.';

const SWEEP_INVERT_INFO =
	'Inverts the progress. At 0 the whole model is swept and it restores as the progress rises.';

const hasWave = (mode: string | undefined) =>
	mode === 'directional' || mode === 'point' || mode === 'proximity';

const SWEEP_MODE_OPTIONS = [
	{ value: 'uniform', label: 'Uniform' },
	{ value: 'noise', label: 'Noise' },
	{ value: 'directional', label: 'Directional' },
	{ value: 'point', label: 'Point' },
	{ value: 'proximity', label: 'Proximity' }
] as const satisfies readonly SelectOption[];

const STYLE_OPTIONS = [
	{ value: 'palette', label: 'Palette' },
	{ value: 'dithered', label: 'Dithered' },
	{ value: 'smooth', label: 'Smooth' }
] as const satisfies readonly SelectOption[];

const PATTERN_OPTIONS = [
	{ value: 'stars', label: 'Stars' },
	{ value: 'dust', label: 'Dust' },
	{ value: 'voronoi', label: 'Voronoi' },
	{ value: 'lava', label: 'Lava' },
	{ value: 'grid', label: 'Grid' },
	{ value: 'truchet', label: 'Truchet' },
	{ value: 'constellations', label: 'Constellations' }
] as const satisfies readonly SelectOption[];

const AXIS_OPTIONS = [
	{ value: 'x', label: 'X' },
	{ value: 'y', label: 'Y' },
	{ value: 'z', label: 'Z' }
] as const satisfies readonly SelectOption[];

const BUILDERS = {
	slider: (
		path: string,
		label: string,
		min: number,
		max: number,
		step: number,
		extra: Extra = {}
	): Control => ({ kind: 'slider', path, label, min, max, step, ...extra }),
	vec: (
		path: string,
		label: string,
		min: number,
		max: number,
		step: number,
		extra: Extra = {},
		axes: readonly string[] = ['X', 'Y', 'Z']
	): Control[] =>
		axes.map((axis, i) =>
			BUILDERS.slider(`${path}.${i}`, `${label} ${axis}`, min, max, step, extra)
		),
	rgb: (
		path: string,
		suffix: string,
		min: number,
		max: number,
		step: number,
		info?: string
	): Control[] =>
		['Red', 'Green', 'Blue'].map((channel, i) =>
			BUILDERS.slider(
				`${path}.${i}`,
				`${channel} ${suffix}`,
				min,
				max,
				step,
				i === 0 ? { info } : {}
			)
		),
	select: (
		path: string,
		label: string,
		options: readonly SelectOption[],
		extra: Extra = {}
	): Control => ({ kind: 'select', path, label, options, ...extra }),
	color: (path: string, label: string, extra: Extra = {}): Control => ({
		kind: 'color',
		path,
		label,
		...extra
	}),
	colorList: (path: string, label: string, extra: Extra = {}): Control => ({
		kind: 'colorList',
		path,
		label,
		...extra
	}),
	toggle: (path: string, label: string, extra: Extra = {}): Control => ({
		kind: 'toggle',
		path,
		label,
		...extra
	}),
	mask: (extra: Extra = {}): Control => ({ kind: 'mask', path: 'maskedColors', ...extra }),
	maskAt: (path: string, title: string, extra: Extra = {}): Control => ({
		kind: 'mask',
		path,
		title,
		...extra
	}),
	nodes: (): Control => ({ kind: 'meshes', path: 'nodes', title: NODES_TITLE }),
	paletteMap: (path: string): Control => ({ kind: 'paletteMap', path }),
	style: (): Control => BUILDERS.select('style', 'Style', STYLE_OPTIONS, { info: STYLE_INFO }),
	modelOnly: (): Control => BUILDERS.toggle('modelOnly', 'Model Only', { info: MODEL_ONLY_INFO })
};

function effect<K extends EffectKey>(
	key: K,
	def: {
		title: string;
		info: string;
		controls: (c: ControlBuilders<ExtrasState[K]>) => Control[];
	}
): EffectSchemaOf<K> {
	return {
		key,
		title: def.title,
		info: def.info,
		controls: def.controls(BUILDERS as unknown as ControlBuilders<ExtrasState[K]>)
	};
}

export const EFFECT_SECTIONS = [
	{
		title: 'Material Effects',
		info: "Effects that change how the model's surfaces themselves are colored. They render inside the model shader before any post processing, so they use the model's true normals, work in every render path, and never change the palette colors that color masks match. Most offer the shared style setting for palette-pure, dithered, or smooth rendering.",
		effects: [
			effect('paletteSwap', {
				title: 'Color Palette',
				info: "Recolors the model by rewriting the palette lookup. Swapped colors keep the target's shade ramp so recolored surfaces still shade correctly, and the selected cycle colors rotate through each other over time in a perfect loop. Palette-based effects follow the swap, while color masks keep matching the original colors.",
				controls: (c) => [
					c.paletteMap('map'),
					c.maskAt('cycleIndices', 'Colors to Cycle'),
					c.slider('cycleSpeed', 'Cycle Speed', 0, 20, 1, {
						info: 'The number of cycle steps per second.'
					}),
					c.slider('cycleBlendTime', 'Blend Time', 0, 1, 0.01, {
						info: 'Seconds each cycle step spends blending into the next color, capped at the step duration.'
					}),
					c.select('cycleStyle', 'Blend Style', STYLE_OPTIONS, {
						info: 'Palette snaps to the next color instantly, dithered dissolves pixel by pixel, smooth cross-fades the palette colors.'
					})
				]
			}),
			effect('colorCutout', {
				title: 'Cutout',
				info: 'Renders the selected palette colors as additional transparent colors. The cutouts are real holes that outlines, depth effects and color masks recognize. Nothing is cut while no colors are selected.',
				controls: (c) => [c.mask(), c.nodes()]
			}),
			effect('dissolve', {
				title: 'Dissolve',
				info: 'Dissolves the model texel by texel as the progress runs from 0 to 1, punching real holes that outlines and depth effects recognize. Survivors near the cut show the edge color as a glowing band, and fur strands dissolve with their base surface.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.slider('progress', 'Progress', 0, 1, 0.01, {
						showIf: (e) => !e.dissolve.cycle?.enabled
					}),
					c.toggle('cycle.enabled', 'Cycle', { info: CYCLE_INFO }),
					c.slider('cycle.duration', 'Cycle Duration', 0.1, 20, 0.1, {
						showIf: (e) => !!e.dissolve.cycle?.enabled
					}),
					c.slider('cycle.hold', 'Cycle Hold', 0, 10, 0.1, {
						showIf: (e) => !!e.dissolve.cycle?.enabled
					}),
					c.select('sweep.mode', 'Sweep', SWEEP_MODE_OPTIONS, { info: SWEEP_MODE_INFO }),
					c.slider('sweep.scale', 'Sweep Scale', 0, 20, 0.01, {
						showIf: (e) => e.dissolve.sweep?.mode === 'noise'
					}),
					...c.vec('sweep.direction', 'Sweep Direction', -1, 1, 0.01, {
						showIf: (e) => e.dissolve.sweep?.mode === 'directional'
					}),
					...c.vec('sweep.point', 'Sweep Point', -1, 1, 0.01, {
						showIf: (e) => e.dissolve.sweep?.mode === 'point'
					}),
					c.slider('sweep.softness', 'Sweep Softness', 0, 1, 0.01, {
						showIf: (e) => e.dissolve.sweep?.mode !== 'uniform'
					}),
					c.slider('sweep.wave', 'Sweep Wave', 0, 1, 0.01, {
						showIf: (e) => hasWave(e.dissolve.sweep?.mode),
						info: SWEEP_WAVE_INFO
					}),
					c.toggle('sweep.invert', 'Sweep Invert', { info: SWEEP_INVERT_INFO }),
					c.slider('edgeWidth', 'Edge Width', 0, 10, 0.01, {
						showIf: (e) => e.dissolve.sweep?.mode !== 'uniform'
					}),
					c.color('edgeColor', 'Edge Color', {
						showIf: (e) => e.dissolve.sweep?.mode !== 'uniform'
					}),
					c.style()
				]
			}),
			effect('emission', {
				title: 'Emission',
				info: 'The masked palette colors ignore shading and render fullbright. The blink settings pulse the emission over time, and the scroll settings run lit band waves through the model. Pair with a bloom mask on the same colors for a glow halo.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.slider('strength', 'Strength', 0, 1, 0.01),
					c.select('blinkMode', 'Blink Mode', [
						{ value: 'smooth', label: 'Smooth' },
						{ value: 'pulse', label: 'Pulse' }
					]),
					c.slider('blinkRate', 'Blink Rate', 0, 20, 0.1),
					c.slider('blinkMin', 'Blink Minimum', 0, 1, 0.01, {
						info: 'The lowest the emission dips during a blink.'
					}),
					c.slider('scrollGap', 'Scroll Gap', 0, 5, 0.01, {
						info: 'The world-space gap between the lit bands. 0 disables the scroll wave.'
					}),
					c.slider('scrollWidth', 'Scroll Width', 0, 1, 0.01),
					c.slider('scrollSpeed', 'Scroll Speed', -10, 10, 0.1),
					...c.vec('scrollDirection', 'Scroll Direction', -1, 1, 0.01),
					c.style()
				]
			}),
			effect('projection', {
				title: 'Projection',
				info: 'Projects a pattern onto the model along a direction. Light brightens shaded surfaces toward their lit color, shadow darkens them, and tint paints a color where the pattern hits. Only faces turned toward the direction receive it.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.select('pattern', 'Pattern', PATTERN_OPTIONS),
					c.select(
						'mode',
						'Mode',
						[
							{ value: 'light', label: 'Light' },
							{ value: 'shadow', label: 'Shadow' },
							{ value: 'tint', label: 'Tint' }
						],
						{
							info: "Light only shows on shaded surfaces, since lit is the palette's brightest. Shadow and tint show everywhere the pattern lands."
						}
					),
					c.color('color', 'Color', { showIf: (e) => e.projection.mode === 'tint' }),
					...c.vec('direction', 'Direction', -1, 1, 0.01),
					c.slider('scale', 'Scale', 0.1, 20, 0.1),
					c.slider('speed', 'Speed', 0, 10, 0.1),
					c.slider('seed', 'Seed', 0, 100, 1),
					c.slider('strength', 'Strength', 0, 1, 0.01),
					c.slider('facing', 'Facing', 0, 1, 0.01, {
						info: 'How squarely a face must face the direction to receive the projection. 0 lets every face the direction can see receive it.'
					}),
					c.style()
				]
			}),
			effect('interior', {
				title: 'Interior',
				info: 'Fakes depth behind the masked palette colors by marching into the surface and sampling a procedural pattern at several depths, with parallax that tracks the camera.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.select('pattern', 'Pattern', PATTERN_OPTIONS),
					c.slider('depth', 'Depth', 0, 10, 0.1),
					c.slider('layers', 'Layers', 1, 5, 1),
					c.slider('scale', 'Scale', 0, 20, 0.1),
					c.slider('speed', 'Speed', 0, 10, 0.1),
					c.slider('seed', 'Seed', 0, 100, 1),
					c.color('color', 'Color'),
					c.color('backgroundColor', 'Background Color'),
					c.toggle('randomHue', 'Random Hue', { info: RANDOM_HUE_INFO }),
					c.slider('hueRange', 'Hue Range', 0, 1, 0.01, {
						showIf: (e) => e.interior.randomHue === true
					}),
					c.style()
				]
			}),
			effect('gradientLight', {
				title: 'Gradient Light',
				info: 'Tints the model with a two-color ramp from the shadow color to the lit color, driven by the light direction, world height, or screen height.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.color('litColor', 'Lit Color'),
					c.color('shadowColor', 'Shadow Color'),
					c.select('source', 'Source', [
						{ value: 'light', label: 'Light' },
						{ value: 'worldY', label: 'World Y' },
						{ value: 'screenY', label: 'Screen Y' }
					]),
					c.slider('blend', 'Blend', 0, 1, 0.01),
					c.style()
				]
			}),
			effect('specular', {
				title: 'Specular',
				info: 'Blinn-Phong highlight from the light source, with an optional procedural sky and ground reflection applied on top.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.slider('strength', 'Strength', 0, 2, 0.01),
					c.slider('smoothness', 'Smoothness', 0, 1, 0.01),
					c.color('color', 'Color'),
					c.slider('anisotropy', 'Anisotropy', 0, 1, 0.01, {
						info: 'Stretches the highlight sideways into a band across the model.'
					}),
					c.slider('environment.strength', 'Environment Strength', 0, 1, 0.01, {
						info: 'Blends in a procedural sky and ground reflection. 0 disables the reflection.'
					}),
					c.color('environment.skyColor', 'Sky Color', {
						showIf: (e) => (e.specular.environment?.strength ?? 0) > 0
					}),
					c.color('environment.groundColor', 'Ground Color', {
						showIf: (e) => (e.specular.environment?.strength ?? 0) > 0
					}),
					c.slider('environment.horizon', 'Horizon', 0, 1, 0.01, {
						showIf: (e) => (e.specular.environment?.strength ?? 0) > 0
					}),
					c.slider('environment.fresnel', 'Fresnel', 0, 1, 0.01, {
						showIf: (e) => (e.specular.environment?.strength ?? 0) > 0,
						info: 'Strengthens the reflection at grazing angles.'
					}),
					c.style()
				]
			}),
			effect('rimLight', {
				title: 'Rim Light',
				info: "Fresnel rim light around the model's silhouette, where surfaces turn away from the camera.",
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.color('color', 'Color'),
					c.slider('width', 'Width', 0, 1, 0.01),
					c.slider('sharpness', 'Sharpness', 0, 1, 0.01),
					c.slider('lightAlign', 'Light Align', -1, 1, 0.01, {
						info: '-1 rims the shadow side like a backlight, 0 the whole silhouette, 1 the lit side.'
					}),
					c.slider('blend', 'Blend', 0, 1, 0.01),
					c.style(),
					c.toggle('invert', 'Invert', {
						info: 'Lights the surfaces facing the camera instead of the silhouette.'
					})
				]
			}),
			effect('glitter', {
				title: 'Glitter',
				info: 'Sparkle cells that light up while the camera aligns with their random facet, popping in and out as the view orbits.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.select(
						'space',
						'Space',
						[
							{ value: 'uv', label: 'UV' },
							{ value: 'screen', label: 'Screen' },
							{ value: 'world', label: 'World' }
						],
						{
							info: 'Where the sparkle cells live. Pinned to the texture, stuck to the screen, or fixed in the world.'
						}
					),
					c.slider('density', 'Density', 1, 128, 1),
					c.slider('size', 'Size', 0, 1, 0.01),
					c.color('color', 'Color'),
					c.toggle('randomHue', 'Random Hue', { info: RANDOM_HUE_INFO }),
					c.slider('hueRange', 'Hue Range', 0, 1, 0.01, {
						showIf: (e) => e.glitter.randomHue === true
					}),
					c.slider('brightness', 'Brightness', 0, 5, 0.01),
					c.slider('angleRange', 'Angle Range', 1, 90, 1, {
						info: "How far the camera can be off a sparkle's facet before it goes dark. Higher values show more sparkles at once."
					}),
					c.slider('speed', 'Speed', 0, 10, 0.1),
					c.select('shape', 'Shape', [
						{ value: 'square', label: 'Square' },
						{ value: 'circle', label: 'Circle' }
					]),
					c.style()
				]
			})
		]
	},
	{
		title: 'Geometry Effects',
		info: "Effects that reshape the model's geometry or grow new geometry from it. Deforming, flashing, shattering, fur, and turning meshes toward the camera. The changed shape is actual geometry. Shading, outlines, depth effects and color masks all recognize it.",
		effects: [
			effect('meshDeform', {
				title: 'Mesh Deform',
				info: 'Stackable geometry deforms. Voxel remeshes the model into grid-aligned cubes that keep the color of the surface they replace, and the barrel, spherify and twist warps apply on top, so a voxelized model can still bend. The progress runs the whole deform from untouched to full, and a sweep moves its front across the model.',
				controls: (c) => [
					c.nodes(),
					c.slider('progress', 'Progress', 0, 1, 0.01, {
						showIf: (e) => !e.meshDeform.cycle?.enabled
					}),
					c.toggle('cycle.enabled', 'Cycle', { info: CYCLE_INFO }),
					c.slider('cycle.duration', 'Cycle Duration', 0.1, 20, 0.1, {
						showIf: (e) => !!e.meshDeform.cycle?.enabled
					}),
					c.slider('cycle.hold', 'Cycle Hold', 0, 10, 0.1, {
						showIf: (e) => !!e.meshDeform.cycle?.enabled
					}),
					c.select('sweep.mode', 'Sweep', SWEEP_MODE_OPTIONS, { info: SWEEP_MODE_INFO }),
					c.slider('sweep.scale', 'Sweep Scale', 0, 20, 0.01, {
						showIf: (e) => e.meshDeform.sweep?.mode === 'noise'
					}),
					...c.vec('sweep.direction', 'Sweep Direction', -1, 1, 0.01, {
						showIf: (e) => e.meshDeform.sweep?.mode === 'directional'
					}),
					...c.vec('sweep.point', 'Sweep Point', -1, 1, 0.01, {
						showIf: (e) => e.meshDeform.sweep?.mode === 'point'
					}),
					c.slider('sweep.softness', 'Sweep Softness', 0, 1, 0.01, {
						showIf: (e) => e.meshDeform.sweep?.mode !== 'uniform'
					}),
					c.slider('sweep.wave', 'Sweep Wave', 0, 1, 0.01, {
						showIf: (e) => hasWave(e.meshDeform.sweep?.mode),
						info: SWEEP_WAVE_INFO
					}),
					c.toggle('sweep.invert', 'Sweep Invert', { info: SWEEP_INVERT_INFO }),
					c.toggle('voxel.enabled', 'Voxel'),
					c.slider('voxel.gridSize', 'Voxel Grid Size', 0.05, 2, 0.01, {
						showIf: (e) => e.meshDeform.voxel?.enabled === true
					}),
					c.slider('barrel.amount', 'Barrel', -1, 1, 0.01),
					c.select('barrel.axis', 'Barrel Axis', AXIS_OPTIONS),
					c.slider('spherify.amount', 'Spherify', 0, 1, 0.01),
					c.slider('twist.amount', 'Twist', -5, 5, 0.01),
					c.select('twist.axis', 'Twist Axis', AXIS_OPTIONS),
					c.slider('twist.speed', 'Twist Speed', -10, 10, 0.1, {
						info: 'Spins the twist over time, turning it into a tornado.'
					})
				]
			}),
			effect('triangleFlash', {
				title: 'Triangle Flash',
				info: "Random triangles blink a color for a moment. Flashing triangles keep their palette color underneath, so other effects' color masks are unaffected.",
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.color('color', 'Color'),
					c.slider('rate', 'Rate', 0, 30, 1),
					c.slider('density', 'Density', 0, 1, 0.01),
					c.slider('duration', 'Duration', 0, 2, 0.01),
					c.slider('softness', 'Softness', 0, 1, 0.01),
					c.select(
						'mode',
						'Mode',
						[
							{ value: 'replace', label: 'Replace' },
							{ value: 'add', label: 'Add' }
						],
						{
							info: 'Add brightens the triangle instead of replacing its color. Only applies in smooth style.'
						}
					),
					c.style()
				]
			}),
			effect('triangleShatter', {
				title: 'Triangle Shatter',
				info: 'Blows the model apart into its triangles as the progress runs from 0 to 1. The wireframe and fur hide while a shatter is in progress.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.slider('progress', 'Progress', 0, 1, 0.01, {
						showIf: (e) => !e.triangleShatter.cycle?.enabled
					}),
					c.toggle('cycle.enabled', 'Cycle', { info: CYCLE_INFO }),
					c.slider('cycle.duration', 'Cycle Duration', 0.1, 20, 0.1, {
						showIf: (e) => !!e.triangleShatter.cycle?.enabled
					}),
					c.slider('cycle.hold', 'Cycle Hold', 0, 10, 0.1, {
						showIf: (e) => !!e.triangleShatter.cycle?.enabled
					}),
					c.select('sweep.mode', 'Sweep', SWEEP_MODE_OPTIONS, { info: SWEEP_MODE_INFO }),
					c.slider('sweep.scale', 'Sweep Scale', 0, 20, 0.01, {
						showIf: (e) => e.triangleShatter.sweep?.mode === 'noise'
					}),
					...c.vec('sweep.direction', 'Sweep Direction', -1, 1, 0.01, {
						showIf: (e) => e.triangleShatter.sweep?.mode === 'directional'
					}),
					...c.vec('sweep.point', 'Sweep Point', -1, 1, 0.01, {
						showIf: (e) => e.triangleShatter.sweep?.mode === 'point'
					}),
					c.slider('sweep.softness', 'Sweep Softness', 0, 1, 0.01, {
						showIf: (e) => e.triangleShatter.sweep?.mode !== 'uniform'
					}),
					c.slider('sweep.wave', 'Sweep Wave', 0, 1, 0.01, {
						showIf: (e) => hasWave(e.triangleShatter.sweep?.mode),
						info: SWEEP_WAVE_INFO
					}),
					c.toggle('sweep.invert', 'Sweep Invert', { info: SWEEP_INVERT_INFO }),
					c.select('mode', 'Mode', [
						{ value: 'normal', label: 'Normal' },
						{ value: 'radial', label: 'Radial' },
						{ value: 'directional', label: 'Directional' }
					]),
					...c.vec('direction', 'Direction', -1, 1, 0.01, {
						showIf: (e) => e.triangleShatter.mode === 'directional'
					}),
					c.slider('distance', 'Distance', 0, 10, 0.1),
					c.slider('spread', 'Spread', 0, 2, 0.01),
					c.slider('rotation', 'Rotation', 0, 10, 0.1),
					c.slider('gravity', 'Gravity', -10, 10, 0.1, {
						info: 'Pulls the pieces down as they fly. Negative values lift them instead.'
					}),
					c.slider('shrink', 'Shrink', 0, 1, 0.01)
				]
			}),
			effect('vertexGlitch', {
				title: 'Vertex Glitch',
				info: 'Rhythmic mesh spikes. Every beat picks random triangles or vertices and pushes them out for a moment. Triangle mode spikes whole triangles along their normal and tears the mesh, vertex mode moves shared corners together.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.slider('progress', 'Progress', 0, 1, 0.01, {
						showIf: (e) => !e.vertexGlitch.cycle?.enabled
					}),
					c.toggle('cycle.enabled', 'Cycle', { info: CYCLE_INFO }),
					c.slider('cycle.duration', 'Cycle Duration', 0.1, 20, 0.1, {
						showIf: (e) => !!e.vertexGlitch.cycle?.enabled
					}),
					c.slider('cycle.hold', 'Cycle Hold', 0, 10, 0.1, {
						showIf: (e) => !!e.vertexGlitch.cycle?.enabled
					}),
					c.select('sweep.mode', 'Sweep', SWEEP_MODE_OPTIONS, { info: SWEEP_MODE_INFO }),
					c.slider('sweep.scale', 'Sweep Scale', 0, 20, 0.01, {
						showIf: (e) => e.vertexGlitch.sweep?.mode === 'noise'
					}),
					...c.vec('sweep.direction', 'Sweep Direction', -1, 1, 0.01, {
						showIf: (e) => e.vertexGlitch.sweep?.mode === 'directional'
					}),
					...c.vec('sweep.point', 'Sweep Point', -1, 1, 0.01, {
						showIf: (e) => e.vertexGlitch.sweep?.mode === 'point'
					}),
					c.slider('sweep.softness', 'Sweep Softness', 0, 1, 0.01, {
						showIf: (e) => e.vertexGlitch.sweep?.mode !== 'uniform'
					}),
					c.slider('sweep.wave', 'Sweep Wave', 0, 1, 0.01, {
						showIf: (e) => hasWave(e.vertexGlitch.sweep?.mode),
						info: SWEEP_WAVE_INFO
					}),
					c.toggle('sweep.invert', 'Sweep Invert', { info: SWEEP_INVERT_INFO }),
					c.select(
						'unit',
						'Unit',
						[
							{ value: 'triangle', label: 'Triangle' },
							{ value: 'vertex', label: 'Vertex' }
						],
						{
							info: 'Triangle spikes whole triangles along their normal and hides the wireframe and fur. Vertex moves shared corners together so the mesh stays welded and the wireframe and fur follow.'
						}
					),
					c.slider('strength', 'Strength', 0, 2, 0.01),
					c.slider('rate', 'Rate', 0, 30, 1, { info: 'Beats per second.' }),
					c.slider('density', 'Density', 0, 1, 0.01, {
						info: 'The fraction of triangles or vertices that spike each beat.'
					}),
					c.slider('duration', 'Duration', 0, 1, 0.01, {
						info: 'How many seconds a spike lasts within its beat.'
					}),
					c.slider('softness', 'Softness', 0, 1, 0.01, {
						info: '0 snaps to the spike and back, 1 eases out and back over the whole spike.'
					})
				]
			}),
			effect('fur', {
				title: 'Fur',
				info: 'Grows shell-textured fur by redrawing the model as a stack of offset shells carved into strands. Fur only grows where the surface is painted with the masked colors, and it follows mesh deforms and dissolves.',
				controls: (c) => [
					c.mask(),
					c.nodes(),
					c.slider('length', 'Length', 0, 1, 0.01),
					c.slider('layers', 'Layers', 1, 32, 1),
					c.slider('density', 'Density', 1, 128, 1),
					...c.vec('gravity', 'Gravity', -1, 1, 0.01),
					c.slider('rootShade', 'Root Shade', 0, 1, 0.01, {
						info: "Darkens the strand roots through the palette's shade rows."
					})
				]
			}),
			effect('billboard', {
				title: 'Billboard',
				info: 'Turns the selected nodes toward the camera while keeping their position and scale. With nothing selected, every top-level node billboards, groups included. Children follow their parent, and billboarding overrides animated rotation.',
				controls: (c) => [
					c.nodes(),
					c.select(
						'mode',
						'Mode',
						[
							{ value: 'full', label: 'Full' },
							{ value: 'yaw', label: 'Yaw' }
						],
						{
							info: 'Full faces the camera on all axes, yaw only spins around the vertical axis.'
						}
					)
				]
			})
		]
	},
	{
		title: 'Scene Effects',
		info: 'Effects that draw additional geometry into the 3D scene alongside the model, with real depth. They draw before the post-processing chain, so fog, outlines and every later effect treat them as part of the scene.',
		effects: [
			effect('floor', {
				title: 'Floor',
				info: 'A plane under the model with grid lines, a shadow cast from the model and a mirror image of it. The shadow and the reflection redraw the whole model, so animation, deforms, fur and material effects show in both. Both hide while the camera looks at the plate from below.',
				controls: (c) => [
					c.toggle('surface', 'Surface', {
						info: 'Draws the plate surface itself. Off leaves only the grid, the shadow and the reflection.'
					}),
					c.toggle('infinite', 'Infinite', {
						info: 'Extends the plate to the horizon. Ignores size and edge fade.'
					}),
					c.slider('offset', 'Offset', -2, 5, 0.01, {}),
					c.slider('size', 'Size', 0.5, 6, 0.1, {
						showIf: (e) => !e.floor.infinite,
						info: "The plate's width as a multiple of the model's footprint."
					}),
					c.color('color', 'Color', { showIf: (e) => e.floor.surface !== false }),
					c.slider('fade', 'Edge Fade', 0, 1, 0.01, { showIf: (e) => !e.floor.infinite }),
					c.toggle('grid.enabled', 'Grid'),
					c.slider('grid.spacing', 'Grid Spacing', 0.1, 5, 0.1, {
						showIf: (e) => !!e.floor.grid?.enabled
					}),
					c.slider('grid.thickness', 'Grid Thickness', 0, 8, 0.5, {
						showIf: (e) => !!e.floor.grid?.enabled
					}),
					c.color('grid.color', 'Grid Color', { showIf: (e) => !!e.floor.grid?.enabled }),
					c.toggle('shadow.enabled', 'Shadow'),
					...c.vec('shadow.direction', 'Shadow Direction', -1, 1, 0.01, {
						showIf: (e) => !!e.floor.shadow?.enabled,
						info: 'The direction the shadow is cast along. It must point down to reach the plate.'
					}),
					c.color('shadow.color', 'Shadow Color', { showIf: (e) => !!e.floor.shadow?.enabled }),
					c.slider('shadow.strength', 'Shadow Strength', 0, 1, 0.01, {
						showIf: (e) => !!e.floor.shadow?.enabled
					}),
					c.slider('shadow.softness', 'Shadow Softness', 0, 3, 0.01, {
						showIf: (e) => !!e.floor.shadow?.enabled
					}),
					c.toggle('reflection.enabled', 'Reflection'),
					c.slider('reflection.strength', 'Reflection Strength', 0, 1, 0.01, {
						showIf: (e) => !!e.floor.reflection?.enabled
					}),
					c.style()
				]
			}),
			effect('wireframe', {
				title: 'Wireframe',
				info: "Draws the model's triangle edges as lines.",
				controls: (c) => [c.color('color', 'Wireframe Color')]
			}),
			effect('particles', {
				title: 'Particles',
				info: 'Stateless looping particles floating around the model in a volume scaled to its bounds. The motion style layers drifting, orbiting or straight movement on top of the constant velocity.',
				controls: (c) => [
					c.maskAt('paletteIndices', 'Particle Colors', {
						info: 'Particles pick a random color from the selection, or render white when nothing is selected.'
					}),
					c.slider('count', 'Count', 0, 2000, 10),
					c.select('shape', 'Shape', [
						{ value: 'pixel', label: 'Pixel' },
						{ value: 'quad', label: 'Quad' },
						{ value: 'cube', label: 'Cube' },
						{ value: 'triangle', label: 'Triangle' }
					]),
					c.select('motion', 'Motion', [
						{ value: 'drift', label: 'Drift' },
						{ value: 'orbit', label: 'Orbit' },
						{ value: 'linear', label: 'Linear' }
					]),
					c.slider('size', 'Size', 0, 10, 0.1),
					c.slider('sizeJitter', 'Size Jitter', 0, 1, 0.01),
					c.slider('speed', 'Speed', 0, 10, 0.1),
					...c.vec('velocity', 'Velocity', -1, 1, 0.01),
					c.slider('areaScale', 'Area Scale', 0.1, 5, 0.1),
					c.slider('twinkle', 'Twinkle', 0, 1, 0.01),
					c.toggle('randomHue', 'Random Hue', {
						info: 'Gives each particle a random hue shift within the hue range.'
					}),
					c.slider('hueRange', 'Hue Range', 0, 1, 0.01, {
						showIf: (e) => e.particles.randomHue === true
					})
				]
			})
		]
	},
	{
		title: 'Post Processing',
		info: 'Fullscreen passes over the rendered image, applied in the order they are listed. By default they only affect model pixels (Model Only), and most can be limited to selected palette colors with a color mask.',
		effects: [
			effect('gradientOutline', {
				title: 'Gradient Outline',
				info: "Outlines the model's silhouette with an optional two-color gradient across the outline. Drop shadow mode instead repeats the whole silhouette displaced by an offset, for a sticker look.",
				controls: (c) => [
					c.slider('size', 'Width', 0, 10, 1),
					c.color('colorFrom', 'Color'),
					c.color('colorTo', 'Gradient Color'),
					c.slider('gradient', 'Gradient Strength', 0, 10, 0.01),
					c.slider('gradientDirection', 'Gradient Direction', 0, Math.PI * 2, 0.01),
					c.select('mode', 'Mode', [
						{ value: 'outline', label: 'Outline' },
						{ value: 'dropShadow', label: 'Drop Shadow' }
					]),
					...c.vec(
						'shadowOffset',
						'Shadow Offset',
						-20,
						20,
						1,
						{ showIf: (e) => e.gradientOutline.mode === 'dropShadow' },
						['X', 'Y']
					),
					c.slider('growthDirection', 'Growth Direction', 0, 360, 1, {
						showIf: (e) => e.gradientOutline.mode === 'outline'
					}),
					c.slider('growthFactor', 'Growth Factor', 0, 1, 0.01, {
						showIf: (e) => e.gradientOutline.mode === 'outline',
						info: '0 grows the outline evenly in all directions, 1 only toward the growth direction.'
					})
				]
			}),
			effect('proceduralBackground', {
				title: 'Procedural Background',
				info: 'Fills the background with an animated procedural pattern. It runs before most other effects, so fog, outlines and color effects apply over the pattern. Camera parallax rotates the pattern with the camera, turning it into a skybox.',
				controls: (c) => [
					c.select('pattern', 'Pattern', PATTERN_OPTIONS),
					c.color('colorA', 'Color A'),
					c.color('colorB', 'Color B'),
					c.slider('scale', 'Scale', 1, 50, 1),
					c.slider('speed', 'Speed', 0, 10, 0.1),
					c.slider('seed', 'Seed', 0, 100, 1),
					c.slider('cameraParallax', 'Camera Parallax', 0, 1, 0.01),
					c.toggle('randomHue', 'Random Hue', { info: RANDOM_HUE_INFO }),
					c.slider('hueRange', 'Hue Range', 0, 1, 0.01, {
						showIf: (e) => e.proceduralBackground.randomHue === true
					}),
					c.style()
				]
			}),
			effect('ssao', {
				title: 'Ambient Occlusion',
				info: "Darkens crevices and contact areas based on the surrounding geometry, sampled from the depth buffer. Palette style darkens by stepping colors down the palette's shade rows, so the occlusion stays within the model's colors.",
				controls: (c) => [
					c.mask(),
					c.slider('radius', 'Radius', 0, 5, 0.01),
					c.slider('intensity', 'Intensity', 0, 3, 0.01),
					c.slider('power', 'Power', 0.1, 5, 0.01),
					c.select('samples', 'Samples', [
						{ value: 8, label: '8' },
						{ value: 16, label: '16' },
						{ value: 32, label: '32' }
					]),
					c.style()
				]
			}),
			effect('depthFog', {
				title: 'Depth Fog',
				info: 'Fades the scene toward the fog color with world-space distance from the camera.',
				controls: (c) => [
					c.mask(),
					c.color('color', 'Color'),
					c.select('mode', 'Mode', [
						{ value: 'linear', label: 'Linear' },
						{ value: 'exponential', label: 'Exponential' },
						{ value: 'exponentialSquared', label: 'Exponential Squared' }
					]),
					c.slider('near', 'Near', 0, 100, 0.1, {
						showIf: (e) => e.depthFog.mode === 'linear'
					}),
					c.slider('far', 'Far', 0, 100, 0.1, {
						showIf: (e) => e.depthFog.mode === 'linear'
					}),
					c.slider('density', 'Density', 0, 5, 0.01, {
						showIf: (e) => e.depthFog.mode !== 'linear'
					}),
					c.modelOnly()
				]
			}),
			effect('edgeDetection', {
				title: 'Edge Detection',
				info: 'Traces color edges with Sobel edge detection for a sketch or technical drawing look, drawing the line color on the background color.',
				controls: (c) => [
					c.mask(),
					c.slider('threshold', 'Threshold', 0, 2, 0.01),
					c.color('lineColor', 'Line Color'),
					c.color('backgroundColor', 'Background Color'),
					c.slider('blend', 'Blend', 0, 1, 0.01),
					c.modelOnly()
				]
			}),
			effect('colorGrading', {
				title: 'Color Grading',
				info: 'Adjusts the brightness, contrast, saturation and hue of the image.',
				controls: (c) => [
					c.mask(),
					c.slider('brightness', 'Brightness', 0, 3, 0.01),
					c.slider('contrast', 'Contrast', 0, 3, 0.01),
					c.slider('saturation', 'Saturation', 0, 3, 0.01),
					c.slider('hue', 'Hue', -180, 180, 1),
					c.modelOnly()
				]
			}),
			effect('colorTint', {
				title: 'Color Tint',
				info: "Tint multiplies a color over the image. Duotone remaps the image's brightness to a two-color ramp.",
				controls: (c) => [
					c.mask(),
					c.select('mode', 'Mode', [
						{ value: 'tint', label: 'Tint' },
						{ value: 'duotone', label: 'Duotone' }
					]),
					c.color('color', 'Color', { showIf: (e) => e.colorTint.mode === 'tint' }),
					c.slider('intensity', 'Intensity', 0, 1, 0.01, {
						showIf: (e) => e.colorTint.mode === 'tint'
					}),
					c.color('shadowColor', 'Shadow Color', {
						showIf: (e) => e.colorTint.mode === 'duotone'
					}),
					c.color('highlightColor', 'Highlight Color', {
						showIf: (e) => e.colorTint.mode === 'duotone'
					}),
					c.slider('blend', 'Blend', 0, 1, 0.01),
					c.modelOnly()
				]
			}),
			effect('posterization', {
				title: 'Posterize',
				info: 'Reduces the image to a limited number of color levels per channel.',
				controls: (c) => [
					c.mask(),
					c.slider('levels', 'Levels', 2, 10, 1),
					...c.rgb(
						'channelLevels',
						'Levels',
						0,
						5,
						0.1,
						'Multiplies the level count per color channel.'
					),
					c.slider('gamma', 'Gamma', 0.1, 5, 0.01),
					c.toggle('colorBanding', 'Color Banding', {
						info: 'Rounds each color channel at a slightly different point, fringing band edges with color.'
					}),
					c.modelOnly()
				]
			}),
			effect('sharpen', {
				title: 'Sharpen',
				info: 'Sharpens the image with a convolution kernel. The threshold limits sharpening to strong edges.',
				controls: (c) => [
					c.mask(),
					c.slider('strength', 'Strength', 0, 5, 0.01),
					c.slider('threshold', 'Threshold', 0, 1, 0.01),
					c.modelOnly()
				]
			}),
			effect('bloom', {
				title: 'Bloom',
				info: 'Blurs bright areas outward to make them glow.',
				controls: (c) => [
					c.mask({
						info: 'With colors selected, only those colors bloom, creating an emission mask for the selected colors.'
					}),
					c.slider('threshold', 'Threshold', 0, 1, 0.01),
					c.slider('intensity', 'Intensity', 0, 5, 0.01),
					c.slider('blur', 'Blur', 0, 5, 0.01),
					c.modelOnly()
				]
			}),
			effect('dithering', {
				title: 'Dithering',
				info: 'Quantizes colors and dithers the rounding with an ordered pattern, like low-color hardware.',
				controls: (c) => [
					c.mask(),
					c.slider('amount', 'Amount', 0, 2, 0.01, {
						info: 'Fades the dither pattern in and out around the rounding midpoint.'
					}),
					c.slider('blend', 'Blend', 0, 1, 0.01),
					...c.rgb('channelAmount', 'Channel', 0, 2, 0.01),
					c.modelOnly()
				]
			}),
			effect('halftone', {
				title: 'Halftone',
				info: 'Prints the image as a halftone pattern of dots, lines or crosshatch strokes sized by tone.',
				controls: (c) => [
					c.mask(),
					c.slider('dotSize', 'Dot Size', 0, 20, 0.1),
					c.slider('angle', 'Angle', 0, Math.PI, 0.01),
					c.slider('blend', 'Blend', 0, 1, 0.01),
					c.select('mode', 'Mode', [
						{ value: 'dots', label: 'Dots' },
						{ value: 'lines', label: 'Lines' },
						{ value: 'crosshatch', label: 'Crosshatch' }
					]),
					c.modelOnly()
				]
			}),
			effect('videoEffects', {
				title: 'Video Effects',
				info: 'Simulates a whole display showing the render with a virtual pixel grid, tone controls, and per-screen-type artifacts. CRT curvature and scanlines, Gameboy shades and smear, TN angle shift, OLED black crush and pentile subpixels, projector keystone and halo.',
				controls: (c) => [
					c.select('screenType', 'Screen Type', [
						{ value: 'crt', label: 'CRT' },
						{ value: 'lcd', label: 'LCD' },
						{ value: 'tn', label: 'TN' },
						{ value: 'oled', label: 'OLED' },
						{ value: 'gameboy', label: 'Gameboy' },
						{ value: 'projector', label: 'Projector' }
					]),
					c.slider('resolution', 'Resolution', 0, 256, 1, {
						info: 'Virtual pixels across the screen height. Color is quantized per virtual pixel. 0 keeps the output resolution.'
					}),
					c.slider('brightness', 'Brightness', 0, 2, 0.01),
					c.slider('saturation', 'Saturation', 0, 2, 0.01),
					c.slider('contrastBoost', 'Contrast Boost', 0, 1, 0.01),
					c.slider('gridStrength', 'Grid Strength', 0, 1, 0.01),
					c.slider('crt.curvature', 'Curvature', 0, 1, 0.01, {
						showIf: (e) => e.videoEffects.screenType === 'crt'
					}),
					c.slider('crt.scanlineIntensity', 'Scanline Intensity', 0, 1, 0.01, {
						showIf: (e) => e.videoEffects.screenType === 'crt'
					}),
					c.slider('crt.refreshRate', 'Refresh Rate', 0, 10, 0.1, {
						showIf: (e) => e.videoEffects.screenType === 'crt',
						info: 'Rolling refresh flickers per second. 0 disables the flicker.'
					}),
					c.slider('crt.pixelFadeTime', 'Pixel Fade Time', 0, 2, 0.01, {
						showIf: (e) => e.videoEffects.screenType === 'crt',
						info: 'Phosphor ghosting, determining how many seconds a pixel takes to fade out.'
					}),
					c.select(
						'gameboy.palette',
						'Palette',
						[
							{ value: 'dmg', label: 'DMG' },
							{ value: 'pocket', label: 'Pocket' },
							{ value: 'custom', label: 'Custom' }
						],
						{ showIf: (e) => e.videoEffects.screenType === 'gameboy' }
					),
					c.colorList('gameboy.customColors', 'Shade', {
						showIf: (e) =>
							e.videoEffects.screenType === 'gameboy' &&
							e.videoEffects.gameboy?.palette === 'custom'
					}),
					c.slider('gameboy.ghosting', 'Ghosting', 0, 1, 0.01, {
						showIf: (e) => e.videoEffects.screenType === 'gameboy'
					}),
					c.slider('tn.angleShift', 'Angle Shift', 0, 1, 0.01, {
						showIf: (e) => e.videoEffects.screenType === 'tn'
					}),
					c.slider('oled.blackCrush', 'Black Crush', 0, 1, 0.01, {
						showIf: (e) => e.videoEffects.screenType === 'oled'
					}),
					c.toggle('oled.pentile', 'Pentile', {
						showIf: (e) => e.videoEffects.screenType === 'oled'
					}),
					c.slider('projector.keystone', 'Keystone', 0, 1, 0.01, {
						showIf: (e) => e.videoEffects.screenType === 'projector'
					}),
					c.slider('projector.hotspot', 'Hotspot', 0, 1, 0.01, {
						showIf: (e) => e.videoEffects.screenType === 'projector'
					}),
					c.slider('projector.halo', 'Halo', 0, 1, 0.01, {
						showIf: (e) => e.videoEffects.screenType === 'projector'
					}),
					c.modelOnly()
				]
			}),
			effect('pixelation', {
				title: 'Pixelation',
				info: 'Redraws the image with larger pixels in the selected shape.',
				controls: (c) => [
					c.mask(),
					c.slider('pixelSize', 'Pixel Size', 1, 10, 0.01),
					c.select('shape', 'Shape', [
						{ value: 'square', label: 'Square' },
						{ value: 'hex', label: 'Hex' },
						{ value: 'diamond', label: 'Diamond' },
						{ value: 'circle', label: 'Circle' },
						{ value: 'triangle', label: 'Triangle' },
						{ value: 'cross', label: 'Cross' },
						{ value: 'star', label: 'Star' }
					]),
					c.slider('blend', 'Blend', 0, 1, 0.01),
					c.modelOnly()
				]
			}),
			effect('lensDistortion', {
				title: 'Lens Distortion',
				info: 'Warps the image like a camera lens. Positive strength bulges outward, negative pinches inward, and zoom compensates the scale.',
				controls: (c) => [
					c.slider('strength', 'Strength', -2, 2, 0.01),
					c.slider('zoom', 'Zoom', 0.1, 5, 0.01),
					c.modelOnly()
				]
			}),
			effect('chromaticAberration', {
				title: 'Chromatic Aberration',
				info: 'Separates the RGB channels like a misaligned lens, with fringing that grows toward the screen edges.',
				controls: (c) => [
					c.mask(),
					c.slider('strength', 'Strength', 0, 5, 0.01),
					c.slider('redOffset', 'Red Offset', -1, 1, 0.01),
					c.slider('greenOffset', 'Green Offset', -1, 1, 0.01),
					c.slider('blueOffset', 'Blue Offset', -1, 1, 0.01),
					c.slider('radialFalloff', 'Radial Falloff', 0, 2, 0.01),
					c.slider('centerX', 'Center X', 0, 1, 0.01),
					c.slider('centerY', 'Center Y', 0, 1, 0.01),
					c.modelOnly()
				]
			}),
			effect('noise', {
				title: 'Noise',
				info: 'Overlays animated film grain.',
				controls: (c) => [c.mask(), c.slider('amount', 'Amount', 0, 1, 0.01), c.modelOnly()]
			}),
			effect('glitch', {
				title: 'Glitch',
				info: 'Animated digital corruption. Displaced blocks, shifted lines and RGB channel splitting.',
				controls: (c) => [
					c.mask(),
					c.slider('intensity', 'Intensity', 0, 1, 0.01),
					c.slider('speed', 'Speed', 0, 10, 0.1),
					c.slider('blockSize', 'Block Size', 0, 100, 1),
					c.toggle('rgbSplit', 'RGB Split'),
					c.toggle('lineShift', 'Line Shift'),
					c.modelOnly()
				]
			}),
			effect('vignette', {
				title: 'Vignette',
				info: 'Darkens the edges of the viewport.',
				controls: (c) => [
					c.slider('intensity', 'Intensity', 0, 2, 0.01),
					c.slider('smoothness', 'Smoothness', 0, 2, 0.01),
					c.slider('roundness', 'Roundness', 0, 1, 0.01, {
						info: '1 is a circular vignette, 0 follows the viewport shape.'
					}),
					c.color('color', 'Color'),
					c.modelOnly()
				]
			})
		]
	}
] satisfies readonly EffectSection[];

type DeclaredEffectKey = (typeof EFFECT_SECTIONS)[number]['effects'][number]['key'];

/**
 * Compile-time completeness check. This assignment errors (naming the missing
 * keys in the expected type) when ExtrasState gains an effect the schema does
 * not declare.
 */
export const SCHEMA_DECLARES_EVERY_EFFECT: Exclude<EffectKey, DeclaredEffectKey> extends never
	? true
	: Exclude<EffectKey, DeclaredEffectKey> = true;
