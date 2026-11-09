import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<{ name: string; email: string }>(() => {
    try {
      const saved = localStorage.getItem('bseb_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to parse cached user:", e);
    }
    return { name: 'BSEB GURU विद्यार्थी', email: 'student@bsebguru.app' };
  });

  const cleanUserEmail = user?.email?.trim().toLowerCase() || '';
  const isAdmin = cleanUserEmail === 'rajkumarchaurasia143@gmail.com' || 
                  cleanUserEmail === 'rajkumarchaurasia141@gmail.com' ||
                  (typeof window !== 'undefined' && localStorage.getItem('bseb_admin_verified') === 'true');

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
    plan: 'premium_active',
    planDurationText: 'VIP Full Access (सक्रिय)',
    isExpired: false,
    daysRemaining: 365,
    formattedExpiry: 'सक्रिय'
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  // Safe dummy functions for backward compatibility without login UI
  const login = async (name: string, email: string) => {
    const cleanName = (name || 'BSEB GURU विद्यार्थी').trim();
    const cleanEmail = (email || 'student@bsebguru.app').trim().toLowerCase();
    const userData = { name: cleanName, email: cleanEmail };
    setUser(userData);
    try {
      localStorage.setItem('bseb_user', JSON.stringify(userData));
    } catch {}
    return true;
  };

  const logout = () => {
    const defaultUser = { name: 'BSEB GURU विद्यार्थी', email: 'student@bsebguru.app' };
    setUser(defaultUser);
    try {
      localStorage.setItem('bseb_user', JSON.stringify(defaultUser));
      localStorage.removeItem('bseb_admin_verified');
    } catch {}
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
