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
	wireframe: {
		enabled: false,
		modelOnly: true,
		color: [0, 0, 0]
	},
	colorCutout: {
		enabled: false,
		maskedColors: []
	},
	gradientOutline: {
		enabled: false,
		modelOnly: true,
		size: 0,
		colorFrom: [0, 0, 0],
		colorTo: [0, 0, 0],
		gradient: 0,
		gradientDirection: 0
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
} as const satisfies Required<ExtrasOptions>;
