import { verifySessionToken } from "../services/sessionService.js";

export function optionalWalletAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme === "Bearer" && token) {
    req.auth = verifySessionToken(token);
  }

  next();
}
