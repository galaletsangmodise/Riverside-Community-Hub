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
  const [loadError, setLoadError] = useState('');

  async function loadResources() {
    setLoading(true);
    setLoadError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/resources`);
      if (!res.ok) throw new Error('Failed to load resources');
      const data = await res.json();
      setResources(data.resources ?? []);
    } catch {
      setLoadError('Could not load facilities right now. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResources();
  }, []);

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');

    if (!session) {
      setMessage('You must be logged in to book.');
      return;
    }

    try {
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
    } catch {
      setMessage('Could not reach the server. Check your connection and try again.');
    }
  }

  if (loading) return <div className="p-8">Loading resources...</div>;

  if (loadError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-3">{loadError}</p>
        <button onClick={loadResources} className="bg-river-mid text-white rounded px-4 py-2">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-sky-50 to-river-mist">
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-2xl font-semibold mb-6">Book a facility or equipment</h1>

        {resources.length === 0 ? (
          <p className="text-gray-500 mb-8">No facilities are available to book right now.</p>
        ) : (
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
        )}

        <form onSubmit={handleBook} className="space-y-4 border-t pt-6">
          <h2 className="font-medium">Request a booking</h2>

          <label htmlFor="resource-select" className="block text-sm font-medium text-gray-700">
            Resource
          </label>
          <select
            id="resource-select"
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
            <div>
              <label htmlFor="start-time" className="block text-sm font-medium text-gray-700 mb-1">
                Start time
              </label>
              <input
                id="start-time"
                type="datetime-local"
                className="border rounded px-3 py-2 w-full"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="end-time" className="block text-sm font-medium text-gray-700 mb-1">
                End time
              </label>
              <input
                id="end-time"
                type="datetime-local"
                className="border rounded px-3 py-2 w-full"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {message && <p className="text-sm" role="status">{message}</p>}
          <button type="submit" className="bg-river-mid text-white rounded px-4 py-2">
            Request booking
          </button>
        </form>
      </div>
    </div>
  );
}