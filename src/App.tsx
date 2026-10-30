import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider, useData } from './context/DataContext';
import { GmailAuthModal } from './components/GmailAuthModal';
import { HomeScreen } from './components/HomeScreen';
import { SubjectsExplorer } from './components/SubjectsExplorer';
import { AdminPanel } from './components/AdminPanel';
import { PaywallModal } from './components/PaywallModal';
import { MobileTopBar } from './components/MobileTopBar';
import { BottomNavBar } from './components/BottomNavBar';
import { AppDrawer } from './components/AppDrawer';
import { NotificationsModal } from './components/NotificationsModal';
import { ClassRoutineModal } from './components/ClassRoutineModal';
import { SocialMediaModal } from './components/SocialMediaModal';
import { NcertBooksModal } from './components/NcertBooksModal';
import { DownloadsNotesView } from './components/DownloadsNotesView';
import { DoubtChatView } from './components/DoubtChatView';
import { ProfileView } from './components/ProfileView';
import { MyCoursesView } from './components/MyCoursesView';
import { LiveClassesView } from './components/LiveClassesView';
import { DailyQuizView } from './components/DailyQuizView';
import { TopperLeaderboardView } from './components/TopperLeaderboardView';
import { InstallAppBanner } from './components/InstallAppBanner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AboutView } from './components/AboutView';
import { ContactView } from './components/ContactView';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { Footer } from './components/Footer';
import { AiTeacherStudioView } from './components/AiTeacherStudioView';
import { CartoonStudioView } from './components/CartoonStudioView';
import { PyqView } from './components/PyqView';
import { CrashCourseView } from './components/CrashCourseView';
import { LoginScreen } from './components/LoginScreen';
import { AdminDailyTestPage } from './components/AdminDailyTestPage';
import { StudentDailyTestPage } from './components/StudentDailyTestPage';
import { triggerAd } from './utils/adManager';
import { GlobalAdController } from './components/AdsterraBanner';
import { recordAppDownload, syncUserIdentityWithDownload } from './services/downloadTracker';

// Password check logic function as requested
function checkAdminSecret(enteredPass: string): boolean {
  return enteredPass === "#656920578506#";
}

function MainApp() {
  const { user, isAdmin, isVIP, vipDetails } = useAuth();

  // Clear any old stale firestore quota block flag on load
  React.useEffect(() => {
    try {
      localStorage.removeItem('bseb_firestore_quota_exhausted');
    } catch (e) {}
  }, []);

  // Automatically sync download/install tracker with logged-in user & standalone status
  React.useEffect(() => {
    if (user?.name && user?.email) {
      syncUserIdentityWithDownload(user.name, user.email);
    }
    const handleInstalled = () => {
      recordAppDownload({
        method: 'pwa_prompt',
        studentName: user?.name,
        studentEmail: user?.email
      });
    };
    window.addEventListener('appinstalled', handleInstalled);
    return () => window.removeEventListener('appinstalled', handleInstalled);
  }, [user?.name, user?.email]);

  // Screen Wake Lock API to prevent screen from turning off while app is open
  React.useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && (navigator as any).wakeLock) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLock !== null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);
  
  const isAdminDailyTestQuery = typeof window !== 'undefined' && 
    (window.location.pathname === '/admin/daily-test' || window.location.pathname.endsWith('/admin/daily-test') || window.location.search.includes('tab=admin_daily_test'));
  const isDailyTestQuery = typeof window !== 'undefined' && 
    (window.location.pathname === '/daily-test' || window.location.pathname.endsWith('/daily-test') || window.location.search.includes('tab=daily_test'));
  const isAdminQuery = typeof window !== 'undefined' && 
    (window.location.pathname === '/admin' || window.location.pathname.endsWith('/admin') || window.location.search.includes('tab=admin'));
  const isAboutQuery = typeof window !== 'undefined' && window.location.pathname.includes('/about');
  const isContactQuery = typeof window !== 'undefined' && window.location.pathname.includes('/contact');
  const isPrivacyQuery = typeof window !== 'undefined' && window.location.pathname.includes('/privacy');

  const getInitialTab = () => {
    if (isAdminDailyTestQuery) return 'admin_daily_test';
    if (isDailyTestQuery) return 'daily_test';
    if (isAboutQuery) return 'about';
    if (isContactQuery) return 'contact';
    if (isPrivacyQuery) return 'privacy';
    if (isAdminQuery) return 'admin';
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam) return tabParam;
    }
    return 'home';
  };

  const getInitialSubject = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('subject') || null;
    }
    return null;
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [selectedSubject, setSelectedSubject] = useState<string | null>(getInitialSubject());

  // Modals
  const [showVipModal, setShowVipModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoutine, setShowRoutine] = useState(false);
  const [showSocial, setShowSocial] = useState(false);
  const [showNcert, setShowNcert] = useState(false);
  const [showGmailAuth, setShowGmailAuth] = useState(false);

  const [adminVerified, setAdminVerified] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');

  // Effective Admin privilege check (Gmail Admin OR Verified Secret PIN Admin)
  const isEffectiveAdmin = Boolean(isAdmin || adminVerified);

  const mainScrollRef = React.useRef<HTMLElement>(null);

  // Deep-link navigation handler for Push Notification clicks & URL parameters
  const handleNavigateDeepLink = React.useCallback((rawUrl: string) => {
    if (!rawUrl || typeof window === 'undefined') return;
    try {
      const parsed = new URL(rawUrl, window.location.origin);
      const path = parsed.pathname;
      const params = parsed.searchParams;
      const tab = params.get('tab');
      const subject = params.get('subject');

      window.history.pushState({}, '', parsed.pathname + parsed.search);

      if (path === '/daily-test' || path.endsWith('/daily-test') || tab === 'daily_test') {
        setSelectedSubject(null);
        setActiveTab('daily_test');
      } else if (path === '/admin/daily-test' || tab === 'admin_daily_test') {
        setSelectedSubject(null);
        setActiveTab('admin_daily_test');
      } else if (tab === 'explorer' && subject) {
        setSelectedSubject(subject);
        setActiveTab('explorer');
      } else if (tab === 'downloads') {
        if (subject) setSelectedSubject(subject);
        setActiveTab('downloads');
      } else if (tab === 'live') {
        setSelectedSubject(null);
        setActiveTab('live');
      } else if (tab === 'daily_quiz') {
        setSelectedSubject(null);
        setActiveTab('daily_quiz');
      } else if (tab === 'crash_course') {
        setSelectedSubject(null);
        setActiveTab('crash_course');
      } else if (tab === 'my_courses') {
        setSelectedSubject(null);
        setActiveTab('my_courses');
      } else if (tab === 'leaderboard') {
        setSelectedSubject(null);
        setActiveTab('leaderboard');
      } else if (tab === 'chat') {
        setSelectedSubject(null);
        setActiveTab('chat');
      } else if (subject) {
        setSelectedSubject(subject);
        setActiveTab('explorer');
      } else {
        setSelectedSubject(null);
        setActiveTab('home');
      }
    } catch (e) {
      console.warn('Deep link navigation error:', e);
    }
  }, []);

  // Listen to Service Worker push notification click messages
  React.useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    const onSwMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BSEB_NOTIFICATION_CLICK' && event.data.url) {
        setShowNotifications(false);
        handleNavigateDeepLink(event.data.url);
      }
    };
    navigator.serviceWorker.addEventListener('message', onSwMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onSwMessage);
  }, [handleNavigateDeepLink]);

  // Auto-scroll to top when active tab or subject changes so user NEVER has to scroll up!
  React.useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab, selectedSubject]);

  const handleTabChange = (tab: string) => {
    if (tab !== 'admin') {
      triggerAd(`tab_${tab}`);
    }
    if (tab === activeTab) {
      // If clicking current active tab, smoothly scroll back to top of screen
      mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedSubject(null);
      setActiveTab(tab);
      try {
        const path = tab === 'about' ? '/about' 
          : tab === 'contact' ? '/contact' 
          : tab === 'privacy' ? '/privacy-policy' 
          : tab === 'admin' ? '/admin' 
          : tab === 'admin_daily_test' ? '/admin/daily-test' 
          : tab === 'daily_test' ? '/daily-test' 
          : '/';
        window.history.pushState({}, '', path);
      } catch (e) {}
      mainScrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  };

  const handleAdminClick = () => {
    setActiveTab('admin');
  };

  const handleDrawerNavigate = (view: string, extra?: any) => {
    switch (view) {
      case 'home':
        handleTabChange('home');
        break;
      case 'course':
        handleTabChange('my_courses');
        break;
      case 'daily_test':
        handleTabChange('daily_test');
        break;
      case 'admin_daily_test':
        handleTabChange('admin_daily_test');
        break;
      case 'live':
        handleTabChange('live');
        break;
      case 'leaderboard':
        handleTabChange('leaderboard');
        break;
      case 'chat':
        handleTabChange('chat');
        break;
      case 'profile':
        handleTabChange('profile');
        break;
      case 'routine':
        setShowRoutine(true);
        break;
      case 'ncert':
        setShowNcert(true);
        break;
      case 'social':
        setShowSocial(true);
        break;
      case 'crash_course':
        handleTabChange('crash_course');
        break;
      case 'pyqs':
        handleTabChange('pyqs');
        break;
      case 'ai_studio':
        handleTabChange('ai_studio');
        break;
      case 'cartoon_studio':
        handleTabChange('cartoon_studio');
        break;
      case 'admin':
        handleAdminClick();
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF4D6] flex flex-col selection:bg-[#D8B45A]/30 overflow-x-hidden text-[#222222]">
      {/* Edge-to-Edge Full-Width Responsive App Container */}
      <div className="w-full bg-[#FFF4D6] min-h-screen flex flex-col relative overflow-x-hidden">
        {/* Top Header Bar with Hamburger Menu & Notifications */}
        <MobileTopBar
          onOpenDrawer={() => {
            triggerAd('top_drawer_icon');
            setShowDrawer(true);
          }}
          onOpenNotifications={() => {
            triggerAd('top_notifications_icon');
            setShowNotifications(true);
          }}
          onOpenVip={() => {
            triggerAd('top_vip_icon');
            setShowVipModal(true);
          }}
          onOpenAdmin={handleAdminClick}
          onOpenGmailAuth={() => {
            triggerAd('top_gmail_icon');
            if (!user) {
              handleTabChange('profile');
            } else {
              setShowGmailAuth(true);
            }
          }}
          onGoHome={() => handleTabChange('home')}
          unreadCount={2}
        />

        {/* Side Drawer (Sliding Hamburger Menu) */}
        <AppDrawer
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          onNavigate={(view, extra) => {
            if (view !== 'admin') {
              triggerAd(`drawer_${view}`);
            }
            handleDrawerNavigate(view, extra);
          }}
          onOpenVip={() => {
            triggerAd('drawer_vip');
            setShowVipModal(true);
          }}
          onOpenGmailAuth={() => {
            triggerAd('drawer_gmail');
            if (!user) {
              handleTabChange('profile');
            } else {
              setShowGmailAuth(true);
            }
          }}
        />

        {/* Main Content Area */}
        <main ref={mainScrollRef} className="flex-1 w-full pb-40">
          {activeTab === 'home' && (
            <HomeScreen 
              onSelect={(id: string) => { 
                triggerAd(`subject_${id}`);
                setSelectedSubject(id); 
                setActiveTab('explorer'); 
              }} 
              onNavigateTab={handleTabChange}
              onOpenNotifications={() => {
                triggerAd('home_notifications_bar');
                setShowNotifications(true);
              }}
            />
          )}

          {activeTab === 'my_courses' && (
            <MyCoursesView 
              onSelectSubject={(id: string) => { 
                setSelectedSubject(id); 
                setActiveTab('explorer'); 
              }} 
              onOpenVip={() => setShowVipModal(true)}
            />
          )}

          {activeTab === 'live' && (
            <LiveClassesView 
              onOpenVip={() => setShowVipModal(true)}
            />
          )}

          {activeTab === 'ai_studio' && (
            <AiTeacherStudioView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'cartoon_studio' && (
            <CartoonStudioView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'crash_course' && (
            <CrashCourseView 
              onBack={() => setActiveTab('home')} 
              onOpenVip={() => setShowVipModal(true)} 
            />
          )}

          {activeTab === 'pyqs' && (
            <PyqView 
              onBack={() => setActiveTab('home')} 
              onOpenVip={() => setShowVipModal(true)} 
            />
          )}

          {activeTab === 'daily_quiz' && (
            <DailyQuizView 
              onOpenVip={() => setShowVipModal(true)}
              onSelectSubject={(id: string) => {
                setSelectedSubject(id);
                setActiveTab('explorer');
              }}
            />
          )}

          {activeTab === 'daily_test' && (
            <StudentDailyTestPage 
              onBack={() => handleTabChange('home')}
              onNavigateToAdmin={() => handleTabChange('admin_daily_test')}
            />
          )}

          {activeTab === 'admin_daily_test' && (
            <AdminDailyTestPage 
              onBack={() => handleTabChange(isAdmin ? 'admin' : 'home')}
              onNavigateToStudent={() => handleTabChange('daily_test')}
            />
          )}

          {activeTab === 'leaderboard' && (
            <TopperLeaderboardView 
              onOpenVip={() => setShowVipModal(true)}
            />
          )}

          {activeTab === 'downloads' && (
            <DownloadsNotesView 
              onOpenSubject={(id: string) => { 
                setSelectedSubject(id); 
                setActiveTab('explorer'); 
              }} 
              onOpenVip={() => setShowVipModal(true)}
            />
          )}

          {activeTab === 'chat' && (
            <DoubtChatView onOpenVip={() => setShowVipModal(true)} />
          )}

          {activeTab === 'profile' && (
            !user ? (
              <LoginScreen onBack={() => handleTabChange('home')} />
            ) : (
              <ProfileView
                onOpenVip={() => setShowVipModal(true)}
                onOpenRoutine={() => setShowRoutine(true)}
                onOpenSocial={() => setShowSocial(true)}
                onOpenAdmin={() => setActiveTab('admin')}
                onOpenCourse={() => setActiveTab('my_courses')}
                onOpenGmailAuth={() => setShowGmailAuth(true)}
              />
            )
          )}

          {activeTab === 'explorer' && selectedSubject && (
            <SubjectsExplorer 
              subjectId={selectedSubject} 
              onBack={() => { 
                setActiveTab('home'); 
                setSelectedSubject(null); 
              }} 
            />
          )}

          {activeTab === 'admin' && isAdmin && adminVerified && (
            <AdminPanel onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'admin' && isAdmin && !adminVerified && (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-stone-200 shadow-xl space-y-5">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold animate-pulse">
                🔑
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">Enter admin secret password</h2>
                <p className="text-stone-500 text-xs font-semibold">
                  एडमिन पैनल सुरक्षा के लिए कृपया सीक्रेट पासवर्ड दर्ज करें
                </p>
                <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl mt-2 text-[11px] text-emerald-800 font-bold">
                  पहचान स्वीकृत: {user?.email || 'राजकुमार (Direct)'}
                </div>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (checkAdminSecret(adminPasswordInput)) {
                    setAdminVerified(true);
                    setAdminPasswordError('');
                  } else {
                    alert("Galat Password");
                    setAdminPasswordError('गलत पासवर्ड! कृपया पुनः प्रयास करें।');
                  }
                }}
                className="space-y-4 pt-2"
              >
                <div>
                  <input
                    type="password"
                    value={adminPasswordInput}
                    onChange={(e) => {
                      setAdminPasswordInput(e.target.value);
                      setAdminPasswordError('');
                    }}
                    placeholder="सीक्रेट पासवर्ड यहाँ डालें..."
                    className="w-full px-4 py-3 text-center border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-bold tracking-widest text-lg bg-stone-50 text-stone-900"
                    autoFocus
                  />
                  {adminPasswordError && (
                    <p className="text-red-600 text-xs font-bold mt-2">{adminPasswordError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black py-3 rounded-xl shadow-md transition-all cursor-pointer text-sm"
                  >
                    🔓 प्रवेश करें / Verify Password
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminPasswordInput('');
                      setAdminPasswordError('');
                      setActiveTab('home');
                    }}
                    className="w-full bg-stone-100 text-stone-700 font-bold py-2.5 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer text-xs"
                  >
                    होम पर वापस जाएँ
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'about' && (
            <AboutView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'contact' && (
            <ContactView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'privacy' && (
            <PrivacyPolicyView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'admin' && !isAdmin && (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-stone-200 shadow-xl space-y-5">
              <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
                ⚠️
              </div>
              
              <div className="space-y-2">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">अनधिकृत प्रवेश (Restricted Access)</h2>
                <p className="text-stone-500 text-xs font-semibold leading-relaxed">
                  यह अनुभाग केवल राजकुमार सर (Admin) के लिए सुरक्षित है। आपकी जीमेल आईडी <b>{user?.email || 'Guest / Not Logged In'}</b> को एडमिन का अधिकार प्राप्त नहीं है।
                </p>
                <p className="text-red-600 text-xs font-black">
                  कृपया प्रोफाइल (Profile) में जाकर सही एडमिन जीमेल आईडी से लॉगिन करें।
                </p>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-md transition-all cursor-pointer text-xs"
                >
                  👤 प्रोफाइल में जाकर लॉगिन करें
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className="w-full bg-stone-900 hover:bg-black text-white font-black py-3 rounded-xl shadow-md transition-all cursor-pointer text-xs"
                >
                  ← मुख्य पृष्ठ (Home Screen) पर वापस जाएँ
                </button>
              </div>
            </div>
          )}

          {/* App Footer with AdSense Pages Links */}
          <Footer onNavigate={handleTabChange} />
        </main>

        {/* Bottom Navigation Bar (Sticky Native App Footer) */}
        {activeTab !== 'admin' && (
          <BottomNavBar
            activeTab={activeTab === 'explorer' ? 'my_courses' : activeTab}
            onTabChange={handleTabChange}
          />
        )}

        {/* Global Modals */}
        {showVipModal && <PaywallModal onClose={() => setShowVipModal(false)} />}
        {showNotifications && (
          <NotificationsModal
            onClose={() => setShowNotifications(false)}
            onOpenVip={() => setShowVipModal(true)}
            onOpenCourse={() => {
              setActiveTab('my_courses');
              setSelectedSubject(null);
            }}
            onNavigateDeepLink={(url: string) => {
              setShowNotifications(false);
              handleNavigateDeepLink(url);
            }}
          />
        )}
        {showRoutine && <ClassRoutineModal onClose={() => setShowRoutine(false)} />}
        {showSocial && <SocialMediaModal onClose={() => setShowSocial(false)} />}
        {showNcert && (
          <NcertBooksModal
            onClose={() => setShowNcert(false)}
            onOpenSubject={(id) => {
              setSelectedSubject(id);
              setActiveTab('explorer');
            }}
          />
        )}
        <GmailAuthModal 
          isOpen={showGmailAuth} 
          onClose={() => setShowGmailAuth(false)} 
        />
        <InstallAppBanner />
        <GlobalAdController />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DataProvider>
          <MainApp />
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
