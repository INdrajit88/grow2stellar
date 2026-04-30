import { getUserById, updateUserProfile } from "../services/userService.js";

export async function getMe(req, res) {
  const user = await getUserById(req.auth.userId);
  res.json({ user });
}

export async function updateMe(req, res) {
  const user = await updateUserProfile(req.auth.userId, req.body);
  res.json({ user });
}
