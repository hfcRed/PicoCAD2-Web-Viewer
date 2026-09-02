import type { ViewerSettings } from 'picocad2-web';

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
	clampCameraDistance: { enabled: true, minimumDistance: 2 }
} as const satisfies ViewerSettings;
