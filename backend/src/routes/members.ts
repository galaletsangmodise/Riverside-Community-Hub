import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';

const router = Router();

const MEMBERSHIP_DURATION_DAYS = 365; 
const EXPIRY_WARNING_DAYS = 30;

function getMembershipStatus(joinedAt: string): 'active' | 'expiring_soon' | 'expired' {
  const joined = new Date(joinedAt);
  const expiryDate = new Date(joined);
  expiryDate.setDate(expiryDate.getDate() + MEMBERSHIP_DURATION_DAYS);

  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) return 'expired';
  if (daysUntilExpiry <= EXPIRY_WARNING_DAYS) return 'expiring_soon';
  return 'active';
}


router.get('/', requireAuth, requireRole(['staff', 'admin']), async (req, res) => {
  const search = (req.query.search as string) ?? '';
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('profiles')
    .select('id, full_name, contact_info, role, membership_tier, joined_at', { count: 'exact' })
    .order('joined_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.ilike('full_name', `%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) return res.status(400).json({ error: error.message });

  const membersWithStatus = (data ?? []).map((m) => ({
    ...m,
    membership_status: getMembershipStatus(m.joined_at),
  }));

  res.json({ members: membersWithStatus, total: count, page, pageSize });
});


router.get('/stats', requireAuth, requireRole(['staff', 'admin']), async (_req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [bookingsThisMonth, totalDonations, activeMembers] = await Promise.all([
    supabaseAdmin
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString()),
    supabaseAdmin.from('donations').select('amount'),
    supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  const totalDonationAmount = (totalDonations.data ?? []).reduce(
    (sum, d) => sum + Number(d.amount), 0
  );

  res.json({
    bookingsThisMonth: bookingsThisMonth.count ?? 0,
    totalDonations: totalDonationAmount,
    activeMembers: activeMembers.count ?? 0,
  });
});

export default router;