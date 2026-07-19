import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import Bland from '@blandsdk/client'

/**
 * Local dev middleware — emulates the Vercel serverless function
 * POST /api/agent-authorize so `npm run dev` works without `vercel dev`.
 * Uses the Bland Admin SDK to mint session tokens (same as production).
 */
function blandApiDevPlugin(env) {
  return {
    name: 'bland-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/agent-authorize', async (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.setHeader('Content-Type', 'application/json')

          const apiKey = env.BLAND_API_KEY || process.env.BLAND_API_KEY
          if (!apiKey) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'BLAND_API_KEY not set in .env' }))
            return
          }

          try {
            const { agentId } = JSON.parse(body)
            if (!agentId) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'agentId is required' }))
              return
            }

            // Use the Bland Admin SDK to create a webchat auth token
            const bland = new Bland({
              admin: {
                apiKey,
                endpoint: 'https://api.bland.ai',
              },
              webchat: {},
            })

            const admin = await bland.AdminClient()
            const session = await admin.agents.authorize({ agentId })

            res.statusCode = 200
            res.end(JSON.stringify({ token: session.token }))
          } catch (err) {
            console.error('Bland dev API error:', err?.message || err)
            res.statusCode = 502
            res.end(JSON.stringify({ error: err?.message || 'Failed to create agent session' }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), blandApiDevPlugin(env)],
    appType: 'spa',
    server: {
      // Visual-QA helpers create and remove temporary HTML files in the project
      // root. Watching them causes a full-page reload that can interrupt route
      // transitions even though the application source has not changed.
      watch: {
        ignored: ['**/qa-*.html'],
      },
    },
  }
})
