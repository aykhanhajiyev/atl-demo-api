import mysql from "mysql2/promise";

// Reuse connection across cold starts in dev/prod
let pool = globalThis.__db_pool;
export async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5
    });
    globalThis.__db_pool = pool;
  }
  return pool;
}
