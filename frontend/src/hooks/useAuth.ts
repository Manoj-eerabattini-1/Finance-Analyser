import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/types/finance';

const API_BASE_URL = 'http://localhost:5000/api';
const TOKEN_KEY = 'token';
const USER_KEY = 'user';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const navigate = useNavigate();

  const [authState, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      user,
      token,
      isAuthenticated: !!token,
      isLoading: false,
      error: null,
    };
  });

  // Verify token is still valid on mount
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchProfile();
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Session expired');
      }

      const data = await response.json();
      const user: User = {
        id: data.data.userId,
        name: data.data.name,
        email: data.data.email,
        createdAt: data.data.createdAt || new Date().toISOString(),
      };

      setAuthState(prev => ({ ...prev, user, isAuthenticated: true }));
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Token invalid — clear everything and redirect
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Registration failed');

        const token = data.data.token;
        const user: User = {
          id: data.data.userId,
          name: data.data.name,
          email: data.data.email,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setAuthState({ user, token, isAuthenticated: true, isLoading: false, error: null });
        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Registration failed';
        setAuthState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Login failed');

        const token = data.data.token;
        const user: User = {
          id: data.data.userId,
          name: data.data.name,
          email: data.data.email,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setAuthState({ user, token, isAuthenticated: true, isLoading: false, error: null });
        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Login failed';
        setAuthState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  const logout = useCallback(() => {
    // Clear storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('currency');
    // Reset state
    setAuthState({ user: null, token: null, isAuthenticated: false, isLoading: false, error: null });
    // Force navigation — this is what was missing
    navigate('/login', { replace: true });
  }, [navigate]);

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    register,
    login,
    logout,
  };
}