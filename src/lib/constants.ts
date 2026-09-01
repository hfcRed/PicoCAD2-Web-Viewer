import type { ViewerSettings, ExtrasState } from 'picocad2-web';

export const CAMERA_LIMITS = {
	distance: { min: 1, max: 100 },
	// limiting tilt because -Math.PI / 2 will break rendering
	tilt: { min: -Math.PI / 2 + 0.01, max: Math.PI / 2 - 0.01 },
	rotation: { min: 0, max: Math.PI * 2 }
} as const;

export const DEFAULT_SETTINGS = {
	shading: true,
	renderMode: 'texture',
	projectionMode: 'perspective',
	backgroundColor: null,
	outlineSize: 0,
	outlineColor: [0, 0, 0],
	scanlines: false,
	scanlineColor: [0, 0, 0],
	cameraMode: 'fixed',
	cameraModeSpeed: 1,
	cameraModeDirection: 'right',
	leftTag: null,
	rightTag: null,
	animation: {
		speed: 0,
		time: 0,
		playing: false,
		loop: false,
		loops: 1
	},
	camera: {
		omega: 0,
		theta: 0,
		distanceToTarget: 0,
		target: [0, 0, 0],
		zoom: 0
	},
	bookmark: {
		omega: 0,
		theta: 0,
		distanceToTarget: 0,
		target: [0, 0, 0]
	},
	resolution: {
		width: 128,
		height: 128,
		scale: 4
	},
	maxFps: 0,
	clampCameraDistance: true
} as const satisfies ViewerSettings;

export const DEFAULT_EXTRAS = {
	paletteSwap: {
		enabled: false,
		map: [],
		cycleIndices: [],
		cycleSpeed: 0,
		cycleStyle: 'dithered',
		cycleBlendTime: 0.2
	},
	colorCutout: {
		enabled: false,
		maskedColors: []
	},
	dissolve: {
		enabled: false,
		mode: 'noise',
		progress: 0,
		scale: 0,
		softness: 0,
		edgeWidth: 0,
		edgeColor: [0, 0, 0],
		invert: false,
		direction: [0, 0, 0],
		point: [0, 0, 0],
		style: 'palette',
		maskedColors: []
	},
	emission: {
		enabled: false,
		strength: 0,
		blinkMode: 'smooth',
		blinkRate: 0,
		blinkMin: 0,
		scrollDirection: [0, 0, 0],
		scrollWidth: 0,
		scrollGap: 0,
		scrollSpeed: 0,
		style: 'palette',
		maskedColors: []
	},
	interior: {
		enabled: false,
		pattern: 'stars',
		depth: 0,
		layers: 0,
		scale: 0,
		speed: 0,
		color: [0, 0, 0],
		backgroundColor: [0, 0, 0],
		randomHue: false,
		hueRange: 0,
		style: 'palette',
		maskedColors: []
	},
	gradientLight: {
		enabled: false,
		litColor: [0, 0, 0],
		shadowColor: [0, 0, 0],
		source: 'light',
		blend: 0,
		style: 'palette',
		maskedColors: []
	},
	specular: {
		enabled: false,
		strength: 0,
		smoothness: 0,
		color: [0, 0, 0],
		anisotropy: 0,
		environment: {
			strength: 0,
			skyColor: [0, 0, 0],
			groundColor: [0, 0, 0],
			horizon: 0,
			fresnel: 0
		},
		style: 'palette',
		maskedColors: []
	},
	rimLight: {
		enabled: false,
		color: [0, 0, 0],
		width: 0,
		sharpness: 0,
		lightAlign: 0,
		blend: 0,
		invert: false,
		style: 'palette',
		maskedColors: []
	},
	glitter: {
		enabled: false,
		space: 'uv',
		density: 0,
		size: 0,
		color: [0, 0, 0],
		randomHue: false,
		hueRange: 0,
		brightness: 0,
		angleRange: 0,
		speed: 0,
		shape: 'square',
		style: 'palette',
		maskedColors: []
	},
	meshDeform: {
		enabled: false,
		voxel: { enabled: false, gridSize: 0.25 },
		barrel: { amount: 0, axis: 'y' },
		spherify: { amount: 0 },
		twist: { amount: 0, axis: 'y', speed: 0 }
	},
	triangleFlash: {
		enabled: false,
		color: [0, 0, 0],
		rate: 0,
		density: 0,
		duration: 0,
		softness: 0,
		mode: 'replace',
		style: 'palette',
		maskedColors: []
	},
	triangleShatter: {
		enabled: false,
		progress: 0,
		mode: 'normal',
		direction: [0, 0, 0],
		distance: 0,
		spread: 0,
		rotation: 0,
		gravity: 0,
		shrink: 0,
		maskedColors: []
	},
	fur: {
		enabled: false,
		length: 0,
		layers: 0,
		density: 0,
		gravity: [0, 0, 0],
		rootShade: 0,
		maskedColors: []
	},
	billboard: {
		enabled: false,
		nodes: [],
		mode: 'full'
	},
	wireframe: {
		enabled: false,
		modelOnly: true,
		color: [0, 0, 0]
	},
	particles: {
		enabled: false,
		count: 0,
		shape: 'pixel',
		paletteIndices: [],
		size: 0,
		sizeJitter: 0,
		motion: 'drift',
		speed: 0,
		velocity: [0, 0, 0],
		areaScale: 0,
		twinkle: 0,
		randomHue: false,
		hueRange: 0
	},
	gradientOutline: {
		enabled: false,
		modelOnly: true,
		size: 0,
		colorFrom: [0, 0, 0],
		colorTo: [0, 0, 0],
		gradient: 0,
		gradientDirection: 0,
		growthDirection: 0,
		growthFactor: 0,
		mode: 'outline',
		shadowOffset: [0, 0]
	},
	proceduralBackground: {
		enabled: false,
		pattern: 'stars',
		colorA: [0, 0, 0],
		colorB: [0, 0, 0],
		scale: 0,
		speed: 0,
		seed: 0,
		cameraParallax: 0,
		randomHue: false,
		hueRange: 0,
		style: 'smooth'
	},
	ssao: {
		enabled: false,
		radius: 0,
		intensity: 0,
		power: 0,
		samples: 16,
		style: 'palette',
		maskedColors: []
	},
	depthFog: {
		enabled: false,
		modelOnly: true,
		color: [0, 0, 0],
		near: 0,
		far: 0,
		density: 0,
		mode: 'linear',
		maskedColors: []
	},
	edgeDetection: {
		enabled: false,
		modelOnly: true,
		threshold: 0,
		lineColor: [0, 0, 0],
		backgroundColor: [0, 0, 0],
		blend: 0,
		maskedColors: []
	},
	colorGrading: {
		enabled: false,
		modelOnly: true,
		brightness: 0,
		contrast: 0,
		saturation: 0,
		hue: 0,
		maskedColors: []
	},
	colorTint: {
		enabled: false,
		modelOnly: true,
		mode: 'tint',
		color: [0, 0, 0],
		intensity: 0,
		shadowColor: [0, 0, 0],
		highlightColor: [0, 0, 0],
		blend: 0,
		maskedColors: []
	},
	posterization: {
		enabled: false,
		modelOnly: true,
		levels: 0,
		channelLevels: [0, 0, 0],
		gamma: 0,
		colorBanding: false,
		maskedColors: []
	},
	sharpen: {
		enabled: false,
		modelOnly: true,
		strength: 0,
		threshold: 0,
		maskedColors: []
	},
	bloom: {
		enabled: false,
		modelOnly: true,
		threshold: 0,
		intensity: 0,
		blur: 0,
		maskedColors: []
	},
	dithering: {
		enabled: false,
		modelOnly: true,
		amount: 0,
		blend: 0,
		channelAmount: [0, 0, 0],
		maskedColors: []
	},
	halftone: {
		enabled: false,
		modelOnly: true,
		dotSize: 0,
		angle: 0,
		blend: 0,
		mode: 'dots',
		maskedColors: []
	},
	videoEffects: {
		enabled: false,
		modelOnly: true,
		screenType: 'crt',
		resolution: 0,
		brightness: 0,
		saturation: 0,
		contrastBoost: 0,
		gridStrength: 0,
		crt: {
			curvature: 0,
			scanlineIntensity: 0,
			refreshRate: 0,
			pixelFadeTime: 0
		},
		gameboy: {
			palette: 'dmg',
			customColors: [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0]
			],
			ghosting: 0
		},
		tn: { angleShift: 0 },
		oled: { blackCrush: 0, pentile: false },
		projector: { keystone: 0, hotspot: 0, halo: 0 }
	},
	pixelation: {
		enabled: false,
		modelOnly: true,
		pixelSize: 0,
		shape: 'square',
		blend: 0,
		maskedColors: []
	},
	lensDistortion: {
		enabled: false,
		modelOnly: true,
		strength: 0,
		zoom: 0
	},
	chromaticAberration: {
		enabled: false,
		modelOnly: true,
		strength: 0,
		redOffset: 0,
		greenOffset: 0,
		blueOffset: 0,
		radialFalloff: 0,
		centerX: 0,
		centerY: 0,
		maskedColors: []
	},
	noise: {
		enabled: false,
		modelOnly: true,
		amount: 0,
		maskedColors: []
	},
	glitch: {
		enabled: false,
		modelOnly: true,
		intensity: 0,
		speed: 0,
		blockSize: 0,
		rgbSplit: false,
		lineShift: false,
		maskedColors: []
	},
	vignette: {
		enabled: false,
		modelOnly: true,
		intensity: 0,
		smoothness: 0,
		roundness: 0,
		color: [0, 0, 0]
	}
} as const satisfies ExtrasState;
