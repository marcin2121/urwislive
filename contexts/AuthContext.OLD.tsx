'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  level: number;
  exp: number;
  expToNextLevel: number;
  avatar: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  addExp: (amount: number, reason: string) => void;
  updateAvatar: (avatar: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Załaduj użytkownika z localStorage
    const savedUser = localStorage.getItem('urwis_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const calculateExpForLevel = (level: number): number => {
    // Wzór: 100 * level * 1.5 (rosnąca trudność)
    return Math.floor(100 * level * 1.5);
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      // Sprawdź czy użytkownik już istnieje
      const existingUsers = JSON.parse(localStorage.getItem('urwis_users') || '[]');
      const userExists = existingUsers.some((u: any) => u.email === email);

      if (userExists) {
        alert('Użytkownik o tym emailu już istnieje!');
        return false;
      }

      // Stwórz nowego użytkownika
      const newUser: User = {
        id: Date.now().toString(),
        email,
        username,
        level: 1,
        exp: 0,
        expToNextLevel: calculateExpForLevel(1),
        avatar: '🧸',
        createdAt: new Date().toISOString(),
      };

      // Zapisz hasło (w produkcji użyj bcrypt!)
      const userWithPassword = {
        ...newUser,
        password: password, // W produkcji: await bcrypt.hash(password, 10)
      };

      existingUsers.push(userWithPassword);
      localStorage.setItem('urwis_users', JSON.stringify(existingUsers));

      // Zaloguj automatycznie
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('urwis_user', JSON.stringify(newUser));

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const existingUsers = JSON.parse(localStorage.getItem('urwis_users') || '[]');
      const foundUser = existingUsers.find(
        (u: any) => u.email === email && u.password === password
      );

      if (!foundUser) {
        alert('Nieprawidłowy email lub hasło!');
        return false;
      }

      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('urwis_user', JSON.stringify(userWithoutPassword));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('urwis_user');
  };

  const addExp = (amount: number, reason: string) => {
    if (!user) return;

    let newExp = user.exp + amount;
    let newLevel = user.level;
    let expToNext = user.expToNextLevel;

    // Sprawdź czy awansował
    while (newExp >= expToNext) {
      newExp -= expToNext;
      newLevel += 1;
      expToNext = calculateExpForLevel(newLevel);

      // Pokazuje powiadomienie o levelup
      showLevelUpNotification(newLevel);
    }

    const updatedUser = {
      ...user,
      exp: newExp,
      level: newLevel,
      expToNextLevel: expToNext,
    };

    setUser(updatedUser);
    localStorage.setItem('urwis_user', JSON.stringify(updatedUser));

    // Zaktualizuj w bazie użytkowników
    const existingUsers = JSON.parse(localStorage.getItem('urwis_users') || '[]');
    const userIndex = existingUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      existingUsers[userIndex] = { ...existingUsers[userIndex], ...updatedUser };
      localStorage.setItem('urwis_users', JSON.stringify(existingUsers));
    }

    // Zapisz historię exp
    const expHistory = JSON.parse(localStorage.getItem(`urwis_exp_history_${user.id}`) || '[]');
    expHistory.unshift({
      amount,
      reason,
      date: new Date().toISOString(),
      level: newLevel,
    });
    localStorage.setItem(`urwis_exp_history_${user.id}`, JSON.stringify(expHistory.slice(0, 50)));
  };

  const showLevelUpNotification = (newLevel: number) => {
    // Możesz użyć toast notification library
    alert(`🎉 LEVEL UP! Osiągnąłeś poziom ${newLevel}!`);
  };

  const updateAvatar = (avatar: string) => {
    if (!user) return;

    const updatedUser = { ...user, avatar };
    setUser(updatedUser);
    localStorage.setItem('urwis_user', JSON.stringify(updatedUser));

    const existingUsers = JSON.parse(localStorage.getItem('urwis_users') || '[]');
    const userIndex = existingUsers.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      existingUsers[userIndex] = { ...existingUsers[userIndex], avatar };
      localStorage.setItem('urwis_users', JSON.stringify(existingUsers));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        addExp,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSupabaseAuth must be used within AuthProvider');
  }
  return context;
}
