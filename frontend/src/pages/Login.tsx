import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Waves } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    navigate('/');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-sky-100 to-river-mist px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-river-mid/15 shadow-sm p-8">
        <div className="w-10 h-10 rounded-lg bg-river-mist flex items-center justify-center mb-4">
          <Waves className="w-5 h-5 text-river-deep" />
        </div>
        <h1 className="text-xl font-semibold text-river-deep mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Log in to your Riverside account</p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-river-deep text-white rounded-lg py-2.5 font-medium disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <p className="text-sm mt-5 text-center text-gray-600">
          No account? <Link to="/signup" className="text-river-deep font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
}