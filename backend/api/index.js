// Vercel serverless entry point for the Grow2Stellar Express backend.
// All requests to /api/* are routed here via vercel.json rewrites.

import { createApp } from "../src/app.js";

const app = createApp();

export default app;
