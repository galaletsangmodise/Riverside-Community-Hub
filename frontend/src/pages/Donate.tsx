import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Campaign {
  id: string;
  title: string;
  goal_amount: number;
  current_amount: number;
  active: boolean;
}

export function Donate() {
  const { session } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [attachToAccount, setAttachToAccount] = useState(true);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function loadCampaigns() {
    setLoading(true);
    const res = await fetch(`${import.meta.env.VITE_API_URL}/donations/campaigns`);
    const data = await res.json();
    setCampaigns(data.campaigns ?? []);
    if (data.campaigns?.length && !selectedId) setSelectedId(data.campaigns[0].id);
    setLoading(false);
  }

  useEffect(() => {
    loadCampaigns();
  }, []);

  async function handleDonate(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);

    const numericAmount = parseFloat(amount);
    if (!selectedId || !numericAmount || numericAmount <= 0) {
      setMessage('Please select a campaign and enter a valid amount.');
      setSubmitting(false);
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: selectedId,
        amount: numericAmount,
        isRecurringPledge: isRecurring,
        donorId: session && attachToAccount ? session.user.id : null,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json();
      setMessage(body.error ?? 'Donation failed');
      return;
    }

    setMessage('Thank you for your donation!');
    setAmount('');
    loadCampaigns(); 
  }

  if (loading) return <div className="p-8">Loading campaigns...</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-semibold mb-6">Support Riverside</h1>

      <div className="space-y-6 mb-8">
        {campaigns.map((c) => {
          const pct = Math.min(100, Math.round((c.current_amount / c.goal_amount) * 100));
          return (
            <div key={c.id} className="border rounded-lg p-4">
              <h3 className="font-medium mb-1">{c.title}</h3>
              <p className="text-sm text-gray-600 mb-2">
                R{c.current_amount.toLocaleString()} raised of R{c.goal_amount.toLocaleString()} goal
              </p>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{pct}% funded</p>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleDonate} className="space-y-4 border-t pt-6">
        <h2 className="font-medium">Make a donation</h2>
        <select
          className="w-full border rounded px-3 py-2"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          required
        >
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="Amount (R)"
          className="w-full border rounded px-3 py-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
          />
          Adopt a food parcel 
        </label>
        {session && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={attachToAccount}
              onChange={(e) => setAttachToAccount(e.target.checked)}
            />
            Attach this donation to my account
          </label>
        )}
        {message && <p className="text-sm">{message}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
        >
          {submitting ? 'Processing...' : 'Donate'}
        </button>
      </form>
    </div>
  );
}