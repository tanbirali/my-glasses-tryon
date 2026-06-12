# My Glasses Try-on Studio

Upload a face photo, detect landmarks with MediaPipe Face Landmarker, position eyewear on the canvas, and export the final image as PNG.

## Setup

1. Install dependencies.

```bash
npm install
```

2. Copy the environment template if you want to override the MediaPipe endpoints.

```bash
cp .env.example .env.local
```

3. Start the app.

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm test
```

## Architecture

The app is split into small feature-oriented modules:

- `features/glasses-tryon/` contains the UI surface and frame gallery.
- `hooks/faceDetectorHook.ts` owns upload, detection, canvas rendering, and export state.
- `lib/` contains reusable detector, landmark, geometry, canvas, image-loading, and environment helpers.
- `tests/` covers landmark extraction and transform math.

## Environment

The app uses these optional client-side variables:

- `NEXT_PUBLIC_FACE_LANDMARKER_MODEL_URL`
- `NEXT_PUBLIC_FACE_LANDMARKER_WASM_URL`

If unset, the app falls back to the hosted MediaPipe CDN assets.

## Notes

- Supported upload formats: JPG and PNG.
- Maximum upload size: 10 MB.
- The renderer keeps the original image resolution and preserves aspect ratio.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
