import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const persistAuthState = (nextToken, nextUser) => {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    const refreshUser = async () => {
      setToken(savedToken);

      try {
        const { data } = await axiosInstance.get('/auth/me');
        const freshUser = data?.user;

        if (!freshUser || !freshUser.id || !freshUser.email || !freshUser.role) {
          throw new Error('Invalid user payload');
        }

        persistAuthState(savedToken, freshUser);
      } catch (error) {
        clearAuthState();
        navigate('/login', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    refreshUser();
  }, [navigate]);

  const login = (nextToken, nextUser) => {
    if (!nextToken || !nextUser) {
      clearAuthState();
      return;
    }

    persistAuthState(nextToken, nextUser);
  };

  const logout = () => {
    clearAuthState();
    navigate('/login', { replace: true });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      login,
      logout,
      isLoading,
      isAuthenticated: Boolean(token && user)
    }),
    [isLoading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
