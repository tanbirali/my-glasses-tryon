export const appEnvironment = {
  faceLandmarkerModelUrl:
    process.env.NEXT_PUBLIC_FACE_LANDMARKER_MODEL_URL ??
    "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task",
  faceLandmarkerWasmUrl:
    process.env.NEXT_PUBLIC_FACE_LANDMARKER_WASM_URL ??
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
  maxUploadSizeBytes: 10 * 1024 * 1024,
  supportedMimeTypes: ["image/jpeg", "image/png"],
} as const;