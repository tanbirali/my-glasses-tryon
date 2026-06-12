import type { FaceAnchorsLike } from "./faceLandmarks";
import type { FacePoint, FrameTransform } from "../types/face";

const DEFAULT_FRAME_ASPECT_RATIO = 2.35;

export function distance(a: FacePoint, b: FacePoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function midpoint(a: FacePoint, b: FacePoint): FacePoint {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: ((a.z ?? 0) + (b.z ?? 0)) / 2,
  };
}

export function calculateFrameWidth(anchors: FaceAnchorsLike): number {
  const eyeDistance = distance(anchors.leftEye, anchors.rightEye);
  const templeDistance = distance(anchors.leftTemple, anchors.rightTemple);
  const faceHeight = distance(anchors.forehead, anchors.chin);
  const eyeBasedWidth = eyeDistance * 2.1;
  const templeBasedWidth = templeDistance * 0.82;
  const faceBasedWidth = faceHeight * 0.45;
  const targetWidth = eyeBasedWidth * 0.7 + templeBasedWidth * 0.2 + faceBasedWidth * 0.1;
  const minWidth = eyeDistance * 1.8;
  const maxWidth = Math.max(templeDistance * 0.95, faceHeight * 0.65);

  return Math.max(minWidth, Math.min(targetWidth, maxWidth));
}

export function calculateFrameHeight(
  frameWidth: number,
  anchors: FaceAnchorsLike,
  aspectRatio = DEFAULT_FRAME_ASPECT_RATIO
): number {
  const faceHeight = distance(anchors.forehead, anchors.chin);
  const widthBasedHeight = frameWidth / aspectRatio;
  const proportionalHeight = faceHeight * 0.18;

  return Math.max(widthBasedHeight, proportionalHeight);
}

export function calculateRotation(anchors: FaceAnchorsLike): number {
  const eyeAngle = Math.atan2(
    anchors.rightEye.y - anchors.leftEye.y,
    anchors.rightEye.x - anchors.leftEye.x
  );
  const templeAngle = Math.atan2(
    anchors.rightTemple.y - anchors.leftTemple.y,
    anchors.rightTemple.x - anchors.leftTemple.x
  );

  return eyeAngle * 0.8 + templeAngle * 0.2;
}

export function calculateCenterPosition(anchors: FaceAnchorsLike): FacePoint {
  const eyeMidpoint = midpoint(anchors.leftEye, anchors.rightEye);
  const templeMidpoint = midpoint(anchors.leftTemple, anchors.rightTemple);
  const eyeDistance = distance(anchors.leftEye, anchors.rightEye);
  const noseOffsetX = anchors.nose.x - eyeMidpoint.x;

  return {
    x: eyeMidpoint.x * 0.86 + templeMidpoint.x * 0.14 + noseOffsetX * 0.04,
    y: eyeMidpoint.y - eyeDistance * 0.08,
  };
}

export function calculateFrameTransform(
  anchors: FaceAnchorsLike,
  canvasWidth: number,
  canvasHeight: number
): FrameTransform {
  const width = calculateFrameWidth(anchors);
  const height = calculateFrameHeight(width, anchors);
  const center = calculateCenterPosition(anchors);
  const rotation = calculateRotation(anchors);

  return {
    width,
    height,
    centerX: center.x,
    centerY: center.y,
    rotation,
    scale: width / Math.max(canvasWidth, canvasHeight),
  };
}