import fs from "fs/promises";
import path from "path";
import jwt from "jsonwebtoken";

const filePath = path.join(process.cwd(), "users.txt");

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

  let users = [];
  try {
    const file = await fs.readFile(filePath, "utf8");
    users = JSON.parse(file);
  } catch {
    return res.status(404).json({ error: "No users" });
  }

  const user = users.find(u => u.id === claims.sub);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (req.method === "GET") {
    return res.json({ id: user.id, email: user.email, name: user.name });
  }

  if (req.method === "PUT") {
    const { name, password } = req.body || {};
    if (name) user.name = name;
    if (password) user.password = password;
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));
    return res.json({ id: user.id, email: user.email, name: user.name });
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
