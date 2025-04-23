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
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading initially

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
        // Re-check status or use login response data to update state
        await checkAuthStatus(); // Re-fetch user data after successful login
        // Or if login returns user data:
        // const loginData = await response.json();
        // setUser(loginData.user);
        // setIsAuthenticated(true);
        setIsLoading(false);
        return true; // Indicate success
      } else {
        // Handle login failure (e.g., display error message)
        console.error('Login failed:', response.statusText);
        setIsLoading(false);
        return false; // Indicate failure
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};