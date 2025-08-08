import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getPool } from "./_db.js";

function getToken(req) {
  const h = req.headers.authorization || "";
  return h.startsWith("Bearer ") ? h.slice(7) : null;
}

export default async function handler(req, res) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  let claims;
  try {
    claims = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid/expired token" });
  }

  const pool = await getPool();

  if (req.method === "GET") {
    const [rows] = await pool.query(
      "SELECT id, email, name, created_at FROM users WHERE id = ?",
      [claims.sub]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "Not found" });
    return res.json(user);
  }

  if (req.method === "PUT") {
    const { name, password } = req.body || {};
    if (name != null) {
      await pool.query("UPDATE users SET name = ? WHERE id = ?", [String(name).trim(), claims.sub]);
    }
    if (typeof password === "string" && password.length >= 6) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, claims.sub]);
    }
    const [rows] = await pool.query("SELECT id, email, name FROM users WHERE id = ?", [claims.sub]);
    return res.json(rows[0]);
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
