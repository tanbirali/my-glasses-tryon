import type { FaceLandmarks, FacePoint } from "../types/face";

export const FACE_LANDMARK_INDICES = {
  leftEye: [33, 133, 159, 145],
  rightEye: [362, 263, 386, 374],
  leftTemple: 234,
  rightTemple: 454,
  nose: 1,
  forehead: 10,
  chin: 152,
} as const;

type RawFaceLandmarkerResult = {
  faceLandmarks: Array<Array<{ x: number; y: number; z?: number }>>;
};

export interface FaceDetectionValidation {
  valid: boolean;
  reason: string | null;
  faceCount: number;
}

export type FaceAnchorsLike = {
  leftEye: FacePoint;
  rightEye: FacePoint;
  nose: FacePoint;
  leftTemple: FacePoint;
  rightTemple: FacePoint;
  forehead: FacePoint;
  chin: FacePoint;
};

export function extractLandmarks(
  result: RawFaceLandmarkerResult
): FaceLandmarks[] {
  return result.faceLandmarks.map((face) =>
    face.map((point) => ({
      x: point.x,
      y: point.y,
      z: point.z,
    }))
  );
}

export function projectLandmarksToPixels(
  landmarks: FaceLandmarks,
  width: number,
  height: number
): FaceLandmarks {
  return landmarks.map((point) => ({
    x: point.x * width,
    y: point.y * height,
    z: point.z,
  }));
}

export function validateFaceDetection(
  result: RawFaceLandmarkerResult
): FaceDetectionValidation {
  const faceCount = result.faceLandmarks.length;

  if (faceCount === 0) {
    return {
      valid: false,
      reason: "No face detected. Try a clearer, front-facing photo.",
      faceCount,
    };
  }

  if (faceCount > 1) {
    return {
      valid: false,
      reason: "Multiple faces detected. Please upload a photo with one face only.",
      faceCount,
    };
  }

  return {
    valid: true,
    reason: null,
    faceCount,
  };
}

export function handleNoFaceScenario(): string {
  return "No face detected. Upload a sharper image with the face fully visible.";
}

export function getFaceAnchorPoints(landmarks: FaceLandmarks): FaceAnchorsLike {
  return {
    leftEye: averagePoints(landmarks, FACE_LANDMARK_INDICES.leftEye),
    rightEye: averagePoints(landmarks, FACE_LANDMARK_INDICES.rightEye),
    nose: landmarks[FACE_LANDMARK_INDICES.nose] ?? fallbackPoint(landmarks),
    leftTemple: landmarks[FACE_LANDMARK_INDICES.leftTemple] ?? fallbackPoint(landmarks),
    rightTemple: landmarks[FACE_LANDMARK_INDICES.rightTemple] ?? fallbackPoint(landmarks),
    forehead: landmarks[FACE_LANDMARK_INDICES.forehead] ?? fallbackPoint(landmarks),
    chin: landmarks[FACE_LANDMARK_INDICES.chin] ?? fallbackPoint(landmarks),
  };
}

function averagePoints(landmarks: FaceLandmarks, indices: readonly number[]): FacePoint {
  const points = indices
    .map((index) => landmarks[index])
    .filter((point): point is FacePoint => Boolean(point));

  if (points.length === 0) {
    return fallbackPoint(landmarks);
  }

  const totals = points.reduce<{ x: number; y: number; z: number }>(
    (accumulator, point) => {
      accumulator.x += point.x;
      accumulator.y += point.y;
      accumulator.z += point.z ?? 0;
      return accumulator;
    },
    { x: 0, y: 0, z: 0 }
  );

  return {
    x: totals.x / points.length,
    y: totals.y / points.length,
    z: totals.z / points.length,
  };
}

function fallbackPoint(landmarks: FaceLandmarks): FacePoint {
  return landmarks[0] ?? { x: 0.5, y: 0.5, z: 0 };
}