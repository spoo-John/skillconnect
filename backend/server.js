const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT} ✅`))