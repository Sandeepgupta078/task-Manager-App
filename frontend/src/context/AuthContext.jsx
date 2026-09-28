import { createContext, useContext, useEffect, useState } from 'react';
import { fetchMe, loginUser, logoutUser, registerUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // on refresh, ask the backend if the cookie is still valid
  useEffect(() => {
    fetchMe()
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const login = async (credentials) => {
    const res = await loginUser(credentials);
    setUser(res.data.user);
  };

  const register = async (details) => {
    const res = await registerUser(details);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
