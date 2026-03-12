const express = require('express')
const router = express.Router()
const supabase = require('../supabase')

// GET all professionals (public)
router.get('/', async (req, res) => {
  const { skill } = req.query

  let query = supabase
    .from('users')
    .select('id, name, bio, skills, portfolio_link, role, created_at')
    .eq('role', 'professional')

  if (skill) query = query.contains('skills', [skill])

  const { data, error } = await query
  if (error) return res.status(500).json({ error: error.message })

  res.json(data)
})

// GET single professional profile (public)
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, bio, skills, portfolio_link, role, created_at')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'User not found' })
  res.json(data)
})

module.exports = router