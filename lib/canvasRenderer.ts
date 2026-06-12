import type { CanvasRenderer, FrameTransform } from "../types/face";

export function createCanvasRenderer(canvas: HTMLCanvasElement): CanvasRenderer {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas rendering is not available in this browser.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  return { canvas, context };
}

export function drawImageLayer(
  renderer: CanvasRenderer,
  image: CanvasImageSource
): void {
  const { canvas, context } = renderer;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
}

export async function drawFrameLayer(
  renderer: CanvasRenderer,
  frameImage: HTMLImageElement,
  transform: FrameTransform
): Promise<void> {
  const { context } = renderer;
  const drawnHeight = transform.width * (frameImage.naturalHeight / frameImage.naturalWidth);

  context.save();
  context.translate(transform.centerX, transform.centerY);
  context.rotate(transform.rotation);
  context.drawImage(
    frameImage,
    -transform.width / 2,
    -drawnHeight / 2,
    transform.width,
    drawnHeight
  );
  context.restore();
}

export function drawFaceMesh(
  renderer: CanvasRenderer,
  landmarks: Array<{ x: number; y: number }>
): void {
  const { context } = renderer;

  if (landmarks.length === 0) {
    return;
  }

  context.save();
  context.lineWidth = 1.5;
  context.strokeStyle = "rgba(251, 191, 36, 0.55)";
  context.fillStyle = "rgba(255, 255, 255, 0.75)";

  context.beginPath();
  for (const point of landmarks) {
    context.moveTo(point.x + 1.25, point.y);
    context.arc(point.x, point.y, 1.25, 0, Math.PI * 2);
  }
  context.fill();

  const eyeConnections: Array<[number, number]> = [
    [33, 133],
    [133, 159],
    [159, 145],
    [145, 33],
    [362, 263],
    [263, 386],
    [386, 374],
    [374, 362],
    [33, 362],
    [133, 263],
  ];

  context.beginPath();
  for (const [fromIndex, toIndex] of eyeConnections) {
    const from = landmarks[fromIndex];
    const to = landmarks[toIndex];

    if (!from || !to) {
      continue;
    }

    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
  }
  context.stroke();
  context.restore();
}

export async function drawGlasses(
  renderer: CanvasRenderer,
  image: CanvasImageSource,
  frameImage: HTMLImageElement,
  transform: FrameTransform
): Promise<void> {
  drawImageLayer(renderer, image);
  await drawFrameLayer(renderer, frameImage, transform);
}

export async function exportCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to export the rendered image."));
        return;
      }

      resolve(blob);
    }, "image/png");
  });
}