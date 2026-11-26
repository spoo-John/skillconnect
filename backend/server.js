const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Restrict to the deployed frontend(s) when CORS_ORIGIN is set (comma-separated).
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}))
app.use(express.json())

// Routes
app.use('/api/auth',     require('./routes/auth'))
app.use('/api/posts',    require('./routes/posts'))
app.use('/api/users',    require('./routes/users'))
app.use('/api/messages', require('./routes/messages'))

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'SkillConnect API running ✅' })
})

// On Vercel the app runs as a serverless function, so it's exported instead of listening.
// Locally (and on Railway/Render) it starts a normal server.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000
  app.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`))
}

module.exports = app