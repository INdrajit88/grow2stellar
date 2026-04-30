import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { unauthorized } from "../utils/httpError.js";

export function createSessionToken(user) {
  return jwt.sign(
    {
      walletAddress: user.walletAddress,
    },
    env.jwtSecret,
    {
      expiresIn: env.jwtExpiresIn,
      subject: user.id,
    },
  );
}

export function verifySessionToken(token) {
  try {
    const payload = jwt.verify(token, env.jwtSecret);

    return {
      userId: payload.sub,
      walletAddress: payload.walletAddress,
    };
  } catch {
    throw unauthorized("Invalid or expired session");
  }
}
