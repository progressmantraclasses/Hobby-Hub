# Hobby Hub - Backend Server

This is the Node.js / Express backend server for **Hobby Hub**. It handles AI integration, rate limiting, and customized plan generation logic with a three-tier caching system.

## ⚙️ Features & Architecture

- **Express Server**: Fast, unopinionated web framework for Node.js REST APIs.
- **Three-Tier Caching System**:
  - **Upstash Redis**: Fast, in-memory cache keyed on `hobby:level:weeklyTime`, serves exact matches instantly.
  - **MongoDB Cache**: Persistent cache for successfully generated roadmaps and per-chapter content, falls back to Redis on a hit.
  - **Semantic Cache** (`semanticCache.service.ts`): On a MongoDB miss, candidates with the same `level`/`weeklyTime` are compared against the request's hobby text using a real sentence embedding computed locally via `@huggingface/transformers` (`onnx-community/all-MiniLM-L6-v2-ONNX`, ONNX runtime, no API key, no per-request network call). Cosine similarity threshold `0.65` — catches genuine paraphrases (e.g. "learn to strum a guitar" ↔ "acoustic guitar lessons", ~0.63 similarity despite sharing almost no words) while keeping different-but-related hobbies apart (e.g. "guitar" vs "piano" stays ~0.57). The model (~90MB) is cached at `server/.model-cache/` (gitignored, outside `node_modules` so it survives redeploys) and warmed up at server startup so the first request isn't the one that pays the load cost.
- **AI Integration**: Communicates with the Groq SDK (Llama-3.1 model) to generate fully structured, gamified hobby roadmaps in JSON format.
- **Rate Limiting**: Protects expensive LLM routes using Redis sorted-set window rate limiting.

## 📂 Project Structure
- `src/config`: `env.ts` (validated env vars), `mongo.ts`, `redis.ts`
- `src/controllers`: `plan.controller.ts`, `chapter.controller.ts`, `video.controller.ts`
- `src/routes`: route definitions, one file per resource
- `src/services`: `groq.service.ts` (LLM calls), `youtube.service.ts`, `videoFilter.service.ts`, `semanticCache.service.ts` (local embedding-based semantic matching)
- `src/models`: Mongoose schemas (`Plan.model.ts`, `VideoCache.model.ts`)
- `src/schemas`: Zod schemas, shared shape with the frontend
- `src/middleware`: `rateLimiter`, `errorHandler`
- `src/tests`: Jest test suites

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Caching**: Upstash Redis (`ioredis`)
- **AI Provider**: Groq SDK
- **Local Embeddings**: `@huggingface/transformers` (ONNX runtime, for the semantic cache)
- **Validation**: Zod
- **Testing**: Jest & Supertest

## 🔌 API Endpoints

### 1. Generate Hobby Plan
**Endpoint:** `POST /api/generate-plan`
- **Description:** Generates a custom learning roadmap based on the user's requested hobby, experience level, and weekly time commitment. This route goes through the multi-tier caching system before hitting the Groq AI API.
- **Body Example:**
  ```json
  {
    "hobby": "Guitar",
    "level": "beginner",
    "weeklyTime": 5
  }
  ```

### 2. Fetch Technique Video
**Endpoint:** `GET /api/technique-video`
- **Description:** Fetches an optimized YouTube video tailored for a specific technique or chapter step within a generated plan.
- **Query Params:** `?query="How to hold a guitar pick"`

### 3. Generate Chapter Content
**Endpoint:** `POST /api/plans/:planId/chapters/:chapterId/generate`
- **Description:** Generates expanded, in-depth content (the 7-step learning flow) for one chapter of a specific plan. Scoped by `planId` so that chapters with the same slug across different plans never collide. Returns the cached `steps` immediately if this chapter was already generated.
- **Params:** `planId` (Mongo `_id` of the plan), `chapterId` (chapter slug, unique within that plan)

## 🚀 Getting Started

### Prerequisites
- Node.js (v22.11.0 or higher)
- MongoDB Cluster URI
- Upstash Redis Account Credentials
- Groq API Key
- YouTube Data API v3 Key (for video content searches)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup Environment Variables:
   Create a `.env` file in the root of the server directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Then, populate the `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/hobbyhub
   UPSTASH_REDIS_REST_URL=https://<your-database>.upstash.io
   UPSTASH_REDIS_REST_TOKEN=<your-token>
   GROQ_API_KEY=<your-groq-api-key>
   YOUTUBE_API_KEY=<your-youtube-api-key>
   ```

3. **Available Scripts:**

   - **Run Development Server:**
     ```bash
     npm run dev
     ```
     Starts the server in development mode using `ts-node-dev` with hot-reloading on the port specified in your `.env`.

   - **Build for Production:**
     ```bash
     npm run build
     ```
     Compiles the TypeScript source code to JavaScript using `tsc`.

   - **Start Production Server:**
     ```bash
     npm start
     ```
     Starts the compiled production server using `nodemon src/server.js` (Requires `npm run build` to be run first).

   - **Run Tests:**
     ```bash
     npm test
     ```
     Executes the Jest test suite.
