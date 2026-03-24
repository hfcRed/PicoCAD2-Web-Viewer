import type { ViewerSettings, ExtrasOptions } from 'picocad2-web';

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
		loop: false
	},
	camera: {
		omega: 0,
		theta: 0,
		distanceToTarget: 0,
		target: [0, 0, 0],
		zoom: 0
	}
} as const satisfies ViewerSettings;

export const DEFAULT_EXTRAS = {
	wireframe: {
		enabled: false,
		color: [0, 0, 0]
	},
	gradientOutline: {
		enabled: false,
		size: 0,
		colorFrom: [0, 0, 0],
		colorTo: [0, 0, 0],
		gradient: 0,
		gradientDirection: 0
	},
	colorGrading: {
		enabled: false,
		brightness: 0,
		contrast: 0,
		saturation: 0,
		hue: 0
	},
	posterization: {
		enabled: false,
		levels: 0,
		channelLevels: [0, 0, 0],
		gamma: 0,
		colorBanding: false
	},
	bloom: {
		enabled: false,
		threshold: 0,
		intensity: 0,
		blur: 0
	},
	dithering: {
		enabled: false,
		amount: 0,
		blend: 0,
		channelAmount: [0, 0, 0]
	},
	crt: {
		enabled: false,
		curvature: 0,
		scanlineIntensity: 0
	},
	pixelation: {
		enabled: false,
		pixelSize: 0,
		shape: 'square',
		blend: 0
	},
	lensDistortion: {
		enabled: false,
		strength: 0,
		zoom: 0
	},
	noise: {
		enabled: false,
		amount: 0
	},
	chromaticAberration: {
		enabled: false,
		strength: 0
	}
} as const satisfies Required<ExtrasOptions>;
