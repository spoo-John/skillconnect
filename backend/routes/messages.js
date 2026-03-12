const express = require('express')
const router = express.Router()
const supabase = require('../supabase')
const authMiddleware = require('../middleware/auth')

// GET all messages in a conversation (protected)
router.get('/:conversationId', authMiddleware, async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:sender_id(name), receiver:receiver_id(name)')
    .eq('conversation_id', req.params.conversationId)
    .order('timestamp', { ascending: true })

  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// SEND a message (protected)
router.post('/', authMiddleware, async (req, res) => {
  const { receiver_id, text, conversation_id } = req.body

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id,
      sender_id: req.user.id,
      receiver_id,
      text
    })
    .select()
    .single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json(data)
})

module.exports = router