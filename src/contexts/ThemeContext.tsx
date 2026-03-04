import  { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
// 1. Define the shape of your theme context
interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

// 2. Tell the context it starts as null but will hold ThemeContextType
const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<string>(() => {
    // Standardizing on a string type for 'theme'
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    return stored || "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};