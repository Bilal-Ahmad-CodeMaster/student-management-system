"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Watch for route changes to enforce protection
  useEffect(() => {
    if (!loading) {
      if (user && pathname === "/login") {
        router.push("/users");
      }
      if (!user && pathname !== "/login") {
        router.push("/login");
      }
    }
  }, [user, loading, pathname, router]);

  const login = (token, details) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(details));
    setUser(details);
    router.push("/users");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
