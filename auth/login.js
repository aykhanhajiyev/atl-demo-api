import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getPool } from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const { email, password } = req.body || {};
  const pool = await getPool();
  const [rows] = await pool.query(
    "SELECT id, email, password_hash, name FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password || "", user.password_hash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
