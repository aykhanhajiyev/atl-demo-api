import fs from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";

const filePath = path.join(process.cwd(), "users.txt");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  let users = [];
  try {
    const file = await fs.readFile(filePath, "utf8");
    users = JSON.parse(file);
  } catch {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  if (!process.env.JWT_SECRET) return res.status(500).json({ error: "Server misconfigured" });

  const token = jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
}
