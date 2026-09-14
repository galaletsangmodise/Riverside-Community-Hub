import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Waves } from 'lucide-react';

export function Navbar() {
  const { session, role, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <nav className="bg-white border-b border-river-mid/15 px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-river-deep">
          <Waves className="w-5 h-5" />
          Riverside
        </Link>

        <div className="flex items-center gap-5 text-sm">
          <Link to="/book" className="text-gray-600 hover:text-river-deep">Book</Link>
          <Link to="/donate" className="text-gray-600 hover:text-river-deep">Donate</Link>

          {(role === 'staff' || role === 'admin') && (
            <Link to="/admin" className="text-river-deep font-medium">Dashboard</Link>
          )}

          {session ? (
            <button onClick={handleSignOut} className="text-gray-600 hover:text-river-deep">
              Log out
            </button>
          ) : (
            <Link to="/login" className="bg-river-deep text-white px-4 py-1.5 rounded-lg">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}