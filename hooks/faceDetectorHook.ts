"use client";

import {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ChangeEvent,
} from "react";
import { detectFace } from "../lib/faceDetector";
import { calculateFrameTransform } from "../lib/frameGeometry";
import {
	extractLandmarks,
	getFaceAnchorPoints,
	handleNoFaceScenario,
	projectLandmarksToPixels,
	validateFaceDetection,
} from "../lib/faceLandmarks";
import {
	createCanvasRenderer,
	drawImageLayer,
	drawFrameLayer,
	exportCanvas,
} from "../lib/canvasRenderer";
import {
	clearImageCache,
	loadImageFromFile,
	loadImageFromSource,
} from "../lib/imageLoader";
import type { FaceLandmarks, FrameOption, UploadResponse } from "../types/face";

export const frameOptions: FrameOption[] = [
	{
		id: "aviator",
		label: "Aviator",
		src: "/frames/aviator.svg",
		description: "Balanced pilot-inspired frame with a wide silhouette.",
	},
	{
		id: "round",
		label: "Round",
		src: "/frames/round.svg",
		description: "Soft circular lenses for a classic expressive fit.",
	},
	{
		id: "rectangle",
		label: "Rectangle",
		src: "/frames/rectangle.svg",
		description: "Angular frame for a sharper, more architectural profile.",
	},
	{
		id: "wayfarer",
		label: "Wayfarer",
		src: "/frames/wayfarer.svg",
		description: "Modern everyday frame with a strong outer edge.",
	},
];

const DEFAULT_MESSAGE = "Camera warming up. Hold your face in view for live fitting.";

type TryOnMode = "camera" | "upload";
type CameraState = "idle" | "loading" | "ready" | "error";

export function useFaceDetector() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const videoRef = useRef<HTMLVideoElement | null>(null);
	const exportUrlRef = useRef<string | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const modeRef = useRef<TryOnMode>("camera");
	const lastUploadStateRef = useRef<UploadResponse>({ ok: true, message: DEFAULT_MESSAGE });
	const [selectedFrameId, setSelectedFrameId] = useState(frameOptions[0].id);
	const [mode, setMode] = useState<TryOnMode>("camera");
	const [cameraState, setCameraState] = useState<CameraState>("idle");
	const [uploadState, setUploadState] = useState<UploadResponse>({
		ok: true,
		message: DEFAULT_MESSAGE,
	});
	const [isLoading, setIsLoading] = useState(false);
	const [resultUrl, setResultUrl] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [previewAspectRatio, setPreviewAspectRatio] = useState<number>(4 / 3);

	const selectedFrame = useMemo(
		() => frameOptions.find((frame) => frame.id === selectedFrameId) ?? frameOptions[0],
		[selectedFrameId]
	);

	const syncUploadState = useCallback((nextState: UploadResponse) => {
		const currentState = lastUploadStateRef.current;

		if (
			currentState.ok === nextState.ok &&
			currentState.message === nextState.message &&
			currentState.fileName === nextState.fileName &&
			currentState.previewUrl === nextState.previewUrl
		) {
			return;
		}

		lastUploadStateRef.current = nextState;
		setUploadState(nextState);
	}, []);

	const clearResultUrl = useCallback(() => {
		if (exportUrlRef.current) {
			URL.revokeObjectURL(exportUrlRef.current);
			exportUrlRef.current = null;
		}
	}, []);

	const setAspectRatioFromDimensions = useCallback((width: number, height: number) => {
		if (width > 0 && height > 0) {
			setPreviewAspectRatio(width / height);
		}
	}, []);

	const createImageDataFromSource = useCallback(
		(source: HTMLVideoElement | HTMLImageElement) => {
			const width = "videoWidth" in source ? source.videoWidth : source.naturalWidth;
			const height = "videoHeight" in source ? source.videoHeight : source.naturalHeight;

			const offscreen = document.createElement("canvas");
			offscreen.width = width;
			offscreen.height = height;

			const context = offscreen.getContext("2d");

			if (!context) {
				throw new Error("Failed to get canvas context.");
			}

			context.drawImage(source, 0, 0, width, height);
			return context.getImageData(0, 0, width, height);
		},
		[]
	);

	const drawCurrentFrame = useCallback(
		async (source: HTMLVideoElement | HTMLImageElement, landmarks?: FaceLandmarks) => {
			if (!canvasRef.current) {
				throw new Error("The preview canvas is not ready yet.");
			}

			const canvas = canvasRef.current;
			const sourceWidth = "videoWidth" in source ? source.videoWidth : source.naturalWidth;
			const sourceHeight = "videoHeight" in source ? source.videoHeight : source.naturalHeight;

			canvas.width = sourceWidth;
			canvas.height = sourceHeight;

			const renderer = createCanvasRenderer(canvas);
			const frameImage = await loadImageFromSource(selectedFrame.src);
			const projectedLandmarks = landmarks
				? projectLandmarksToPixels(landmarks, sourceWidth, sourceHeight)
				: undefined;

			if (modeRef.current === "camera") {
				renderer.context.clearRect(0, 0, canvas.width, canvas.height);

				if (!projectedLandmarks) {
					return;
				}

				const anchors = getFaceAnchorPoints(projectedLandmarks);
				const transform = calculateFrameTransform(anchors, sourceWidth, sourceHeight);
				await drawFrameLayer(renderer, frameImage, transform);
				return;
			}

			if (!projectedLandmarks) {
				drawImageLayer(renderer, source);
				return;
			}

			const anchors = getFaceAnchorPoints(projectedLandmarks);
			const transform = calculateFrameTransform(anchors, sourceWidth, sourceHeight);
			drawImageLayer(renderer, source);
			await drawFrameLayer(renderer, frameImage, transform);
		},
		[selectedFrame.src]
	);

	const stopCamera = useCallback(() => {
		if (animationFrameRef.current !== null) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}

		const video = videoRef.current;
		const stream = streamRef.current ?? (video?.srcObject instanceof MediaStream ? video.srcObject : null);

		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
		}

		if (video) {
			video.srcObject = null;
		}

		streamRef.current = null;
		setCameraState("idle");
	}, []);

	

	const startCamera = useCallback(async () => {
		if (!navigator.mediaDevices?.getUserMedia) {
			throw new Error("Camera access is not supported in this browser.");
		}

		setIsLoading(true);
		syncUploadState({ ok: true, message: "Requesting camera access..." });
		setCameraState("loading");
		modeRef.current = "camera";
		setMode("camera");
		clearResultUrl();
		setResultUrl(null);
		stopCamera();

		const stream = await navigator.mediaDevices.getUserMedia({
			video: {
				facingMode: "user",
			},
			audio: false,
		});

		const video = videoRef.current;

		if (!video) {
			stream.getTracks().forEach((track) => track.stop());
			throw new Error("The camera preview is not ready yet.");
		}

		streamRef.current = stream;
		video.srcObject = stream;
		await video.play();
		setAspectRatioFromDimensions(video.videoWidth, video.videoHeight);
		setCameraState("ready");
		syncUploadState({ ok: true, message: "Camera live. Landmark detection updates in real time." });
		setIsLoading(false);
	}, [clearResultUrl, setAspectRatioFromDimensions, stopCamera, syncUploadState]);

	useEffect(() => {
		const startupHandle = window.setTimeout(() => {
			void startCamera().catch((error) => {
				const message = error instanceof Error ? error.message : "Unable to start the camera.";
				console.error("Error starting camera:", error);
				setCameraState("error");
				setIsLoading(false);
				syncUploadState({ ok: false, message });
			});
		}, 0);

		return () => {
			window.clearTimeout(startupHandle);
			stopCamera();
			clearResultUrl();
			clearImageCache();
		};
	}, [clearResultUrl, startCamera, stopCamera, syncUploadState]);

	useEffect(() => {
		if (mode !== "camera" || cameraState !== "ready") {
			return;
		}

		let cancelled = false;

		const tick = async (timestamp: number) => {
			if (cancelled) {
				return;
			}

			const video = videoRef.current;

			if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
				animationFrameRef.current = requestAnimationFrame(tick);
				return;
			}

			try {
				const imageData = createImageDataFromSource(video);
				const detection = await detectFace(imageData, timestamp);
				const validation = validateFaceDetection(detection);

				if (!validation.valid) {
					syncUploadState({ ok: false, message: validation.reason ?? handleNoFaceScenario() });
					return;
				}

				const landmarks = extractLandmarks(detection)[0];

				if (!landmarks) {
					syncUploadState({ ok: false, message: handleNoFaceScenario() });
					return;
				}

				await drawCurrentFrame(video, landmarks);
				syncUploadState({ ok: true, message: "Camera live. Landmark detection updates in real time." });
			} catch (error) {
				const message = error instanceof Error ? error.message : DEFAULT_MESSAGE;
				console.error("Error during live camera rendering:", error);
				syncUploadState({ ok: false, message });
			}

			if (!cancelled) {
				animationFrameRef.current = requestAnimationFrame(tick);
			}
		};

		animationFrameRef.current = requestAnimationFrame(tick);

		return () => {
			cancelled = true;

			if (animationFrameRef.current !== null) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, [cameraState, createImageDataFromSource, drawCurrentFrame, mode, syncUploadState]);

	const renderPhoto = useCallback(
		async (file: File) => {
			if (!canvasRef.current) {
				throw new Error("The preview canvas is not ready yet.");
			}

			modeRef.current = "upload";
			setMode("upload");
			stopCamera();
			setIsLoading(true);
			syncUploadState({ ok: true, message: "Processing image and fitting glasses..." });
			setFileName(file.name);
			clearResultUrl();

			try {
				if (!file.type || !["image/jpeg", "image/png"].includes(file.type)) {
					throw new Error("Unsupported format. Please upload a JPG or PNG image.");
				}

				if (file.size > 10 * 1024 * 1024) {
					throw new Error("The image is too large. Please use a file smaller than 10 MB.");
				}

				const image = await loadImageFromFile(file);
				setAspectRatioFromDimensions(image.naturalWidth || image.width, image.naturalHeight || image.height);
				const imageData = createImageDataFromSource(image);
				const detection = await detectFace(imageData, performance.now());
				const validation = validateFaceDetection(detection);

				if (!validation.valid) {
					throw new Error(validation.reason ?? handleNoFaceScenario());
				}

				const landmarks = extractLandmarks(detection)[0];
				if (!landmarks) {
					throw new Error(handleNoFaceScenario());
				}

				await drawCurrentFrame(image, landmarks);

				const blob = await exportCanvas(canvasRef.current);
				const url = URL.createObjectURL(blob);
				exportUrlRef.current = url;
				setResultUrl(url);
				syncUploadState({
					ok: true,
					message: "Glasses positioned successfully. Download the PNG result.",
					fileName: file.name,
					previewUrl: url,
				});
			} catch (error) {
				const message = error instanceof Error ? error.message : DEFAULT_MESSAGE;
				console.error("Error during photo rendering:", error);

				syncUploadState({ ok: false, message });
				setResultUrl(null);
				setCameraState("idle");
			} finally {
				setIsLoading(false);
			}
		},
			[clearResultUrl, createImageDataFromSource, drawCurrentFrame, setAspectRatioFromDimensions, stopCamera, syncUploadState]
	);

	const handleUpload = useCallback(
		async (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0] ?? null;

			if (!file) {
				syncUploadState({ ok: false, message: "Choose an image to begin." });
				return;
			}

			await renderPhoto(file);
		},
		[renderPhoto, syncUploadState]
	);

	const resumeCamera = useCallback(() => {
		void startCamera().catch((error) => {
			const message = error instanceof Error ? error.message : "Unable to restart the camera.";
			console.error("Error restarting camera:", error);
			setCameraState("error");
			syncUploadState({ ok: false, message });
		});
	}, [startCamera, syncUploadState]);

	const downloadResult = useCallback(async () => {
		const video = videoRef.current;
		const canvas = canvasRef.current;

		if (!canvas) {
			return;
		}

		if (modeRef.current === "camera" && video && video.videoWidth > 0 && video.videoHeight > 0) {
			const exportCanvasElement = document.createElement("canvas");
			exportCanvasElement.width = video.videoWidth;
			exportCanvasElement.height = video.videoHeight;

			const renderer = createCanvasRenderer(exportCanvasElement);
			renderer.context.drawImage(video, 0, 0, exportCanvasElement.width, exportCanvasElement.height);

			const frameImage = await loadImageFromSource(selectedFrame.src);
			const anchorsImageData = renderer.context.getImageData(0, 0, exportCanvasElement.width, exportCanvasElement.height);
			const anchorsDetection = await detectFace(anchorsImageData, performance.now());
			const anchorsValidation = validateFaceDetection(anchorsDetection);

			if (anchorsValidation.valid) {
				const landmarks = extractLandmarks(anchorsDetection)[0];
				if (landmarks) {
					const anchors = getFaceAnchorPoints(landmarks);
					const transform = calculateFrameTransform(anchors, exportCanvasElement.width, exportCanvasElement.height);
					await drawFrameLayer(renderer, frameImage, transform);
				}
			}

			const blob = await exportCanvas(exportCanvasElement);
			clearResultUrl();
			const url = URL.createObjectURL(blob);
			exportUrlRef.current = url;
			setResultUrl(url);

			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `glasses-tryon-${fileName ?? "result"}.png`;
			anchor.click();
			return;
		}

		const blob = await exportCanvas(canvas);
		clearResultUrl();
		const url = URL.createObjectURL(blob);
		exportUrlRef.current = url;
		setResultUrl(url);

		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = `glasses-tryon-${fileName ?? "result"}.png`;
		anchor.click();
	}, [clearResultUrl, fileName, selectedFrame.src]);

	return {
		cameraState,
		isCameraReady: cameraState === "ready",
		canvasRef,
		downloadResult,
		frameOptions,
		handleUpload,
		isLoading,
		mode,
		previewAspectRatio,
		resultUrl,
		resumeCamera,
		selectedFrame,
		selectedFrameId,
		setSelectedFrameId,
		videoRef,
		uploadState,
	};
}

