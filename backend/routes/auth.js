const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../supabase')

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password, role, skills, bio, portfolio_link } = req.body

  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) return res.status(400).json({ error: 'Email already registered' })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Save user
    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword, role, skills, bio, portfolio_link })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) return res.status(400).json({ error: 'Invalid email or password' })

    // Check password
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' })

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router