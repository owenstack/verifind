export interface CameraSession {
	stop: () => void;
	stream: MediaStream;
}

export interface EvidenceCaptureOptions {
	maxDimension?: number;
	quality?: number;
}

export async function openEvidenceCamera(): Promise<CameraSession> {
	if (!navigator.mediaDevices?.getUserMedia) {
		throw new Error("Camera capture is not supported in this browser.");
	}
	const stream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			facingMode: { ideal: "environment" },
			width: { ideal: 1920 },
			height: { ideal: 1080 },
		},
	});
	return {
		stream,
		stop: () => {
			for (const track of stream.getTracks()) {
				track.stop();
			}
		},
	};
}

export function compressEvidenceImage(
	image: HTMLVideoElement | HTMLImageElement | ImageBitmap,
	options: EvidenceCaptureOptions = {}
): Promise<Blob> {
	const maxDimension = options.maxDimension ?? 1600;
	const quality = options.quality ?? 0.82;
	let sourceWidth: number;
	let sourceHeight: number;
	if (image instanceof HTMLVideoElement) {
		sourceWidth = image.videoWidth;
		sourceHeight = image.videoHeight;
	} else if (image instanceof HTMLImageElement) {
		sourceWidth = image.naturalWidth;
		sourceHeight = image.naturalHeight;
	} else {
		sourceWidth = image.width;
		sourceHeight = image.height;
	}
	if (sourceWidth <= 0 || sourceHeight <= 0) {
		throw new Error("The evidence image is not ready to capture.");
	}
	const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
	const canvas = document.createElement("canvas");
	canvas.width = Math.round(sourceWidth * scale);
	canvas.height = Math.round(sourceHeight * scale);
	const context = canvas.getContext("2d", { alpha: false });
	if (!context) {
		throw new Error("Image compression is unavailable.");
	}
	context.drawImage(image, 0, 0, canvas.width, canvas.height);
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) {
					resolve(blob);
					return;
				}
				reject(new Error("The evidence image could not be compressed."));
			},
			"image/jpeg",
			quality
		);
	});
}

export function readEvidenceFile(file: File): Promise<Blob> {
	if (!file.type.startsWith("image/")) {
		return Promise.reject(new Error("Choose an image file to continue."));
	}
	return createImageBitmap(file)
		.then(async (bitmap) => {
			try {
				return await compressEvidenceImage(bitmap);
			} finally {
				bitmap.close();
			}
		})
		.catch(() => file);
}
