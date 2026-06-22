# FACEMAX — AI Face Analysis

AI-powered facial analysis app with face detection, scoring, and premium paywall.

## Features

- Face detection via MediaPipe BlazeFace (runs client-side, no server needed)
- Facial symmetry, harmony, and attractiveness scoring
- Confidence score display (80–98% range)
- Premium paywall (payment integration ready)
- Dark purple glassmorphism UI

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- MediaPipe BlazeFace

## Quick Start (Development)

```bash
npm install
PORT=3000 BASE_PATH=/ npx vite
```

## Build for Production

```bash
PORT=3000 BASE_PATH=/ npx vite build
```

Built output is in `dist/public/` — deploy that folder as a static site.

## Deploy on Render (Static Site)

1. Push source to GitHub
2. Create new **Static Site** on [render.com](https://render.com)
3. Set **Build Command:** `npm install && PORT=3000 BASE_PATH=/ npx vite build`
4. Set **Publish Directory:** `dist/public`
5. Add environment variables from `.env.example`

## Environment Variables

See `.env.example` for all available configuration options.
