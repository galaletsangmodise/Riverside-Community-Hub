import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();


router.post('/complete-signup', async (req, res) => {
  const { userId, fullName } = req.body;

  if (!userId || !fullName) {
    return res.status(400).json({ error: 'userId and fullName are required' });
  }

  // verify this is a real, existing auth user — prevents random IDs being submitted
  const { data: userCheck, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userError || !userCheck.user) {
    return res.status(400).json({ error: 'Invalid user' });
  }

  const { data: profile, error: insertError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      full_name: fullName,
      role: 'member',
      membership_tier: 'free',
    })
    .select()
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return res.status(200).json({ message: 'Profile already exists' });
    }
    return res.status(400).json({ error: insertError.message });
  }

  res.status(201).json({ profile });
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;