import {
  FaceLandmarker,
  FilesetResolver
} from "@mediapipe/tasks-vision";

import { appEnvironment } from "./environment";

let detectorPromise: Promise<FaceLandmarker> | null = null;

export async function getFaceLandmarker(): Promise<FaceLandmarker> {
  if (!detectorPromise) {
    detectorPromise = FilesetResolver.forVisionTasks(
      appEnvironment.faceLandmarkerWasmUrl
    ).then((vision) =>
      FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: appEnvironment.faceLandmarkerModelUrl,
        },
        runningMode: "VIDEO",
        outputFaceBlendshapes: false,
        numFaces: 4,
      })
    );
  }

  return detectorPromise;
}

export async function detectFace(image: ImageData, timestamp = performance.now()) {
  const faceLandmarker = await getFaceLandmarker();

  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    const message = args.map((value) => String(value)).join(" ");

    if (
      message.includes("Created TensorFlow Lite XNNPACK delegate for CPU") ||
      message.includes("inference_feedback_manager.cc:121")
    ) {
      return;
    }

    originalConsoleError(...args);
  };

  try {
    return faceLandmarker.detectForVideo(image, timestamp);
  } finally {
    console.error = originalConsoleError;
  }
}