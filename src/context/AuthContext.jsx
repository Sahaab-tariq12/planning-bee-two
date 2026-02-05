import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Initial auth state
const initialAuthState = {
  user: null,
  role: null, // 'advisor' or 'admin'
  isAuthenticated: false,
  isLoading: true
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialAuthState);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('planning_bee_auth');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        setAuthState({
          ...initialAuthState,
          ...parsedAuth,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to parse auth state:', error);
        setAuthState({ ...initialAuthState, isLoading: false });
      }
    } else {
      setAuthState({ ...initialAuthState, isLoading: false });
    }
  }, []);

  // Save auth state to localStorage whenever it changes
  useEffect(() => {
    if (!authState.isLoading) {
      localStorage.setItem('planning_bee_auth', JSON.stringify({
        user: authState.user,
        role: authState.role,
        isAuthenticated: authState.isAuthenticated
      }));
    }
  }, [authState]);

  // Login function - will be replaced with Firebase
  const login = async (email, password, role) => {
    // Simulate login process
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          id: '123',
          name: 'John Doe',
          email: email,
          role: role
        };
        
        setAuthState({
          user: userData,
          role: role,
          isAuthenticated: true,
          isLoading: false
        });
        
        resolve(userData);
      }, 1000);
    });
  };

  // Signup function - will be replaced with Firebase
  const signup = async (name, email, password, role) => {
    // Simulate signup process
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = {
          id: '123',
          name: name,
          email: email,
          role: role
        };
        
        setAuthState({
          user: userData,
          role: role,
          isAuthenticated: true,
          isLoading: false
        });
        
        resolve(userData);
      }, 1000);
    });
  };

  // Logout function
  const logout = () => {
    setAuthState({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem('planning_bee_auth');
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    return authState.role === requiredRole;
  };

  // Check if user is admin
  const isAdmin = () => {
    return authState.role === 'admin';
  };

  // Check if user is advisor
  const isAdvisor = () => {
    return authState.role === 'advisor';
  };

  const value = {
    ...authState,
    login,
    signup,
    logout,
    hasRole,
    isAdmin,
    isAdvisor
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
