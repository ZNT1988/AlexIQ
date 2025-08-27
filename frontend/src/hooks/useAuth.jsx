import { useState, useEffect, useContext, createContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // 🚀 DEMO MODE: Bypass auth temporarily 
      // TODO: Remove this when backend auth is implemented
      const demoUser = {
        id: 'demo-user',
        email: 'demo@alexiq.site', 
        name: 'Demo User',
        role: 'user'
      };
      
      setUser(demoUser);
      setLoading(false);
      
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    // 🚀 DEMO MODE: Simulate login success
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoUser = {
        id: 'demo-user',
        email: email,
        name: 'Demo User',
        role: 'user'
      };
      
      setUser(demoUser);
      localStorage.setItem('auth_token', 'demo-token');
      setLoading(false);
      return { success: true, user: demoUser };
      
    } catch (error) {
      console.error('Login failed:', error);
      setLoading(false);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const value = {
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};