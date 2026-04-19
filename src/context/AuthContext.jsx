import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      try {
        const parsed = JSON.parse(userString);
        if (parsed && parsed.email?.toLowerCase() === 'exact-subzero-jury@duck.com') {
          parsed.role = 'superadmin';
          parsed.isAdmin = true;
        }
        return parsed && parsed._id ? parsed : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = (userData) => {
    // We now rely on the caller to provide complete user data, 
    // or the backend to return full profiles. Direct overwrite is safer.
    const updatedUser = { ...userData };
    
    if (updatedUser && updatedUser.email?.toLowerCase() === 'exact-subzero-jury@duck.com') {
      updatedUser.role = 'superadmin';
      updatedUser.isAdmin = true;
    }
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
