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

export function AdminDashboard() {
  const { session } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBookings() {
    if (!session) return;
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    const data = await res.json();
    setBookings(data.bookings ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, [session]);

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    if (!session) return;
    await fetch(`${import.meta.env.VITE_API_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ status }),
    });
    loadBookings();
  }

  if (loading) return <div className="p-8">Loading bookings...</div>;

  const pending = bookings.filter((b) => b.status === 'pending');

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Pending bookings</h1>
      {pending.length === 0 && <p className="text-gray-500">No pending bookings.</p>}
      <div className="space-y-3">
        {pending.map((b) => (
          <div key={b.id} className="border rounded-lg p-4 flex justify-between items-center">
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
                className="bg-green-600 text-white rounded px-3 py-1 text-sm"
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
  );
}