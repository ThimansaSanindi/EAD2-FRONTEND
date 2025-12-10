import React, { createContext, useState, useEffect } from 'react';
import { userAPI } from '../services/api';

export const AuthContext = createContext({
  user: null,
  setUser: () => {},
  logout: () => {}
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const raw = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (!raw || !token) return; // nothing to restore

        // Quick JWT expiry check (if token is a JWT). If expired, clear it.
        const isJwtExpired = (t) => {
          try {
            const parts = t.split('.');
            if (parts.length < 2) return false; // not a JWT, assume valid
            const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            if (payload.exp && typeof payload.exp === 'number') {
              return Date.now() >= payload.exp * 1000;
            }
            return false;
          } catch (e) {
            return false;
          }
        };

        if (isJwtExpired(token)) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          return;
        }

        const parsed = JSON.parse(raw);

        // Immediately restore the stored user so the UI stays responsive.
        setUser(parsed);

        // Verify the user still exists by pinging the user service asynchronously.
        // If verification succeeds, update the stored user. If it fails, clear
        // the stored session to avoid showing a logged-in UI when the backend
        // has restarted or the session is no longer valid.
        (async () => {
          try {
            if (parsed && parsed.id) {
              const serverUser = await userAPI.getUserById(parsed.id);
              if (serverUser && serverUser.id) {
                setUser(serverUser);
                try { localStorage.setItem('user', JSON.stringify(serverUser)); } catch (e) {}
              }
            }
          } catch (err) {
            // Backend verification failed; clear stored auth so the UI requires
            // the user to re-authenticate. This prevents stale sessions after
            // server restarts.
            try { localStorage.removeItem('user'); localStorage.removeItem('token'); } catch (e) {}
            setUser(null);
            console.warn('User verification failed; cleared local session.', err);
          }
        })();
      } catch (e) {
        // ignore malformed storage
      }
    };
    loadFromStorage();
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
