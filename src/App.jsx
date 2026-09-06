import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAppStore from './store';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Links from './pages/Links';
import Database from './pages/Database';
import Share from './pages/Share';
import Profile from './pages/Profile';
import SmoothLoader from './components/SmoothLoader';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const user = useAppStore((state) => state.user);
  const isAuthLoading = useAppStore((state) => state.isAuthLoading);
  const hasStoredToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('token'));

  // If session is validating or token exists but user not loaded yet, hold on smooth loader
  if (isAuthLoading || (hasStoredToken && !user)) {
    return <SmoothLoader message="VALIDATING SESSION..." subtext="Connecting to neural security grid" />;
  }

  return user ? children : <Navigate to="/auth" replace />;
}

function App() {
  const fetchLinks = useAppStore(state => state.fetchLinks);
  const checkAuth = useAppStore(state => state.checkAuth);
  const user = useAppStore(state => state.user);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, fetchLinks]);

  useEffect(() => {
    try {
      const oldDataStr = localStorage.getItem('rlinks_db_v2');
      if (oldDataStr) {
        const oldLinks = JSON.parse(oldDataStr);
        if (Array.isArray(oldLinks) && oldLinks.length > 0) {
          const currentLinks = useAppStore.getState().links;
          const migratedLinks = oldLinks.map(l => ({
            id: l.id.toString(),
            title: l.name || '',
            url: l.url || '',
            category: (l.category || 'UNCATEGORIZED').toUpperCase(),
            description: '',
            date: l.date || new Date().toISOString(),
            pinned: false,
            tags: []
          }));
          
          useAppStore.setState({ links: [...migratedLinks, ...currentLinks] });
          localStorage.removeItem('rlinks_db_v2');
          console.log('Migrated old links to new storage format');
        }
      }
    } catch (e) {
      console.error('Migration failed', e);
    }
  }, []);

  return (
    <>
      <Toaster 
        containerClassName="print:hidden pointer-events-none"
        position="bottom-right" 
        containerStyle={{
          bottom: 84,
          right: 20,
          zIndex: 99999
        }}
        toastOptions={{ 
          duration: 2000,
          className: 'pointer-events-auto',
          style: {
            borderRadius: '12px',
            background: '#fbf9f0',
            color: '#1b1c17',
            border: '2px solid #5f5e5e',
            boxShadow: '4px 4px 0px #006d41',
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '11px',
            padding: '10px 16px',
            pointerEvents: 'auto'
          }
        }} 
      />
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="links" element={<Links />} />
            <Route path="database" element={<Database />} />
            <Route path="share" element={<Share />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          {/* Catch-all route to prevent 404 dead-ends */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
