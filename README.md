# Hobby Hub — Gamified Learning & Customized Roadmaps

Hobby Hub is a mobile application that generates customized, structured learning plans for any hobby. Given a target hobby, skill level, and weekly time commitment, the backend generates a multi-chapter roadmap via an LLM, and the mobile app walks the user through each chapter as a 7-step gamified learning flow (summary, video, reflection, reading, interactive activity, quiz, practice).

This is a monorepo with two independent projects:

```
Hobby-Hub/
├── App/      React Native mobile client
└── server/   Node.js / Express backend API
```

---

## Features

- **AI-generated learning plans** — a structured, multi-chapter roadmap tailored to hobby, experience level, and weekly time, generated via Groq's Llama-3.1.
- **Per-chapter generated content** — each chapter's 7-step learning flow (summary, video, reflection, reading, interactive activity, quiz, practice) is generated on demand and cached once generated.
- **Gamification** — XP, levels, daily streaks, badges, and per-hobby progress tracking, persisted locally.
- **Three-tier caching** — Redis (exact-match) → MongoDB (persistent document cache) → local semantic-embedding match, so both exact repeats and near-duplicate requests (e.g. "guitar basics" vs "guitars") are served without hitting the LLM again.
- **Auto-fetched instructional videos** — YouTube search results are filtered and ranked by the LLM to attach a relevant video to each chapter's video step.

---

## Tech Stack

### Frontend — `App/` (React Native mobile client)
- **Framework:** React Native 0.86 (Bare CLI), React 19.2
- **Language:** TypeScript
- **State management:** Zustand, persisted to device storage via `@react-native-async-storage/async-storage`
- **Navigation:** React Navigation (native-stack + bottom-tabs)
- **Animations/UI:** React Native Reanimated, Gesture Handler, `@gorhom/bottom-sheet`, `react-native-svg`
- **Video:** `react-native-youtube-iframe`
- **Validation:** Zod
- **Testing:** Jest

### Backend — `server/` (API)
- **Runtime:** Node.js, Express 5
- **Language:** TypeScript
- **Database:** MongoDB via Mongoose
- **Cache / rate limiting:** Upstash Redis
- **AI:** Groq SDK (Llama-3.1)
- **Local embeddings:** `@huggingface/transformers` (ONNX runtime, semantic cache)
- **External API:** YouTube Data API v3
- **Validation:** Zod
- **Testing:** Jest, Supertest, ts-jest

---

## Folder Structure

### `App/src/`
```
components/         Shared UI components
  stepRenderers/     One renderer per chapter step type (summary, video, reflection, reading, interactive, quiz, practice)
constants/           Static config data (badges, hobby lists/emoji, levels, chapter-status labels/colors, rank thresholds, tab icons)
hooks/               useAsyncTask (loading/error/success state for async calls), useThinkingAnimation (pulsing "thinking" loading indicator)
navigation/          RootNavigator (stack + bottom tabs)
schemas/             Zod schemas shared with the shape returned by the backend (plan, chapter content)
screens/             One file per screen (Home, Hobby, Level, TimeCommitment, Course, CourseDetail, ChapterDetail, ChapterFlow, ChapterComplete, Profile)
services/            api.ts — fetch calls to the backend
store/               planStore.ts — Zustand store (hobbies, progress, XP/streak, onboarding draft fields)
theme/               colors.ts — the app's single design-token palette
utils/               Pure helper functions (XP/level math, streak-date math)
```

### `server/src/`
```
config/        env.ts (validated env vars), mongo.ts, redis.ts
controllers/   plan.controller.ts, chapter.controller.ts, video.controller.ts
routes/        plan.routes.ts, chapter.routes.ts, video.routes.ts
services/      groq.service.ts (LLM calls), youtube.service.ts, videoFilter.service.ts, semanticCache.service.ts (local embedding-based semantic cache)
models/        Plan.model.ts, VideoCache.model.ts (Mongoose schemas)
schemas/       plan.schema.ts — Zod schemas (shared shape with the frontend)
middleware/    rateLimiter, errorHandler
utils/         normalizeQuery.ts
tests/         Jest test suites
```

`server/.model-cache/` (gitignored, created on first run) — the downloaded embedding model, kept outside `node_modules` so it survives `npm ci`/redeploys.

---

## Prerequisites

- Node.js v22.11.0 or higher
- A MongoDB connection string (e.g. MongoDB Atlas)
- An Upstash Redis database (REST URL + token)
- A Groq API key
- A YouTube Data API v3 key
- For running the mobile app: Android Studio (Android) and/or Xcode (iOS, macOS only)

---

## Setup

### 1. Clone the repository
```bash
git clone https://github.com/progressmantraclasses/Hobby-Hub.git
cd Hobby-Hub
```

### 2. Backend (`server/`)

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env` (see [Environment Variables](#environment-variables) below), then:

```bash
npm run dev     # starts the dev server with hot-reload (ts-node-dev)
npm test        # runs the Jest test suite
```

The server listens on the port set by `PORT` in `.env` (all API routes are mounted under `/api`).

### 3. Frontend (`App/`)

```bash
cd App
npm install
```

iOS only (macOS):
```bash
cd ios && bundle install && bundle exec pod install && cd ..
```

In development, `App/src/services/api.ts` auto-detects your backend host — it reads the Metro bundler's own address out of the running JS bundle's URL (`NativeModules.SourceCode.scriptURL`), so no manual IP configuration is needed as long as your device/emulator can reach the machine running `npm start` on port `5000` (the `API_PORT` constant in `api.ts` — change it if your server uses a different port). Release builds instead point at a fixed production URL hardcoded in the same file — update that before shipping.

```bash
npm start           # starts the Metro bundler
npm run android      # builds and runs on Android
npm run ios          # builds and runs on iOS (macOS only)
npm test             # runs the Jest test suite
```

---

## Environment Variables

All environment variables are consumed by the **backend** (`server/.env`) and validated at startup by `server/src/config/env.ts` — the server refuses to start if any are missing. The frontend has no `.env` file; see the `BASE_URL` note above instead.

| Variable | Description |
|---|---|
| `PORT` | Port the Express server listens on |
| `MONGO_URI` | MongoDB connection string |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST endpoint |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token |
| `GROQ_API_KEY` | Groq API key, used for plan and chapter-content generation |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key, used to fetch chapter videos |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/generate-plan` | Generate (or fetch a cached) learning plan for a `{ hobby, level, weeklyTime }` request |
| `POST` | `/api/plans/:planId/chapters/:chapterId/generate` | Generate (or fetch cached) content for one chapter of a specific plan |
| `GET` | `/api/technique-video` | Fetch an LLM-ranked YouTube video for a given `?query=` |

---

## Caching Architecture

```mermaid
graph TD
    Client[React Native App] -->|POST /api/generate-plan| Backend[Express API]
    Backend -->|1. exact-match lookup| Redis[Upstash Redis]
    Backend -->|2. fallback: normalizedQuery lookup| MongoDB[(MongoDB)]
    Backend -->|3. fallback: semantic-similarity match| SemanticCache[Local embedding model]
    Backend -->|4. fallback: generate| LLM[Groq Llama-3.1]
```

1. **Redis** — plans are cached under a normalized key (`hobby:level:weeklyTime`, e.g. `guitar:beginner:5`) with a 24h TTL. An exact match returns instantly.
2. **MongoDB** — on a Redis miss, the server checks for a document with a matching `normalizedQuery`. A hit is re-written back into Redis.
3. **Semantic cache** (`services/semanticCache.service.ts`) — on a MongoDB miss, plans with the same `level`/`weeklyTime` are compared against the request's hobby text using a real sentence embedding, computed locally via [`@huggingface/transformers`](https://github.com/huggingface/transformers.js) (`onnx-community/all-MiniLM-L6-v2-ONNX`, running fully in-process — no API key, no per-request network call). Cosine similarity threshold `0.90`, tuned against real pairs run through this model: near-duplicate phrasings land around `0.71`–`0.91` (e.g. "acoustic guitar lessons" vs "guitar basics" ~`0.71`, "guitar" vs "guitars" ~`0.91`) — the threshold sits at the top of that range so only true near-duplicates hit the cache, not just related topics. A hit is written back into Redis.
4. **Groq (Llama-3.1)** — only reached when all three caches miss; the generated plan is persisted to MongoDB (with its embedding) and Redis for next time. Concurrent requests that all miss the cache for the *same* key (e.g. two rapid submissions, or a client retry that fires while the first attempt is still generating) are coalesced onto a single in-flight generation instead of each independently calling Groq — see "Request Coalescing" below.

The embedding model (~90MB) downloads once and is cached at `server/.model-cache/` (gitignored, kept outside `node_modules` so it survives `npm ci`/redeploys instead of re-downloading every time). The server warms it up at startup (`warmupSemanticCache()` in `server.ts`) so the first real request doesn't pay the load-time cost.

Chapter content follows the same pattern per-chapter, scoped by plan ID: once a chapter's content is generated, it's stored on that chapter's `steps` field and served from MongoDB on subsequent requests without calling the LLM again.

### Request Coalescing

Both `plan.controller.ts` and `chapter.controller.ts` keep an in-process `Map` of the generation `Promise` for each key currently being generated (normalized `hobby:level:weeklyTime`, or `planId:chapterId`). If a second request for the same key arrives while the first is still in flight, it awaits the same promise instead of starting its own Groq/YouTube calls — so a client retry (e.g. after its own request timeout) never doubles the LLM cost or races to write the same document twice.

### Reverse Proxy Awareness

`app.set("trust proxy", 1)` is set in `app.ts` so `req.ip` — which the rate limiter keys on — reflects the real client address from `X-Forwarded-For` when the server sits behind a reverse proxy / load balancer, rather than the proxy's own address.
