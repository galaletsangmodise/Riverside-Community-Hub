import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// POST /bookings — member creates a booking request
router.post('/', requireAuth, async (req, res) => {
  const { resourceId, startTime, endTime } = req.body;

  if (!resourceId || !startTime || !endTime) {
    return res.status(400).json({ error: 'resourceId, startTime, endTime are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .insert({
      resource_id: resourceId,
      member_id: req.user!.id,
      start_time: startTime,
      end_time: endTime,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    // the exclusion constraint from Step 2 (schema.sql) fires here as a
    // Postgres error if the slot overlaps an existing pending/approved booking
    if (error.code === '23P01') {
      return res.status(409).json({ error: 'This resource is already booked for that time' });
    }
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json({ booking: data });
});

// GET /bookings/mine — member sees their own bookings
router.get('/mine', requireAuth, async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from('bookings')
    .select('*, resources(name, type)')
    .eq('member_id', req.user!.id)
    .order('start_time', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ bookings: data });
});

// GET /bookings — staff/admin see ALL bookings (with pagination)
router.get('/', requireAuth, requireRole(['staff', 'admin']), async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabaseAdmin
    .from('bookings')
    .select('*, resources(name, type), profiles(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ bookings: data, total: count, page, pageSize });
});

// PATCH /bookings/:id/status — staff/admin approve or reject
router.patch('/:id/status', requireAuth, requireRole(['staff', 'admin']), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['approved', 'rejected', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of ${validStatuses.join(', ')}` });
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ booking: data });
});

// PATCH /bookings/:id/cancel — member cancels their own pending booking
router.patch('/:id/cancel', requireAuth, async (req, res) => {
  const { data: existing } = await supabaseAdmin
    .from('bookings')
    .select('member_id')
    .eq('id', req.params.id)
    .single();

  if (!existing || existing.member_id !== req.user!.id) {
    return res.status(403).json({ error: 'Not your booking' });
  }

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ booking: data });
});

export default router;