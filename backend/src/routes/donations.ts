import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

router.get('/campaigns', async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .eq('active', true)
    .order('title');

  if (error) return res.status(400).json({ error: error.message });
  res.json({ campaigns: data });
});


router.post('/', async (req, res) => {
  const { campaignId, amount, isRecurringPledge, donorId } = req.body;

  if (!campaignId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'campaignId and a positive amount are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('donations')
    .insert({
      campaign_id: campaignId,
      amount,
      is_recurring_pledge: !!isRecurringPledge,
      donor_id: donorId ?? null,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ donation: data });
});


router.get('/', requireAuth, requireRole(['staff', 'admin']), async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await supabaseAdmin
    .from('donations')
    .select('*, campaigns(title), profiles(full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ donations: data, total: count, page, pageSize });
});


router.get('/export', requireAuth, requireRole(['staff', 'admin']), async (_req, res) => {
  const { data, error } = await supabaseAdmin
    .from('donations')
    .select('created_at, amount, is_recurring_pledge, campaigns(title), profiles(full_name)')
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });

  const header = 'Date,Donor,Campaign,Amount,Recurring Pledge\n';
  const rows = (data ?? [])
    .map((d: any) => {
      const donor = d.profiles?.full_name ?? 'Anonymous';
      const campaign = d.campaigns?.title ?? '';
      const date = new Date(d.created_at).toISOString().split('T')[0];
      return `${date},"${donor}","${campaign}",${d.amount},${d.is_recurring_pledge}`;
    })
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="donations.csv"');
  res.send(header + rows);
});

export default router;