import React, { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";

interface User {
  accessToken: string;
  username: string;
  email: string;
  userId: number;
  image: string;
  tokenType: "Bearer";
}

interface AuthContextType {
  user: User | null;
  login: (data: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  //@ts-ignore
  const [_, removeCookie] = useCookies(["isLoggedIn", "token"]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (data: User) => {
    setUser(data);
    localStorage.setItem("user", JSON.stringify(data));
  };

  const logout = () => { 
    setUser(null);
    localStorage.removeItem("user");
    removeCookie("isLoggedIn", "false", { path: "/" });
    removeCookie("token", "", { path: "/" });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
