import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type UserRole = 'member' | 'staff' | 'admin';

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { session, role, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!session) return <Navigate to="/login" replace />;
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}