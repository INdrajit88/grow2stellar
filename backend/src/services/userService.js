import { createUser, publicUser } from "../models/User.js";
import { notFound } from "../utils/httpError.js";
import { getState, updateState } from "../store/jsonStore.js";

export async function getOrCreateUserByWallet(walletAddress) {
  return updateState((state) => {
    const now = new Date().toISOString();
    let user = state.users.find((item) => item.walletAddress === walletAddress);

    if (!user) {
      user = createUser({ walletAddress });
      state.users.push(user);
    } else {
      user.lastSeenAt = now;
      user.updatedAt = now;
    }

    return publicUser(user);
  });
}

export async function getUserById(userId) {
  const state = await getState();
  const user = state.users.find((item) => item.id === userId);

  if (!user) {
    throw notFound("User not found");
  }

  return publicUser(user);
}

export async function updateUserProfile(userId, updates) {
  return updateState((state) => {
    const user = state.users.find((item) => item.id === userId);

    if (!user) {
      throw notFound("User not found");
    }

    if (typeof updates.displayName === "string") {
      user.displayName = updates.displayName.trim().slice(0, 80);
    }

    if (typeof updates.avatarUrl === "string") {
      user.avatarUrl = updates.avatarUrl.trim().slice(0, 500);
    }

    user.updatedAt = new Date().toISOString();
    return publicUser(user);
  });
}
