export default function handler(_req, res) {
  res.status(200).json({ ok: true, routes: ['/api/auth/register','/api/auth/login','/api/me'] });
}