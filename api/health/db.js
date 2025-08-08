// api/health/db.js
import { getPool } from '../_db.js';
export default async function handler(_req, res) {
  try {
    const pool = await getPool();
    await pool.query('SELECT 1');
    res.json({ db: 'ok' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ db: 'fail', error: String(e?.code || e?.message || e) });
  }
}