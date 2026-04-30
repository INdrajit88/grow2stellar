import dotenv from "dotenv";

dotenv.config();

const numberFromEnv = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: numberFromEnv(process.env.PORT, 4000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  apiPublicUrl: process.env.API_PUBLIC_URL || `http://localhost:${numberFromEnv(process.env.PORT, 4000)}`,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  stellarNetworkPassphrase:
    process.env.STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
  stellarHomeDomain: process.env.STELLAR_HOME_DOMAIN || "localhost",
  stellarWebAuthDomain: process.env.STELLAR_WEB_AUTH_DOMAIN || "localhost",
  stellarWebAuthSecret: process.env.STELLAR_WEB_AUTH_SECRET,
  authChallengeTimeoutSeconds: numberFromEnv(
    process.env.AUTH_CHALLENGE_TIMEOUT_SECONDS,
    300,
  ),
  dataFile: process.env.DATA_FILE || "./data/grow2stellar.json",
};

export function assertRequiredEnv() {
  const missing = [];

  if (!env.jwtSecret) missing.push("JWT_SECRET");
  if (!env.stellarWebAuthSecret) missing.push("STELLAR_WEB_AUTH_SECRET");

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
