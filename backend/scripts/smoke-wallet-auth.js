import { Keypair, Networks, TransactionBuilder } from "@stellar/stellar-sdk";

process.env.JWT_SECRET = "wallet-auth-smoke-secret";
process.env.STELLAR_WEB_AUTH_SECRET = Keypair.random().secret();
process.env.STELLAR_NETWORK_PASSPHRASE = Networks.TESTNET;
process.env.STELLAR_HOME_DOMAIN = "localhost";
process.env.STELLAR_WEB_AUTH_DOMAIN = "localhost";
process.env.DATA_FILE = "./data/smoke-wallet-auth.json";

const { buildWalletChallenge, verifySignedChallenge } = await import(
  "../src/services/walletAuthService.js"
);
const { createSessionToken, verifySessionToken } = await import(
  "../src/services/sessionService.js"
);
const { getOrCreateUserByWallet } = await import("../src/services/userService.js");

const clientKeypair = Keypair.random();
const challenge = buildWalletChallenge(clientKeypair.publicKey());
const transaction = TransactionBuilder.fromXDR(
  challenge.transaction,
  challenge.networkPassphrase,
);

transaction.sign(clientKeypair);

const signedTransaction = transaction.toEnvelope().toXDR("base64").toString();
const verification = verifySignedChallenge(
  signedTransaction,
  clientKeypair.publicKey(),
);
const user = await getOrCreateUserByWallet(verification.walletAddress);
const token = createSessionToken(user);
const session = verifySessionToken(token);

if (session.walletAddress !== clientKeypair.publicKey()) {
  throw new Error("Session wallet address did not match signed wallet");
}

console.log(`Wallet auth smoke OK for ${session.walletAddress}`);
