export const CAMERA_LIMITS = {
	distance: { min: 1, max: 100 },
	// limiting tilt because -Math.PI / 2 will break rendering
	tilt: { min: -Math.PI / 2 + 0.01, max: Math.PI / 2 - 0.01 },
	rotation: { min: 0, max: Math.PI * 2 }
} as const;

export const CAPTURE_FPS_LIMITS = {
	gif: { min: 1, max: 50 },
	video: { min: 1, max: 60 }
} as const;
