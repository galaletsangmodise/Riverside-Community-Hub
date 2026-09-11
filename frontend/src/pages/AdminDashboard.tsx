import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  resources: { name: string; type: string };
  profiles: { full_name: string };
}

interface Member {
  id: string;
  full_name: string;
  contact_info: string | null;
  role: string;
  membership_tier: string;
  joined_at: string;
}

interface Stats {
  bookingsThisMonth: number;
  totalDonations: number;
  activeMembers: number;
}

export function AdminDashboard() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  function authHeaders() {
    return { Authorization: `Bearer ${session?.access_token}` };
  }

  async function loadAll() {
    if (!session) return;
    setLoading(true);

    const [bookingsRes, membersRes, statsRes] = await Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/bookings`, { headers: authHeaders() }),
      fetch(`${import.meta.env.VITE_API_URL}/members?search=${encodeURIComponent(search)}`, { headers: authHeaders() }),
      fetch(`${import.meta.env.VITE_API_URL}/members/stats`, { headers: authHeaders() }),
    ]);

    const bookingsData = await bookingsRes.json();
    const membersData = await membersRes.json();
    const statsData = await statsRes.json();

    setBookings(bookingsData.bookings ?? []);
    setMembers(membersData.members ?? []);
    setStats(statsData);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
  }, [session]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (session) loadAll();
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    if (!session) return;
    await fetch(`${import.meta.env.VITE_API_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status }),
    });
    loadAll();
  }

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  const pending = bookings.filter((b) => b.status === 'pending');

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-river-mid/20 rounded-lg p-4">
              <p className="text-2xl font-semibold">{stats.bookingsThisMonth}</p>
              <p className="text-sm text-gray-500">Bookings this month</p>
            </div>
            <div className="border border-river-mid/20 rounded-lg p-4">
              <p className="text-2xl font-semibold">R{stats.totalDonations.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total donations</p>
            </div>
            <div className="border border-river-mid/20 rounded-lg p-4">
              <p className="text-2xl font-semibold">{stats.activeMembers}</p>
              <p className="text-sm text-gray-500">Active members</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Pending bookings</h2>
        {pending.length === 0 && <p className="text-gray-500 text-sm">No pending bookings.</p>}
        <div className="space-y-3">
          {pending.map((b) => (
            <div key={b.id} className="border border-river-mid/20 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{b.resources.name}</p>
                <p className="text-sm text-gray-600">{b.profiles.full_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(b.start_time).toLocaleString()} → {new Date(b.end_time).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(b.id, 'approved')}
                  className="bg-river-mid text-white rounded px-3 py-1 text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => updateStatus(b.id, 'rejected')}
                  className="bg-red-600 text-white rounded px-3 py-1 text-sm"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Member directory</h2>
        <input
          type="text"
          placeholder="Search by name..."
          className="w-full border rounded px-3 py-2 mb-4"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="border border-river-mid/20 rounded-lger-mid/20 rounded-lg p-3 flex justify-between items-center text-sm">
              <div>
                <p className="font-medium">{m.full_name}</p>
                <p className="text-gray-500">{m.contact_info ?? 'No contact info'}</p>
              </div>
              <div className="text-right">
                <p className="uppercase text-xs bg-gray-100 inline-block px-2 py-1 rounded">{m.role}</p>
                <p className="text-gray-500 mt-1">{m.membership_tier}</p>
              </div>
            </div>
          ))}
          {members.length === 0 && <p className="text-gray-500 text-sm">No members found.</p>}
        </div>
      </div>
    </div>
  );
}