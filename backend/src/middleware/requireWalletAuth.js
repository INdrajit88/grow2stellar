import { verifySessionToken } from "../services/sessionService.js";
import { unauthorized } from "../utils/httpError.js";

export function requireWalletAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw unauthorized();
  }

  req.auth = verifySessionToken(token);
  next();
}
