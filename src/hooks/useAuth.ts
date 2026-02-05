import { useLocalStorage } from './useLocalStorage';
import { User } from '@/types/finance';
import { useCallback } from 'react';

const USER_KEY = 'finance-planner-user';
const AUTH_KEY = 'finance-planner-auth';

// Simple hash function for demo purposes (NOT for production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
}

interface StoredUser extends User {
  passwordHash: string;
}

export function useAuth() {
  const [users, setUsers] = useLocalStorage<StoredUser[]>('finance-planner-users', []);
  const [authState, setAuthState] = useLocalStorage<AuthState>(AUTH_KEY, {
    isAuthenticated: false,
    token: null,
  });
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>(USER_KEY, null);

  const register = useCallback((email: string, password: string, name: string): { success: boolean; error?: string } => {
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name,
      passwordHash: simpleHash(password),
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    
    // Auto-login after registration
    const token = `jwt_${simpleHash(newUser.id + Date.now())}`;
    const { passwordHash, ...userWithoutPassword } = newUser;
    
    setCurrentUser(userWithoutPassword);
    setAuthState({ isAuthenticated: true, token });

    return { success: true };
  }, [users, setUsers, setCurrentUser, setAuthState]);

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const user = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.passwordHash === simpleHash(password)
    );

    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const token = `jwt_${simpleHash(user.id + Date.now())}`;
    const { passwordHash, ...userWithoutPassword } = user;
    
    setCurrentUser(userWithoutPassword);
    setAuthState({ isAuthenticated: true, token });

    return { success: true };
  }, [users, setCurrentUser, setAuthState]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setAuthState({ isAuthenticated: false, token: null });
  }, [setCurrentUser, setAuthState]);

  const updateProfile = useCallback((updates: Partial<Pick<User, 'name' | 'email'>>) => {
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);

    setUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id ? { ...u, ...updates } : u
      )
    );
  }, [currentUser, setCurrentUser, setUsers]);

  return {
    user: currentUser,
    isAuthenticated: authState.isAuthenticated,
    token: authState.token,
    register,
    login,
    logout,
    updateProfile,
  };
}
