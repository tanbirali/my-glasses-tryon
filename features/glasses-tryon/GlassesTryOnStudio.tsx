"use client";

import Image from "next/image";
import { useFaceDetector } from "../../hooks/faceDetectorHook";
import Link from "next/link";
export function GlassesTryOnStudio() {
  const {
    cameraState,
    canvasRef,
    downloadResult,
    frameOptions,
    handleUpload,
    isCameraReady,
    isLoading,
    mode,
    previewAspectRatio,
    resultUrl,
    resumeCamera,
    selectedFrame,
    selectedFrameId,
    setSelectedFrameId,
    uploadState,
    videoRef,
  } = useFaceDetector();

  const statusTone = uploadState.ok
    ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
    : "border-rose-400/30 bg-rose-500/10 text-rose-100";

  const modeLabel = mode === "camera" ? "Live camera" : "Photo upload";
  const cameraLabel = isCameraReady ? "Ready" : cameraState;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(244,169,36,0.18),_transparent_34%),linear-gradient(180deg,_#111111_0%,_#19130c_55%,_#f7f1e6_55%,_#f8f6f1_100%)] px-4 py-6 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/82 p-5 shadow-[0_24px_120px_rgba(0,0,0,0.16)] backdrop-blur md:p-8">
        <header className="grid gap-5 lg:grid-cols-1 lg:items-end">
          <div className="space-y-4">
            <span className="inline-flex w-fit items-center rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
              Glasses studio
            </span>
            <div className="space-y-3">
              <h1 className="max-w-2xl text-4xl font-black tracking-tight text-stone-950 sm:text-5xl lg:text-6xl">
                Try on frames with live camera fitting.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
                Keep the camera on or upload a photo, then let the detected face landmarks place the glasses on the eye line with the correct rotation and scale.
              </p>
            </div>
          </div>

          <div className={`rounded-[1.5rem] border p-5 shadow-[0_16px_50px_rgba(17,17,17,0.08)] ${statusTone}`}>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] opacity-90">
              <span className="rounded-full border border-current/20 px-2.5 py-1">{modeLabel}</span>
              <span className="rounded-full border border-current/20 px-2.5 py-1">Camera {cameraLabel}</span>
              <span className="rounded-full border border-current/20 px-2.5 py-1">{selectedFrame.label}</span>
            </div>
            <p className="mt-4 text-sm leading-6">{uploadState.message}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              
              <button
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-current transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={downloadResult}
                disabled={isLoading || (!resultUrl && !isCameraReady)}
              >
                Download PNG
              </button>
              <button
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-current transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
                onClick={resumeCamera}
                disabled={isLoading || isCameraReady}
              >
                Resume camera
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.6fr)]">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-950 p-4 text-stone-50 shadow-[0_30px_90px_rgba(17,17,17,0.24)]">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300/80">Preview</p>
                  <h2 className="mt-1 text-xl font-bold text-white">{selectedFrame.label} frame fit</h2>
                </div>
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs font-semibold text-stone-200">
                  {previewAspectRatio.toFixed(2)} ratio
                </span>
              </div>

              <div
                className="relative mx-auto overflow-hidden rounded-[1.25rem] border border-white/10 bg-stone-950 shadow-[0_24px_60px_rgba(0,0,0,0.22)]"
                style={{ aspectRatio: previewAspectRatio }}
              >
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 z-10 block h-full w-full bg-transparent pointer-events-none"
                />
                <div className="absolute left-4 top-4 z-20 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 backdrop-blur">
                  {mode === "camera" ? "Live preview" : "Uploaded photo"}
                </div>
                {isLoading ? (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
                    <div className="rounded-full border border-white/20 bg-black/55 px-4 py-2 text-sm font-semibold text-white">
                      Working...
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {resultUrl ? (
              <div className="rounded-[1.35rem] border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 shadow-[0_12px_34px_rgba(16,185,129,0.1)]">
                <p className="text-sm font-semibold">Result ready</p>
                <p className="mt-1 text-sm leading-6 text-emerald-900/80">The current render is ready to download as a PNG export.</p>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-[0_16px_44px_rgba(17,17,17,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Selected frame</p>
              <div className="mt-3 rounded-[1.25rem] bg-stone-950 p-4 text-stone-50">
                <div className="flex items-center justify-center rounded-[1rem] bg-white/5 py-3">
                  <Image alt={selectedFrame.label} height={48} src={selectedFrame.src} width={180} />
                </div>
                <h3 className="mt-4 text-lg font-bold">{selectedFrame.label}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-300">{selectedFrame.description}</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-[0_16px_44px_rgba(17,17,17,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Frames</p>
                  <h2 className="mt-1 text-lg font-bold text-stone-950">Pick a style</h2>
                </div>
                <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold text-white">
                  {frameOptions.length}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {frameOptions.map((frame) => {
                  const active = frame.id === selectedFrameId;

                  return (
                    <button
                      key={frame.id}
                      className={`group rounded-[1.2rem] border p-4 text-left transition ${
                        active
                          ? "border-amber-400 bg-amber-50 shadow-[0_12px_34px_rgba(217,119,6,0.14)]"
                          : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white"
                      }`}
                      type="button"
                      onClick={() => setSelectedFrameId(frame.id)}
                    >
                      <div className="mb-3 flex h-16 items-center justify-center rounded-[1rem] bg-stone-950/95 transition group-hover:scale-[1.01]">
                        <Image alt={frame.label} height={40} src={frame.src} width={160} />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-stone-950">{frame.label}</h3>
                        {active ? (
                          <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-semibold text-stone-950">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{frame.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
        Powered By <Link href="/" style={{ textDecoration: "none", color: "blue" }}>
          &nbsp;Ultimate Coder
        </Link>
      </div>
      </div>
    </main>
  );
}