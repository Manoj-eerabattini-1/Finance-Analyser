import { useEffect, useState, useCallback } from 'react';
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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem(TOKEN_KEY),
    isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
    isLoading: false,
    error: null,
  });

  // Fetch user profile on mount if token exists
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && !authState.user) {
      fetchProfile();
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      const user: User = {
        id: data.data.userId,
        name: data.data.name,
        email: data.data.email,
        createdAt: data.data.createdAt || new Date().toISOString(),
      };

      setAuthState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
      }));
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch profile';
      console.error('Error fetching profile:', errorMsg);
      setAuthState(prev => ({
        ...prev,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMsg,
      }));
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        const token = data.data.token;
        const user: User = {
          id: data.data.userId,
          name: data.data.name,
          email: data.data.email,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Registration failed';
        console.error('Registration error:', errorMsg);
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
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        const token = data.data.token;
        const user: User = {
          id: data.data.userId,
          name: data.data.name,
          email: data.data.email,
          createdAt: new Date().toISOString(),
        };

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setAuthState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Login failed';
        console.error('Login error:', errorMsg);
        setAuthState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<User, 'name' | 'email'>>): Promise<{ success: boolean; error?: string }> => {
      try {
        const token = authState.token;
        if (!token) {
          throw new Error('User not authenticated');
        }

        // Note: Backend may need an update profile endpoint
        // For now, just update local state
        const updatedUser = { ...authState.user, ...updates } as User;
        setAuthState(prev => ({ ...prev, user: updatedUser }));
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

        return { success: true };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Profile update failed';
        console.error('Profile update error:', errorMsg);
        return { success: false, error: errorMsg };
      }
    },
    [authState.token, authState.user]
  );

  return {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    register,
    login,
    logout,
    updateProfile,
  };
}
