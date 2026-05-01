import { Keypair, StrKey, WebAuth } from "@stellar/stellar-sdk";
import { env } from "../config/env.js";
import { badRequest } from "../utils/httpError.js";

function getServerKeypair() {
  const secret = env.stellarWebAuthSecret;
  if (!secret) throw new Error("STELLAR_WEB_AUTH_SECRET is not configured");
  try {
    return Keypair.fromSecret(secret);
  } catch {
    throw new Error("STELLAR_WEB_AUTH_SECRET is not a valid Stellar secret key");
  }
}

function assertWalletAddress(walletAddress) {
  if (!walletAddress || !StrKey.isValidEd25519PublicKey(walletAddress)) {
    throw badRequest("A valid Stellar public wallet address is required");
  }
}

export function buildWalletChallenge(walletAddress) {
  assertWalletAddress(walletAddress);

  const serverKeypair = getServerKeypair();

  try {
    const transaction = WebAuth.buildChallengeTx(
      serverKeypair,
      walletAddress,
      env.stellarHomeDomain,
      env.authChallengeTimeoutSeconds,
      env.stellarNetworkPassphrase,
      env.stellarWebAuthDomain,
    );

    return {
      transaction,
      networkPassphrase: env.stellarNetworkPassphrase,
      homeDomain: env.stellarHomeDomain,
      webAuthDomain: env.stellarWebAuthDomain,
      serverSigningKey: serverKeypair.publicKey(),
      expiresInSeconds: env.authChallengeTimeoutSeconds,
    };
  } catch (err) {
    // Wrap SDK errors as 400 so they don't become 500s
    throw badRequest(`Challenge build failed: ${err.message}`);
  }
}

export function verifySignedChallenge(signedTransaction, expectedWalletAddress) {
  if (!signedTransaction) {
    throw badRequest("Signed challenge transaction is required");
  }

  const serverKeypair = getServerKeypair();
  const serverPublicKey = serverKeypair.publicKey();

  try {
    const challenge = WebAuth.readChallengeTx(
      signedTransaction,
      serverPublicKey,
      env.stellarNetworkPassphrase,
      env.stellarHomeDomain,
      env.stellarWebAuthDomain,
    );

    if (expectedWalletAddress && challenge.clientAccountID !== expectedWalletAddress) {
      throw badRequest("Signed challenge does not match the requested wallet");
    }

    const matchedSigners = WebAuth.verifyChallengeTxSigners(
      signedTransaction,
      serverPublicKey,
      env.stellarNetworkPassphrase,
      [challenge.clientAccountID],
      env.stellarHomeDomain,
      env.stellarWebAuthDomain,
    );

    if (!matchedSigners.includes(challenge.clientAccountID)) {
      throw badRequest("Wallet signature was not found on the challenge");
    }

    return {
      walletAddress: challenge.clientAccountID,
      matchedHomeDomain: challenge.matchedHomeDomain,
    };
  } catch (err) {
    // Re-throw HttpErrors as-is, wrap everything else as 400
    if (err.statusCode) throw err;
    throw badRequest(`Verification failed: ${err.message}`);
  }
}
