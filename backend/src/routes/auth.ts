import { Router } from 'express';
import { supabaseAnon, supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();


router.post('/signup', async (req, res) => {
  const { fullName, contactInfo } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }
  if (!fullName) {
    return res.status(400).json({ error: 'fullName is required' });
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await supabaseAnon.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

 
  const { data: profile, error: insertError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: data.user.id,
      full_name: fullName,
      contact_info: contactInfo ?? null,
      role: 'member',
      membership_tier: 'free',
    })
    .select()
    .single();

  if (insertError) {
    
    return res.status(409).json({ error: insertError.message });
  }

  res.status(201).json({ profile });
});


router.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

export default router;