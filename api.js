import mysql from "mysql2/promise";

// Reuse connection across cold starts in dev/prod
let pool = globalThis.__db_pool;
export async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: "srv975.hstgr.io",
      user: "u267145340_aykhanhajiyev",
      password: "Ayxan6354385**",
      database: "u267145340_atl_demo_api",
      waitForConnections: true,
      connectionLimit: 5
    });
    globalThis.__db_pool = pool;
  }
  return pool;
}
