import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';


type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session'];
type User = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];

type UserRole = 'member' | 'staff' | 'admin';

interface AuthContextType {
session: Session | null;
user: User | null;
role: UserRole | null;
loading: boolean;
signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
const [session, setSession] = useState<Session | null>(null);
const [user, setUser] = useState<User | null>(null);
const [role, setRole] = useState<UserRole | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
supabase.auth.getSession().then(({ data: { session } }) => {
setSession(session);
const nextUser = session?.user ?? null;
setUser(nextUser);
const userRole = nextUser?.user_metadata?.role;
setRole(userRole === 'member' || userRole === 'staff' || userRole === 'admin' ? userRole : null);
setLoading(false);
});

const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
setSession(session);
const nextUser = session?.user ?? null;
setUser(nextUser);
const userRole = nextUser?.user_metadata?.role;
setRole(userRole === 'member' || userRole === 'staff' || userRole === 'admin' ? userRole : null);
});

return () => subscription.unsubscribe();
}, []);

const signOut = async () => {
await supabase.auth.signOut();
};

return (
<AuthContext.Provider value={{ session, user, role, loading, signOut }}>
{children}
</AuthContext.Provider>
);
};

export const useAuth = () => {
const context = useContext(AuthContext);
if (!context) throw new Error('useAuth must be used within AuthProvider');
return context;
};