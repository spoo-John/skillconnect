const express = require('express')
const router = express.Router()
const supabase = require('../supabase')
const authMiddleware = require('../middleware/auth')

// GET all open posts (public)
router.get('/', async (req, res) => {
  const { skill, status } = req.query

  let query = supabase.from('posts').select('*, users(name, role)')

  if (skill) query = query.eq('skill_needed', skill)
  if (status) query = query.eq('status', status)
  else query = query.eq('status', 'open')

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })

  res.json(data)
})

// GET single post
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*, users(name, email)')
    .eq('id', req.params.id)
    .single()

  if (error) return res.status(404).json({ error: 'Post not found' })
  res.json(data)
})

// CREATE post (protected)
router.post('/', authMiddleware, async (req, res) => {
  const { title, description, skill_needed, budget, currency, deadline } = req.body

  const { data, error } = await supabase
    .from('posts')
    .insert({
      title, description, skill_needed,
      budget, currency, deadline,
      posted_by: req.user.id
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

// UPDATE post (protected, only owner)
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, skill_needed, budget, deadline, status } = req.body

  const { data, error } = await supabase
    .from('posts')
    .update({ title, description, skill_needed, budget, deadline, status })
    .eq('id', req.params.id)
    .eq('posted_by', req.user.id)
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// DELETE post (protected, only owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', req.params.id)
    .eq('posted_by', req.user.id)

  if (error) return res.status(500).json({ error: error.message })
  res.json({ message: 'Post deleted' })
})

module.exports = router