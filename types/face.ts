export interface FacePoint {
    x: number;
    y: number;
    z?: number;
}

export type FaceLandmarks = FacePoint[];

export interface FaceAnchors {
    leftEye: FacePoint;
    rightEye: FacePoint;
    nose: FacePoint;
    leftTemple: FacePoint;
    rightTemple: FacePoint;
    forehead: FacePoint;
    chin: FacePoint;
}

export interface FrameOption {
    id: string;
    label: string;
    src: string;
    description: string;
}

export interface FrameTransform {
    width: number;
    height: number;
    centerX: number;
    centerY: number;
    rotation: number;
    scale: number;
}

export interface CanvasRenderer {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
}

export interface UploadResponse {
    ok: boolean;
    message: string;
    fileName?: string;
    previewUrl?: string;
}

export type FaceDetectionState = "idle" | "loading" | "ready" | "error";