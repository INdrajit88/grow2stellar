import { assertRequiredEnv, env } from "./config/env.js";
import { createApp } from "./app.js";

assertRequiredEnv();

const app = createApp();

app.listen(env.port, () => {
  console.log(`Grow2Stellar API listening on http://localhost:${env.port}`);
});
