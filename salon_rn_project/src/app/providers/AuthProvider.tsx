import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../services/supabase';
import { AuthService } from '../../services/auth.service';
import { UserRole, AuthState } from '../../types/auth.types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (email: string, password: string, role: UserRole, salonName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasPermission: (permission: string) => boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    salonId: null,
    loading: true,
    authenticated: false,
  });

  // Initialize auth state
  useEffect(() => {
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (session) {
          const role = AuthService.getUserRole(session);
          const salonId = AuthService.getSalonId(session);

          setState({
            user: session.user,
            role,
            salonId,
            loading: false,
            authenticated: true,
          });
        } else {
          setState({
            user: null,
            role: null,
            salonId: null,
            loading: false,
            authenticated: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const initializeAuth = async () => {
    try {
      const session = await AuthService.getSession();
      if (session) {
        const role = AuthService.getUserRole(session);
        const salonId = AuthService.getSalonId(session);

        setState({
          user: session.user,
          role,
          salonId,
          loading: false,
          authenticated: true,
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const login = async (email: string, password: string, role?: UserRole) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const session = await AuthService.signIn({ email, password, role });
      // The auth state change listener will handle updating the state
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const register = async (email: string, password: string, role: UserRole, salonName?: string) => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      await AuthService.signUp({ email, password, role, salonName });
      // For email confirmation, the user will need to verify first
      setState(prev => ({ ...prev, loading: false }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      await AuthService.signOut();
      // The auth state change listener will handle updating the state
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    await AuthService.resetPassword(email);
  };

  const hasPermission = (permission: string): boolean => {
    if (!state.role) return false;

    // Simple role-based permission check
    switch (state.role) {
      case 'SUPER_ADMIN':
        return true;
      case 'OWNER':
        return !['system.config'].includes(permission);
      case 'MANAGER':
        return ['staff.view', 'booking.manage', 'reports.view', 'profile.edit'].includes(permission);
      case 'STAFF':
        return ['booking.create', 'profile.edit', 'booking.view'].includes(permission);
      case 'VENDOR':
        return ['inventory.manage', 'profile.edit', 'inventory.view'].includes(permission);
      case 'CUSTOMER':
        return ['booking.create', 'profile.edit', 'booking.view'].includes(permission);
      default:
        return false;
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.refreshSession();
      if (session) {
        const role = AuthService.getUserRole(session);
        const salonId = AuthService.getSalonId(session);

        setState({
          user: session.user,
          role,
          salonId,
          loading: false,
          authenticated: true,
        });
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    resetPassword,
    hasPermission,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};