import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Waves } from 'lucide-react';

export function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Signup failed');
      setLoading(false);
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/complete-signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: data.user.id, fullName }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json();
      setError(body.error ?? 'Failed to create profile');
      return;
    }

    if (data.session) {
      navigate('/');
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-sky-100 to-river-mist px-4">
        <div className="w-full max-w-sm bg-white rounded-xl border border-river-mid/15 shadow-sm p-8 text-center">
          <h1 className="text-xl font-semibold text-river-deep mb-2">Check your email</h1>
          <p className="text-sm text-gray-600">
            We sent a verification link to {email}. Click it, then log in.
          </p>
          <Link to="/login" className="text-river-deep text-sm font-medium block mt-4">Go to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-sky-100 to-river-mist px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-river-mid/15 shadow-sm p-8">
        <div className="w-10 h-10 rounded-lg bg-river-mist flex items-center justify-center mb-4">
          <Waves className="w-5 h-5 text-river-deep" />
        </div>
        <h1 className="text-xl font-semibold text-river-deep mb-1">Join Riverside</h1>
        <p className="text-sm text-gray-500 mb-6">Create your free membership</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-river-mid/40"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-river-mid/40"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-river-mid/40"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-river-deep text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        <p className="text-sm mt-5 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-river-deep font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}