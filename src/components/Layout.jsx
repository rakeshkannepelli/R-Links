import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAppStore from '../store';

export default function Layout() {
  const navigate = useNavigate();
  const logout = useAppStore(state => state.logout);

  const handleSettingsClick = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="font-body text-on-surface bg-surface min-h-screen pb-24 pt-20 dotted-grid overflow-x-hidden flex flex-col w-full max-w-[100vw]">
      <div className="grain-texture"></div>

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#fbf9f0] border-b-2 border-dashed border-[#5f5e5e]/20 max-w-[100vw]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#5f5e5e]">terminal</span>
          <h1 className="text-2xl font-black text-[#5f5e5e] tracking-widest font-['Space_Grotesk'] uppercase hidden sm:block">RLINKS</h1>
        </div>
        
        <nav className="hidden md:flex gap-8 font-['Space_Grotesk'] tracking-tighter uppercase font-bold text-sm items-center">
          <DesktopNav to="/" label="HOME" />
          <DesktopNav to="/links" label="LINKS" />
          <DesktopNav to="/database" label="DATABASE" />
          <DesktopNav to="/share" label="SHARE" />
          <DesktopNav to="/profile" label="PROFILE" />
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={handleSettingsClick} className="p-2 hover:bg-[#00f99b]/10 transition-colors text-[#5f5e5e] group" title="Logout">
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform">logout</span>
          </button>
        </div>
      </header>
      
      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 space-y-12 relative z-10 w-full flex-grow flex flex-col overflow-x-hidden">
        <Outlet />
      </main>

      {/* BottomNavBar */}
      <footer className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-1 pb-6 pt-2 bg-[#fbf9f0] border-t-2 border-[#5f5e5e]/10">
        <MobileNav to="/" icon="home" label="HOME" />
        <MobileNav to="/links" icon="link" label="LINKS" />
        <MobileNav to="/database" icon="database" label="INDEX" />
        <MobileNav to="/share" icon="share" label="SHARE" />
        <MobileNav to="/profile" icon="account_circle" label="PROFILE" />
      </footer>
    </div>
  );
}

function MobileNav({to, icon, label}) {
  return (
    <NavLink to={to} className={({isActive}) => `flex flex-col items-center justify-center px-3 sm:px-4 py-1 transition-all ${isActive ? 'bg-[#00f99b] text-[#006d41] rounded-none shadow-[4px_4px_0px_0px_rgba(0,109,65,1)] border border-secondary scale-105' : 'text-[#5f5e5e]'}`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="font-['Space_Grotesk'] text-[9px] font-bold uppercase tracking-widest mt-0.5">{label}</span>
    </NavLink>
  );
}

function DesktopNav({to, label}) {
  return (
    <NavLink to={to} className={({isActive}) => `p-2 transition-colors ${isActive ? 'text-[#006d41] bg-[#00f99b]/10 border-b-2 border-[#006d41]' : 'text-[#5f5e5e] hover:bg-[#00f99b]/10'}`}>
      {label}
    </NavLink>
  );
}
