import { randomUUID } from "node:crypto";

export function createUser({ walletAddress }) {
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    walletAddress,
    displayName: "",
    avatarUrl: "",
    roleFlags: {
      organizer: false,
      ambassador: false,
    },
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
  };
}

export function publicUser(user) {
  return {
    id: user.id,
    walletAddress: user.walletAddress,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    roleFlags: user.roleFlags,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastSeenAt: user.lastSeenAt,
  };
}
