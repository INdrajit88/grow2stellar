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
  apiPublicUrl:
    process.env.API_PUBLIC_URL ||
    `http://localhost:${numberFromEnv(process.env.PORT, 4000)}`,

  // Auth
  jwtSecret: process.env.JWT_SECRET || "grow2stellar-dev-jwt-secret-change-in-prod",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",

  // Stellar / Soroban
  stellarNetworkPassphrase:
    process.env.STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
  stellarHomeDomain: process.env.STELLAR_HOME_DOMAIN || "grow2stellar.vercel.app",
  stellarWebAuthDomain: process.env.STELLAR_WEB_AUTH_DOMAIN || "grow2stellar.vercel.app",
  // Fallback to the testnet key used in local dev — set STELLAR_WEB_AUTH_SECRET
  // in Vercel dashboard to override this
  stellarWebAuthSecret: process.env.STELLAR_WEB_AUTH_SECRET || "SCCZ6EJKCFLLM5GKLDL3S3SUUUETC53X55MM45ADSPBWJNNBUWEXXDJJ",
  stellarRpcUrl:
    process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",

  // Deployed contract IDs
  escrowContractId:
    process.env.ESCROW_CONTRACT_ID ||
    "CB7WAQPDNZSKBXJYBKNGUC6RNEOCLXTSV2FU3B4SGCGPPMKW6YGUCRQW",
  g2sTokenContractId:
    process.env.G2S_TOKEN_CONTRACT_ID ||
    "CDIARUXKKITLLCZTTN3ELJF6YCCMYUJXDJB2AZAHLL2YOYNWHG6IFU4K",

  authChallengeTimeoutSeconds: numberFromEnv(
    process.env.AUTH_CHALLENGE_TIMEOUT_SECONDS,
    300
  ),
  dataFile: process.env.DATA_FILE || "./data/grow2stellar.json",
};

export function assertRequiredEnv() {
  const missing = [];
  if (!env.jwtSecret) missing.push("JWT_SECRET");
  if (!env.stellarWebAuthSecret) missing.push("STELLAR_WEB_AUTH_SECRET");

  if (missing.length > 0) {
    // In production warn but don't crash — Vercel env vars may be set
    // via the dashboard rather than a .env file
    console.warn(`[warn] Missing env vars: ${missing.join(", ")} — some features may not work`);
  }
}
