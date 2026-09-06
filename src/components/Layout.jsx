import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAppStore from '../store';
import BookAgent from './BookAgent';
import HexagonBg from './HexagonBg';
import Icon3D from './Icon3D';
import { Home, Link2, Database, Share2, User, LogOut, Terminal } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();
  const logout = useAppStore(state => state.logout);
  const user = useAppStore(state => state.user);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="font-body text-on-surface bg-surface min-h-screen pb-24 pt-20 dotted-grid overflow-x-hidden flex flex-col w-full max-w-[100vw] print:bg-white print:overflow-visible print:h-auto print:min-h-0 print:pt-0 print:pb-0 print:block">
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

        {/* User Info & 3D Logout Button */}
        <div className="flex items-center gap-3">
          {user?.operatorId && (
            <div className="hidden lg:flex items-center gap-2 bg-[#f0eee5] border border-[#5f5e5e]/30 px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-primary shadow-inner">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span>{user.operatorId}</span>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            className="btn-3d-secondary bg-[#fbf9f0] p-2 hover:bg-red-50 text-[#5f5e5e] hover:text-red-700 flex items-center justify-center rounded-lg" 
            title="Log Out Session"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>
      
      {/* Page Content with Smooth Enter Animation */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 space-y-12 relative z-10 w-full flex-grow flex flex-col overflow-x-hidden print:p-0 print:m-0 print:overflow-visible print:block page-enter">
        <Outlet />
      </main>

      {/* 3D Mobile Bottom Bar */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-5 pt-2 bg-[#fbf9f0]/95 backdrop-blur-md border-t-2 border-[#5f5e5e]/25 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] print:hidden">
        <MobileNav to="/" icon={<Home size={18} />} label="HOME" />
        <MobileNav to="/links" icon={<Link2 size={18} />} label="ADD" />
        <MobileNav to="/database" icon={<Database size={18} />} label="VAULT" />
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
