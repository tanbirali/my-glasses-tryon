import { describe, expect, it } from "vitest";
import { extractLandmarks, validateFaceDetection } from "../lib/faceLandmarks";

describe("face landmark utilities", () => {
  it("extracts face landmarks into plain points", () => {
    const result = {
      faceLandmarks: [[{ x: 0.1, y: 0.2, z: 0.3 }]],
    };

    expect(extractLandmarks(result)[0][0]).toEqual({ x: 0.1, y: 0.2, z: 0.3 });
  });

  it("reports a no-face scenario", () => {
    const result = { faceLandmarks: [] };

    expect(validateFaceDetection(result)).toEqual({
      valid: false,
      reason: "No face detected. Try a clearer, front-facing photo.",
      faceCount: 0,
    });
  });

  it("reports a multiple-face scenario", () => {
    const result = { faceLandmarks: [[], []] };

    expect(validateFaceDetection(result)).toEqual({
      valid: false,
      reason: "Multiple faces detected. Please upload a photo with one face only.",
      faceCount: 2,
    });
  });
});