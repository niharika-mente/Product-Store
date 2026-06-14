import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("authToken") || null);

  const signup = async (name, email, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();    
    if (!data.success) throw new Error(data.message);
    return data;
  };
  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    console.log("data : ",data);
    
    if (!data.success) throw new Error(data.message);

    localStorage.setItem("authToken", data.token);
    localStorage.setItem("authUser", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user); // includes themePreference
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setToken(null);
    setUser(null);
  };

  const updateThemeInDB = async (newTheme) => {
    localStorage.setItem("theme", newTheme);

    const currentToken = localStorage.getItem("authToken");
    if (!currentToken) return;

    try {
      const response = await fetch("/api/auth/theme", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify({ themePreference: newTheme }),
      });

      const result = await response.json();
      console.log("response : ", result);

      if (!response.ok) {
        console.error("Theme update failed:", result.message);
        return;
      }

      if (result.success) {
        const updatedUser = {
          ...JSON.parse(localStorage.getItem("authUser")),
          themePreference: result.themePreference
        };
        setUser((prev) => ({ ...prev, themePreference: result.themePreference }));
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
      }

    } catch (error) {
      console.error("Theme sync error:", error.message);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("authUser");
    const currentToken = localStorage.getItem("authToken");

    if (savedUser) setUser(JSON.parse(savedUser));

    // DB se latest theme fetch karo — window event dispatch karenge
    if (currentToken) {
      fetch("/api/auth/theme", {
        headers: { Authorization: `Bearer ${currentToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            localStorage.setItem("theme", data.themePreference);
            // custom event dispatch karo
            window.dispatchEvent(new CustomEvent("theme-loaded", {
              detail: { theme: data.themePreference }
            }));
          }
        })
        .catch((err) => console.error("Theme fetch error:", err));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ signup, user, token, login, logout, updateThemeInDB }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);