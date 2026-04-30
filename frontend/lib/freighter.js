"use client";

import {
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

function assertFreighterResult(result, fallbackMessage) {
  if (result?.error) {
    throw new Error(result.error.message || fallbackMessage);
  }

  return result;
}

export async function connectFreighterWallet() {
  const connection = assertFreighterResult(
    await isConnected(),
    "Freighter is not available",
  );

  if (!connection.isConnected) {
    throw new Error("Install or unlock Freighter to connect your Stellar wallet");
  }

  const access = assertFreighterResult(
    await requestAccess(),
    "Could not request wallet access",
  );

  return access.address;
}

export async function getFreighterNetwork() {
  return assertFreighterResult(
    await getNetworkDetails(),
    "Could not read Freighter network",
  );
}

export async function signChallengeTransaction({
  address,
  transaction,
  networkPassphrase,
}) {
  const signed = assertFreighterResult(
    await signTransaction(transaction, {
      address,
      networkPassphrase,
    }),
    "Could not sign challenge transaction",
  );

  return signed.signedTxXdr;
}
