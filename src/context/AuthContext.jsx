import { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedProfile = localStorage.getItem("profile");
      if (storedProfile) {
        try {
          const { user } = JSON.parse(storedProfile);
          setUser(user);
        } catch (err) {
          setUser(null);
          localStorage.removeItem("profile");
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await axios.post(
        "http://localhost:5165/api/Auth/login",
        credentials
      );
      const { user } = res.data;

      localStorage.setItem("profile", JSON.stringify({ user }));
      setUser(user);
      return { user };
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    const res = await axios.post(
      "http://localhost:5165/api/Auth/register",
      userData
    );
    return res.data;
  };

  const logout = () => {
    // Clear session storage
    try {
      sessionStorage.clear();
    } catch (_) {}

    // Remove specific auth items from localStorage instead of clearing everything
    // This preserves user settings like profile images
    const keysToRemove = [
      "token", 
      "profile", 
      "userId", 
      "role", 
      "landlordId", 
      "guestMode",
      "userName",
      "landlordStats",
      "recentActivity"
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
