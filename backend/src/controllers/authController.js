import { buildWalletChallenge, verifySignedChallenge } from "../services/walletAuthService.js";
import { createSessionToken } from "../services/sessionService.js";
import { getOrCreateUserByWallet } from "../services/userService.js";

export async function requestChallenge(req, res) {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: { message: "walletAddress is required" } });
    }

    const challenge = buildWalletChallenge(walletAddress);
    res.json(challenge);
  } catch (err) {
    console.error("[nonce] error:", err.message);
    const status = err.statusCode || 500;
    res.status(status).json({ error: { message: err.message } });
  }
}

export async function verifyChallenge(req, res) {
  try {
    const { signedTransaction, walletAddress } = req.body;

    if (!signedTransaction) {
      return res.status(400).json({ error: { message: "signedTransaction is required" } });
    }

    const verification = verifySignedChallenge(signedTransaction, walletAddress);
    const user = await getOrCreateUserByWallet(verification.walletAddress);
    const token = createSessionToken(user);

    res.json({ token, user });
  } catch (err) {
    console.error("[verify] error:", err.message);
    const status = err.statusCode || 500;
    res.status(status).json({ error: { message: err.message } });
  }
}

export async function debugEnv(req, res) {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasWebAuthSecret: !!process.env.STELLAR_WEB_AUTH_SECRET,
    stellarHomeDomain: process.env.STELLAR_HOME_DOMAIN || "grow2stellar.vercel.app",
    stellarWebAuthDomain: process.env.STELLAR_WEB_AUTH_DOMAIN || "grow2stellar.vercel.app",
    networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
  });
}
