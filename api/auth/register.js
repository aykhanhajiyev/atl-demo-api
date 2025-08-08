import fs from "fs/promises";
import path from "path";

const filePath = path.join("/tmp", "users.txt"); // writeable folder

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });

  const { email, password, name = "" } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  let users = [];
  try {
    const file = await fs.readFile(filePath, "utf8");
    users = JSON.parse(file);
  } catch {
    users = [];
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const newUser = { id: Date.now(), email, password, name };
  users.push(newUser);
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));

  res.status(201).json({ id: newUser.id, email: newUser.email, name: newUser.name });
}
