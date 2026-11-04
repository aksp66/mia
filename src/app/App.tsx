import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookOpen, CalendarDays, Circle, History, Plus, UserRound } from 'lucide-react';
import { Button, Sheet, ToastProvider } from '../ui/components';
import { today } from '../domain/calendarDate';
import { useSetting, type Palette, type Theme } from './hooks';
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

function TopBar() {
  const { t } = useTranslation();
  return (
    <header className="topbar">
      <span className="topbar__brand">
        <svg viewBox="0 0 512 512" aria-hidden="true">
          <circle cx="256" cy="256" r="240" fill="var(--color-brand)" />
          <circle cx="270" cy="240" r="150" fill="var(--color-bg)" />
          <circle cx="170" cy="300" r="28" fill="var(--color-accent)" />
        </svg>
        MIA
      </span>
      <Link to="/profil" aria-label={t('nav.profile')}>
        <UserRound size={24} strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </header>
  );
}

function Nav() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [adding, setAdding] = useState(false);
  const left = [
    { to: '/', label: t('nav.home'), icon: Circle, end: true },
    { to: '/calendrier', label: t('nav.calendar'), icon: CalendarDays },
  ];
  const right = [
    { to: '/historique', label: t('nav.history'), icon: History },
    { to: '/apprendre', label: t('nav.learn'), icon: BookOpen },
  ];
  const item = ({ to, label, icon: Icon, end }: (typeof left)[number]) => (
    <li key={to}>
      <NavLink to={to} end={end}>
        {({ isActive }) => (
          <>
            <span className="nav-ico">
              <Icon size={24} strokeWidth={1.75} fill={isActive ? 'currentColor' : 'none'} fillOpacity={0.25} aria-hidden="true" />
            </span>
            {label}
          </>
        )}
      </NavLink>
    </li>
  );
  const go = (path: string) => {
    setAdding(false);
    nav(path);
  };
  return (
    <>
      <nav className="nav" aria-label="Navigation principale">
        <ul>
          {left.map(item)}
          <li className="nav-add">
            <button type="button" aria-label={t('nav.add')} onClick={() => setAdding(true)}>
              <Plus size={28} strokeWidth={2} aria-hidden="true" />
            </button>
          </li>
          {right.map(item)}
        </ul>
      </nav>
      {adding && (
        <Sheet title={t('nav.addTitle')} onClose={() => setAdding(false)} closeLabel={t('common.close')}>
          <Button variant="primary" onClick={() => go(`/journal/${today()}`)}>{t('home.recordPeriod')}</Button>
          <Button onClick={() => go(`/journal/${today()}?mode=symptoms`)}>{t('home.noteSymptom')}</Button>
        </Sheet>
      )}
    </>
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
  const [theme] = useSetting<Theme>('theme', 'auto');
  const [palette] = useSetting<Palette>('palette', 'soft');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light' || theme === 'dark') root.dataset.theme = theme;
    else delete root.dataset.theme;
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (palette && palette !== 'soft') root.dataset.palette = palette;
    else delete root.dataset.palette;
  }, [palette]);

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
        {!hideNav && !loc.pathname.startsWith('/profil') && <TopBar />}
        <Suspense fallback={null}>
          <div className="page" key={loc.pathname} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
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
          </div>
        </Suspense>
        {!hideNav && <Nav />}
      </div>
    </ToastProvider>
  );
}
