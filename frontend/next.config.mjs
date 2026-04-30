import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("../", import.meta.url));

const nextConfig = {
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;
