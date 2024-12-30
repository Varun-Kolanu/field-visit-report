import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/axiosInstance';

const UserContext = createContext(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get("/auth/me", {
            "headers": { "Authorization": `Bearer ${token}` },
          });
          if (res && res.data) {
            setUser(res.data);
          }
          else {
            localStorage.removeItem("token")
            setUser({})
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          localStorage.removeItem("token");
          setUser({});
        }
      } else {
        setUser({});
      }
    };
    fetchUser()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
