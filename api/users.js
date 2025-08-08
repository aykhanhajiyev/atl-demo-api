import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "users.txt");

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const file = await fs.readFile(filePath, "utf8");
    const users = JSON.parse(file);

    // Strip passwords before returning
    const safeUsers = users.map(({ password, ...u }) => u);

    res.status(200).json(safeUsers);
  } catch (e) {
    if (e.code === "ENOENT") {
      // No file yet
      return res.status(200).json([]);
    }
    console.error("Error reading users.txt", e);
    res.status(500).json({ error: "Could not read users" });
  }
}
