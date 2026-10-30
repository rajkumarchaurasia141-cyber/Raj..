import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('bseb_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse cached user:", e);
    }
    return null;
  });

  const cleanUserEmail = user?.email?.trim().toLowerCase() || '';
  const isAdmin = cleanUserEmail === 'rajkumarchaurasia143@gmail.com' || cleanUserEmail === 'rajkumarchaurasia141@gmail.com';

  // Check unlock status from localStorage or if user is admin
  const [unlockedCrashCourses, setUnlockedCrashCourses] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('bseb_unlocked_crash_courses') || '{}');
    } catch {
      return {};
    }
  });

  const [unlockedFullCourses, setUnlockedFullCourses] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem('bseb_unlocked_full_courses') || '{}');
    } catch {
      return {};
    }
  });

  const hasCrashCourse = true;
  const hasFullCourse = true;
  const isPaid = true;
  const isVIP = true;

  const vipDetails = {
    isVip: isVIP,
    plan: isVIP ? 'premium_active' : 'free',
    planDurationText: isVIP ? 'VIP Full Access (सक्रिय)' : 'फ्री वर्शन (कोर्स लॉक)',
    isExpired: false,
    daysRemaining: isVIP ? 365 : 0,
    formattedExpiry: isVIP ? 'सक्रिय' : 'अपूर्ण'
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bseb_user');
      if (saved && !user) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch (e) {}
    setLoading(false);
  }, []);

  const unlockUserCrashCourse = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    const updated = { ...unlockedCrashCourses, [clean]: true };
    setUnlockedCrashCourses(updated);
    try {
      localStorage.setItem('bseb_unlocked_crash_courses', JSON.stringify(updated));
    } catch {}
  };

  const unlockUserFullCourse = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    const updated = { ...unlockedFullCourses, [clean]: true };
    setUnlockedFullCourses(updated);
    try {
      localStorage.setItem('bseb_unlocked_full_courses', JSON.stringify(updated));
    } catch {}
  };

  const lockUserCrashCourse = (email: string) => {
    const clean = email.trim().toLowerCase();
    if (!clean) return;
    const updated = { ...unlockedCrashCourses, [clean]: false };
    setUnlockedCrashCourses(updated);
    try {
      localStorage.setItem('bseb_unlocked_crash_courses', JSON.stringify(updated));
    } catch {}
  };

  const login = async (name: string, email: string) => {
    setError(null);
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('कृपया अपना नाम दर्ज करें।');
      return false;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('कृपया एक मान्य ईमेल (Gmail) दर्ज करें।');
      return false;
    }

    const userData = { name: cleanName, email: cleanEmail };

    try {
      localStorage.setItem('bseb_user', JSON.stringify(userData));
    } catch (e) {
      console.warn("LocalStorage save notice:", e);
    }

    setUser(userData);

    try {
      const storedStudents = JSON.parse(localStorage.getItem('bseb_registered_students') || '{}');
      storedStudents[cleanEmail] = {
        id: cleanEmail,
        name: cleanName,
        email: cleanEmail,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem('bseb_registered_students', JSON.stringify(storedStudents));
    } catch {}

    return true;
  };

  const logout = () => {
    localStorage.removeItem('bseb_user');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      fbUser: null, 
      isAdmin, 
      isVIP, 
      isPaid, 
      hasCrashCourse, 
      hasFullCourse, 
      unlockUserCrashCourse, 
      unlockUserFullCourse,
      lockUserCrashCourse, 
      vipDetails, 
      loading, 
      login, 
      logout, 
      error, 
      setError 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
