import { createContext, useContext, useState, useEffect} from "react";
import type { ReactNode } from "react";
import authService from "../lib/authService";

// 1. Define the shape of your context so TypeScript knows what signup is
interface AuthContextType {
  user: any; // Replace 'any' with your User type if you have one (e.g., Models.User<Models.Preferences>)
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

// 2. Tell the context it will either be the AuthContextType or null
const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.warn("Auth check failed (CORS or network issue):", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });
    await checkUser();
  };

  const signup = async (email: string, password: string, name: string) => {
    await authService.createAccount({ email, password, name });
    await checkUser();
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};