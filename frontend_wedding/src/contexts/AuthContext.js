import React, { createContext, useState } from 'react';


// NE KORISTI SE UOPCE

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [userUsername, setUserUsername] = useState(null);

  const login = (role, username) => {
    setUserRole(role);
    setUserUsername(username);
  };

  const logout = () => {
    setUserRole(null);
    setUserUsername(null);
  };

  return (
    <AuthContext.Provider value={{ userRole, userUsername, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
