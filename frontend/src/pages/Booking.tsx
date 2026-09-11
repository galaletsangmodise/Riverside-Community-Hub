import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Resource {
  id: string;
  name: string;
  type: 'room' | 'equipment';
  capacity: number | null;
  description: string;
}

export function Booking() {
  const { session } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/resources`)
      .then((r) => r.json())
      .then((data) => setResources(data.resources ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    if (!session) {
      setMessage('You must be logged in to book.');
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        resourceId: selectedId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      }),
    });

    const body = await res.json();

    if (!res.ok) {
      setMessage(body.error ?? 'Booking failed');
      return;
    }

    setMessage('Booking request submitted — pending staff approval.');
    setSelectedId('');
    setStartTime('');
    setEndTime('');
  }

  if (loading) return <div className="p-8">Loading resources...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Book a facility or equipment</h1>

      <div className="grid gap-4 mb-8">
        {resources.map((r) => (
          <div key={r.id} className="border border-river-mid/20 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{r.name}</h3>
                <p className="text-sm text-gray-600">{r.description}</p>
                {r.capacity && <p className="text-sm text-gray-500">Capacity: {r.capacity}</p>}
              </div>
              <span className="text-xs uppercase bg-gray-100 px-2 py-1 rounded">{r.type}</span>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleBook} className="space-y-4 border-t pt-6">
        <h2 className="font-medium">Request a booking</h2>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          required
        >
          <option value="">Select a resource</option>
          {resources.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="datetime-local"
            className="border rounded px-3 py-2"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
          />
          <input
            type="datetime-local"
            className="border rounded px-3 py-2"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
          />
        </div>
        {message && <p className="text-sm">{message}</p>}
        <button type="submit" className="bg-river-mid text-white rounded px-4 py-2">
          Request booking
        </button>
      </form>
    </div>
  );
}