import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import useAppStore from '../store';
import BookAgent from './BookAgent';
import HexagonBg from './HexagonBg';
import Icon3D from './Icon3D';
import { Home, Link2, Database, Share2, User, LogOut } from 'lucide-react';

const APP_ROUTES = ['/', '/links', '/database', '/share', '/profile'];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAppStore(state => state.logout);
  const user = useAppStore(state => state.user);

  // Instant Route Transition Lag-Masking Progress Bar
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(true);
    const timer = setTimeout(() => {
      setNavigating(false);
    }, 240);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Gestures for Sliding Navigation (Mobile Touch & Laptop Trackpad)
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const lastWheelTime = useRef(0);

  const navigateRelative = (direction) => {
    const currentIndex = APP_ROUTES.indexOf(location.pathname);
    if (currentIndex === -1) return;
    const nextIndex = currentIndex + direction;
    if (nextIndex >= 0 && nextIndex < APP_ROUTES.length) {
      navigate(APP_ROUTES[nextIndex]);
    }
  };

  // Touch Swipe for Mobile & Tablet
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length !== 1) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length !== 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const elapsed = Date.now() - touchStartTime.current;

    // Avoid swipe trigger when typing in inputs or interacting with category pills
    const targetTag = e.target.tagName?.toLowerCase();
    if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;
    if (e.target.closest('.no-scrollbar') || e.target.closest('[role="switch"]') || e.target.closest('.rude-stingray-wrapper')) return;

    if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && elapsed < 450) {
      if (deltaX < 0) {
        // Swipe Left -> next page
        navigateRelative(1);
      } else {
        // Swipe Right -> previous page
        navigateRelative(-1);
      }
    }
  };

  // Two-Finger Trackpad Horizontal Gesture for Laptops
  useEffect(() => {
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > 65 && Math.abs(e.deltaX) > Math.abs(e.deltaY) * 2) {
        const targetTag = e.target.tagName?.toLowerCase();
        if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;
        if (e.target.closest('.no-scrollbar') || e.target.closest('[role="switch"]')) return;

        const now = Date.now();
        if (now - lastWheelTime.current > 550) {
          lastWheelTime.current = now;
          if (e.deltaX > 0) {
            navigateRelative(1);
          } else {
            navigateRelative(-1);
          }
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const displayName = user?.username || user?.operatorId || 'OPERATOR';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="font-body text-on-surface bg-surface min-h-screen pb-24 pt-20 dotted-grid overflow-x-hidden flex flex-col w-full max-w-[100vw] print:bg-white print:overflow-visible print:h-auto print:min-h-0 print:pt-0 print:pb-0 print:block"
    >
      {/* Top Instant Navigation Progress Bar */}
      <div 
        className={`fixed top-0 left-0 right-0 h-1 z-[100] pointer-events-none transition-all duration-300 ${
          navigating ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
        } origin-left bg-gradient-to-r from-[#006d41] via-[#00f99b] to-[#38bdf8] shadow-[0_0_10px_#00f99b]`}
      />

      <HexagonBg />
      <div className="grain-texture print:hidden"></div>
      
      {/* AI Observer Book Agent */}
      <div className="print:hidden">
        <BookAgent />
      </div>

      {/* 3D Tactile Top Bar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-[#fbf9f0]/95 backdrop-blur-md border-b-2 border-[#5f5e5e]/30 shadow-[0_4px_12px_rgba(0,0,0,0.04)] max-w-[100vw] print:hidden">
        <div className="flex items-center gap-3">
          <Icon3D name="code" theme="emerald" size="sm" />
          <div className="flex flex-col">
            <span className="text-xl font-black text-primary tracking-widest font-['Space_Grotesk'] uppercase leading-tight">
              RLINKS
            </span>
            <span className="text-[9px] font-mono tracking-widest text-secondary uppercase font-bold hidden sm:block">
              VAULT v2.4
            </span>
          </div>
        </div>
        
        {/* Desktop Navigation with 3D buttons */}
        <nav className="hidden md:flex gap-3 font-['Space_Grotesk'] tracking-tight uppercase font-bold text-xs items-center">
          <DesktopNav to="/" label="HOME" icon={<Home size={15} />} />
          <DesktopNav to="/links" label="ADD LINK" icon={<Link2 size={15} />} />
          <DesktopNav to="/database" label="DATABASE" icon={<Database size={15} />} />
          <DesktopNav to="/share" label="SHARE" icon={<Share2 size={15} />} />
          <DesktopNav to="/profile" label="PROFILE" icon={<User size={15} />} />
        </nav>

        {/* User Info & Modernized Operator Pill + Logout Button */}
        <div className="flex items-center gap-2.5">
          {/* Apple-style Luxury Operator Profile Pill */}
          <NavLink 
            to="/profile"
            className="flex items-center gap-2 bg-[#f0eee5] hover:bg-[#e4e3da] border-2 border-[#5f5e5e]/30 hover:border-secondary px-2.5 py-1 rounded-xl transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.05)] group"
            title="View Operator Profile"
          >
            {/* Avatar Thumbnail */}
            <div className="w-6 h-6 rounded-lg bg-[#1b1c17] text-[#00f99b] font-mono font-black text-xs flex items-center justify-center border border-[#00f99b]/40 overflow-hidden shrink-0">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[11px] font-mono font-black uppercase text-primary tracking-wide leading-none truncate max-w-[110px]">
                {displayName}
              </span>
              <span className="text-[9px] font-mono text-secondary uppercase font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span>ONLINE</span>
              </span>
            </div>
          </NavLink>

          {/* Distinct Tactile Logout Pill UI */}
          <button 
            onClick={handleLogout} 
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf9f0] hover:bg-red-500 text-[#5f5e5e] hover:text-white border-2 border-[#5f5e5e]/30 hover:border-red-600 rounded-xl transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_rgba(0,0,0,0.06)] hover:shadow-[3px_3px_0px_#991b1b] active:translate-x-0.5 active:translate-y-0.5" 
            title="Terminate Session & Log Out"
          >
            <LogOut size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-['Space_Grotesk'] text-[10px] font-black tracking-wider uppercase">
              LOGOUT
            </span>
          </button>
        </div>
      </header>
      
      {/* Page Content with 60fps GPU-Accelerated Sliding Animation */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 w-full flex-grow flex flex-col overflow-x-hidden print:p-0 print:m-0 print:overflow-visible print:block">
        <div key={location.pathname} className="page-slide-container w-full flex-grow flex flex-col space-y-12 page-enter">
          <Outlet />
        </div>
      </main>

      {/* 3D Mobile Bottom Bar */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-5 pt-2 bg-[#fbf9f0]/95 backdrop-blur-md border-t-2 border-[#5f5e5e]/25 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] print:hidden">
        <MobileNav to="/" icon={<Home size={18} />} label="HOME" />
        <MobileNav to="/links" icon={<Link2 size={18} />} label="LINKS" />
        <MobileNav to="/database" icon={<Database size={18} />} label="DATABASE" />
        <MobileNav to="/share" icon={<Share2 size={18} />} label="SHARE" />
        <MobileNav to="/profile" icon={<User size={18} />} label="PROFILE" />
      </footer>
    </div>
  );
}

function MobileNav({ to, icon, label }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex flex-col items-center justify-center px-3 py-1.5 rounded-xl transition-all ${
          isActive 
            ? 'bg-[#00f99b] text-[#006d41] font-black shadow-[2px_2px_0px_#006d41] border border-[#006d41] -translate-y-1' 
            : 'text-[#5f5e5e] hover:text-primary active:scale-95'
        }`
      }
    >
      <span className="mb-0.5">{icon}</span>
      <span className="font-['Space_Grotesk'] text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </NavLink>
  );
}

function DesktopNav({ to, label, icon }) {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all text-xs ${
          isActive 
            ? 'bg-[#00f99b] text-[#006d41] font-black border-2 border-[#5f5e5e] shadow-[3px_3px_0px_#006d41]' 
            : 'text-[#5f5e5e] hover:text-primary hover:bg-[#00f99b]/15 border-2 border-transparent hover:border-[#5f5e5e]/20'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
