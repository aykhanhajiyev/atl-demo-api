import bcrypt from "bcrypt";
import { getPool } from "../_db.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const { email, password, name = "" } = req.body || {};
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: "Valid email and password (>=6) required" });
  }
  try {
    const pool = await getPool();
    const hash = await bcrypt.hash(password, 10);
    const [r] = await pool.query(
      "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)",
      [email.trim(), hash, name.trim()]
    );
    return res.status(201).json({ id: r.insertId, email, name });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Email already exists" });
    console.error(e);
    return res.status(500).json({ error: "Server error" });
  }
}
