import { describe, expect, it } from "vitest";
import {
  calculateCenterPosition,
  calculateFrameHeight,
  calculateFrameWidth,
  calculateRotation,
} from "../lib/frameGeometry";

const anchors = {
  leftEye: { x: 220, y: 210 },
  rightEye: { x: 360, y: 216 },
  nose: { x: 292, y: 296 },
  leftTemple: { x: 172, y: 208 },
  rightTemple: { x: 410, y: 220 },
  forehead: { x: 290, y: 98 },
  chin: { x: 292, y: 438 },
};

describe("frame geometry", () => {
  it("calculates a width from eye and temple distances", () => {
    expect(calculateFrameWidth(anchors)).toBeGreaterThan(0);
  });

  it("calculates a proportional height", () => {
    expect(calculateFrameHeight(220, anchors)).toBeGreaterThan(0);
  });

  it("calculates rotation for a tilted face", () => {
    expect(calculateRotation(anchors)).toBeGreaterThan(0);
  });

  it("calculates a centered placement", () => {
    expect(calculateCenterPosition(anchors)).toMatchObject({
      x: expect.any(Number),
      y: expect.any(Number),
    });
  });

  it("positions glasses close to the eye line", () => {
    const center = calculateCenterPosition(anchors);

    expect(center.y).toBeLessThan(anchors.leftEye.y);
    expect(center.x).toBeGreaterThan(anchors.leftEye.x);
    expect(center.x).toBeLessThan(anchors.rightEye.x);
  });
});