import { buildWalletChallenge, verifySignedChallenge } from "../services/walletAuthService.js";
import { createSessionToken } from "../services/sessionService.js";
import { getOrCreateUserByWallet } from "../services/userService.js";

export async function requestChallenge(req, res) {
  const { walletAddress } = req.body;
  const challenge = buildWalletChallenge(walletAddress);
  res.json(challenge);
}

export async function verifyChallenge(req, res) {
  const { signedTransaction, walletAddress } = req.body;
  const verification = verifySignedChallenge(signedTransaction, walletAddress);
  const user = await getOrCreateUserByWallet(verification.walletAddress);
  const token = createSessionToken(user);

  res.json({
    token,
    user,
  });
}
