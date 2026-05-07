import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useAppStore from './store';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Links from './pages/Links';
import Database from './pages/Database';
import Share from './pages/Share';
import Profile from './pages/Profile';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const user = useAppStore((state) => state.user);
  return user ? children : <Navigate to="/auth" />;
}

function App() {
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
        position="top-center" 
        toastOptions={{ 
          duration: 1500,//notification time 
          className: 'pointer-events-auto',
          style: {
            borderRadius: '0',
            background: '#fbf9f0',
            color: '#5f5e5e',
            border: '2px solid #5f5e5e',
            boxShadow: '4px 4px 0px #006d41',
            fontFamily: '"Space Grotesk", sans-serif',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            fontSize: '12px'
          }
        }} 
      />
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="links" element={<Links />} />
            <Route path="database" element={<Database />} />
            <Route path="share" element={<Share />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
