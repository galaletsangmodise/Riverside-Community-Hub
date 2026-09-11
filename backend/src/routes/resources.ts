import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// GET /resources — public, anyone can browse
router.get('/', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('resources').select('*').order('name');
  if (error) return res.status(400).json({ error: error.message });
  res.json({ resources: data });
});

// POST /resources — staff/admin only, manage inventory
router.post('/', requireAuth, requireRole(['staff', 'admin']), async (req, res) => {
  const { name, type, capacity, description } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'name and type are required' });

  const { data, error } = await supabaseAdmin
    .from('resources')
    .insert({ name, type, capacity: capacity ?? null, description })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ resource: data });
});

export default router;