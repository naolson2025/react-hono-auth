import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from './use-auth-hook';

interface User {
  id: string;
  email: string;
  // Add other non-sensitive fields as needed
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>; // Returns true on success
  logout: () => Promise<void>;
  serverErrors: string[];
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to check session validity on initial load/refresh
  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include', // ESSENTIAL: Sends the authToken cookie
      });

      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Handle non-OK responses (e.g., 401 Unauthorized)
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Run checkAuthStatus on initial mount
  useEffect(() => {
    checkAuthStatus();
  }, []); // Empty dependency array ensures it runs only once on mount

  // Login function
  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // ESSENTIAL: Allows receiving Set-Cookie header
      });

      if (response.ok) {
        const loginData = await response.json();
        setUser(loginData.user);
        setIsAuthenticated(true);
        setIsLoading(false);
        return true;
      } else {
        const error = await response.json();
        console.error('Login failed:', response.statusText);
        setIsLoading(false);
        setServerErrors(error.errors || ['Login failed']);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false; // Indicate failure
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include', // ESSENTIAL: Sends cookie for backend (though backend just clears)
      });

      if (response.ok) {
         // Clear local state
         setUser(null);
         setIsAuthenticated(false);
      } else {
        console.error('Logout failed:', response.statusText);
        // Optionally handle logout failure on the client
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide the context value
  const value = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    serverErrors,
    email,
    setEmail,
    password,
    setPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};