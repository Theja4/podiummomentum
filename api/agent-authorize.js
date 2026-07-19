/**
 * Vercel Serverless Function — Bland AI session token minter.
 *
 * Creates a single-use session token for the Bland Web Agent SDK.
 * The API key stays server-side (env: BLAND_API_KEY) and is never
 * exposed to the browser.
 *
 * POST /api/agent-authorize  { "agentId": "..." }
 * → { "token": "..." }
 */
import Bland from '@blandsdk/client';

const bland = new Bland({
  admin: {
    apiKey: process.env.BLAND_API_KEY,
    endpoint: 'https://api.bland.ai',
  },
  webchat: {},
});

export default async function handler(req, res) {
  // CORS headers for local dev + production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agentId } = req.body || {};

  if (!agentId) {
    return res.status(400).json({ error: 'agentId is required' });
  }

  if (!process.env.BLAND_API_KEY) {
    return res.status(500).json({ error: 'BLAND_API_KEY not configured' });
  }

  try {
    const admin = await bland.AdminClient();
    const session = await admin.agents.authorize({ agentId });
    return res.status(200).json({ token: session.token });
  } catch (err) {
    console.error('Bland session creation failed:', err);
    return res.status(502).json({ error: 'Failed to create agent session' });
  }
}
