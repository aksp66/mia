import { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, CalendarDays, Circle, History, UserRound } from 'lucide-react';
import { ToastProvider } from '../ui/components';
import { useSetting } from './hooks';
import { useVaultStatus } from './useVault';
import { vault } from '../data/vault';
import { LockScreen } from '../features/profil/LockScreen';
import { Home } from '../features/accueil/Home';
import { Welcome } from '../features/accueil/Welcome';

const Calendar = lazy(() => import('../features/calendrier/Calendar'));
const Journal = lazy(() => import('../features/journal/Journal'));
const HistoryScreen = lazy(() => import('../features/historique/History'));
const Learn = lazy(() => import('../features/apprendre/Learn'));
const Profile = lazy(() => import('../features/profil/Profile'));

function Nav() {
  const { t } = useTranslation();
  const items = [
    { to: '/', label: t('nav.home'), icon: Circle, end: true },
    { to: '/calendrier', label: t('nav.calendar'), icon: CalendarDays },
    { to: '/historique', label: t('nav.history'), icon: History },
    { to: '/apprendre', label: t('nav.learn'), icon: BookOpen },
    { to: '/profil', label: t('nav.profile'), icon: UserRound },
  ];
  return (
    <nav className="nav" aria-label="Navigation principale">
      <ul>
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end}>
              <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function useOnline() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

export function App() {
  const { t } = useTranslation();
  const loc = useLocation();
  const online = useOnline();
  const [welcomed] = useSetting<boolean>('welcomed', false);
  const lock = useVaultStatus();

  useEffect(() => {
    void vault.init();
    return vault.installAutoLock();
  }, []);

  if (lock === 'loading') return null;
  if (lock === 'locked') return <LockScreen />;

  if (welcomed === undefined) return null;
  if (!welcomed && loc.pathname !== '/bienvenue') return <Navigate to="/bienvenue" replace />;

  const hideNav = loc.pathname === '/bienvenue' || loc.pathname.startsWith('/journal');
  return (
    <ToastProvider>
      <div className="app">
        {!online && (
          <p className="muted" role="status" style={{ textAlign: 'center', margin: 4 }}>
            {t('common.offline')}
          </p>
        )}
        <Suspense fallback={null}>
          <Routes>
            <Route path="/bienvenue" element={<Welcome />} />
            <Route path="/" element={<Home />} />
            <Route path="/calendrier" element={<Calendar />} />
            <Route path="/journal/:date" element={<Journal />} />
            <Route path="/historique" element={<HistoryScreen />} />
            <Route path="/apprendre" element={<Learn />} />
            <Route path="/apprendre/:article" element={<Learn />} />
            <Route path="/profil/*" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        {!hideNav && <Nav />}
      </div>
    </ToastProvider>
  );
}
