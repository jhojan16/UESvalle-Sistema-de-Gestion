import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthError, User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: string | null;
  isAdmin: boolean;
  refreshRole: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, nombre: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isAdminRole(role: string | null) {
  const normalizedRole = role?.toLowerCase().trim();
  return normalizedRole === 'administrador' || normalizedRole === 'admin';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRoleByUserId = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('rol')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error leyendo rol de perfil:', error.message);
      return null;
    }

    return data?.rol ?? null;
  }, []);

  const refreshRole = useCallback(async () => {
    if (!user?.id) {
      setRole(null);
      return;
    }

    const fetchedRole = await fetchRoleByUserId(user.id);
    setRole(fetchedRole);
  }, [fetchRoleByUserId, user?.id]);

  useEffect(() => {
    let isMounted = true;

    const applySession = async (nextSession: Session | null) => {
      if (!isMounted) return;

      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      const fetchedRole = await fetchRoleByUserId(nextUser.id);
      if (!isMounted) return;
      setRole(fetchedRole);
      setLoading(false);
    };

    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        void applySession(nextSession);
      }
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      void applySession(initialSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRoleByUserId]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      navigate('/dashboard');
    } else {
      setLoading(false);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, nombre: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          nombre
        }
      }
    });
    if (!error) {
      navigate('/dashboard');
    } else {
      setLoading(false);
    }
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        isAdmin: isAdminRole(role),
        refreshRole,
        signIn,
        signUp,
        signOut,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
