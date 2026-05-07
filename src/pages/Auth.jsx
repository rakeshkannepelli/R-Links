import { useState } from 'react';
import useAppStore from '../store';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Auth() {
  const login = useAppStore(state => state.login);
  const navigate = useNavigate();
  const [operator, setOperator] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (operator && passphrase) {
      toast.success(isLogin ? "Session Initialized" : "Operator Profile Created");
      login(operator, passphrase);
      navigate('/');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 dotted-grid w-full max-w-[100vw] overflow-x-hidden">
      <div className="grain-texture"></div>
      
      <main className="relative w-full max-w-lg z-10 transition-transform duration-300 hover:rotate-0 -rotate-1 pb-16">
        <nav className="flex w-full mb-0 space-x-0 items-end">
          <button 
            type="button"
            onClick={() => setIsLogin(true)}
            className={`px-8 py-3 font-bold border-t-2 border-l-2 border-r-2 relative z-20 outline-none transition-colors ${isLogin ? 'bg-surface-container-highest text-secondary border-primary/20' : 'bg-surface-container text-primary/60 border-primary/10 hover:bg-surface-variant'}`}
          >
            LOGIN
            {isLogin && <div className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-surface-container-highest"></div>}
          </button>
          <button 
            type="button"
            onClick={() => setIsLogin(false)}
            className={`px-8 py-2 font-bold border-t-2 border-l-2 border-r-2 relative z-20 outline-none transition-colors ${!isLogin ? 'bg-surface-container-highest text-secondary border-primary/20 py-3' : 'bg-surface-container text-primary/60 border-primary/10 hover:bg-surface-variant'}`}
          >
            REGISTER
            {!isLogin && <div className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-surface-container-highest"></div>}
          </button>
          <div className="flex-grow border-b-2 border-primary/20 mb-[2px]"></div>
        </nav>

        <section className="bg-surface-container-highest p-6 sm:p-8 md:p-12 border-2 border-primary/20 shadow-[20px_20px_60px_rgba(27,28,23,0.05)] relative overflow-hidden">
          <header className="mb-8 md:mb-12">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>terminal</span>
              <span className="font-label text-xs tracking-widest text-primary/60 uppercase">System Integrity: Verified</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tighter text-primary leading-none uppercase">
              {isLogin ? 'ENTER RLINKS' : 'JOIN RLINKS'} <br/>
              <span className="text-secondary">SYSTEM</span>
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            <div className="relative group">
              <label className="block font-label text-[10px] font-bold text-primary/50 mb-2 uppercase tracking-widest">
                [01] OPERATOR_ID
              </label>
              <div className="flex items-center border-b-2 border-primary/20 group-focus-within:border-secondary transition-all">
                <span className="text-secondary font-bold mr-2 text-xl tracking-tighter">&gt;</span>
                <input required value={operator} onChange={(e) => setOperator(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 outline-none text-primary font-bold placeholder:text-primary/20 placeholder:font-normal uppercase py-2" placeholder={isLogin ? "USER_ALPHA_9" : "NEW_OPERATOR"} type="text"/>
                <span className="w-3 h-6 bg-secondary/30 hidden group-focus-within:block blink"></span>
              </div>
            </div>

            <div className="relative group">
              <label className="block font-label text-[10px] font-bold text-primary/50 mb-2 uppercase tracking-widest">
                [02] PASSPHRASE
              </label>
              <div className="flex items-center border-b-2 border-primary/20 group-focus-within:border-secondary transition-all">
                <span className="text-secondary font-bold mr-2 text-xl tracking-tighter">&gt;</span>
                <input required value={passphrase} onChange={(e) => setPassphrase(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 outline-none text-primary font-bold placeholder:text-primary/20 py-2" placeholder="••••••••" type="password"/>
                <span className="w-3 h-6 bg-secondary/30 hidden group-focus-within:block blink"></span>
              </div>
            </div>

            {!isLogin && (
              <div className="relative group">
                <label className="block font-label text-[10px] font-bold text-primary/50 mb-2 uppercase tracking-widest">
                  [03] ACCESS_CODE
                </label>
                <div className="flex items-center border-b-2 border-primary/20 group-focus-within:border-secondary transition-all">
                  <span className="text-secondary font-bold mr-2 text-xl tracking-tighter">&gt;</span>
                  <input required className="w-full bg-transparent border-none focus:ring-0 outline-none text-primary font-bold placeholder:text-primary/20 py-2" placeholder="INVITE-CODE" type="text"/>
                  <span className="w-3 h-6 bg-secondary/30 hidden group-focus-within:block blink"></span>
                </div>
              </div>
            )}

            <div className="pt-4">
              <button className="w-full bg-primary text-on-primary py-5 px-8 font-bold flex items-center justify-between group relative active:translate-y-1 active:shadow-none transition-all shadow-[6px_6px_0px_#00f99b] hover:bg-on-surface-variant" type="submit">
                <span className="uppercase tracking-tighter text-lg">{isLogin ? 'INITIALIZE SESSION' : 'CREATE OPERATOR'}</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">trending_flat</span>
              </button>
            </div>
          </form>

          {/* OAUTH BLOCK */}
          <div className="mt-8 pt-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-grow border-t-2 border-primary/10"></div>
              <span className="font-label text-[10px] font-bold text-primary/40 uppercase tracking-widest">Or Continue With</span>
              <div className="flex-grow border-t-2 border-primary/10"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button type="button" onClick={() => toast('OAuth Integration Pending')} className="w-full border-2 border-primary/20 bg-surface/50 text-primary py-3 px-4 font-bold flex items-center justify-center gap-3 hover:bg-surface transition-colors">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="uppercase tracking-tighter text-xs">Google</span>
              </button>
              <button type="button" onClick={() => toast('OAuth Integration Pending')} className="w-full border-2 border-primary/20 bg-surface/50 text-primary py-3 px-4 font-bold flex items-center justify-center gap-3 hover:bg-surface transition-colors">
                <svg className="w-5 h-5 flex-shrink-0 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                <span className="uppercase tracking-tighter text-xs">GitHub</span>
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-2 torn-edge bg-surface-container-low"></div>
        </section>

        <footer className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 hidden sm:flex">
          <div className="flex gap-6">
            <a className="text-[11px] font-label text-tertiary font-bold tracking-tight hover:underline decoration-wavy transition-all" href="#">RECOVER ACCESS</a>
            <a className="text-[11px] font-label text-tertiary font-bold tracking-tight hover:underline decoration-wavy transition-all" href="#">SYSTEM STATUS</a>
          </div>
          <div className="font-label text-[9px] text-primary/40 uppercase tracking-[0.2em]">
            Link_OS v1.02 // Local Node Active
          </div>
        </footer>
      </main>

      <div className="fixed top-12 left-12 opacity-20 hidden lg:block pointer-events-none">
        <div className="font-label text-xs border-l-2 border-secondary pl-4 py-2 space-y-1">
          <p>LOC: 127.0.0.1</p>
          <p>LOG: {isLogin ? 'SESSION_INIT' : 'MEMBER_REGISTER'}</p>
          <p>SEC: LEVEL_4_ENCRYPTION</p>
        </div>
      </div>
      <div className="fixed bottom-12 right-12 opacity-10 hidden lg:block select-none pointer-events-none">
        <span className="text-9xl font-headline font-extrabold tracking-tighter text-primary/10 rotate-90 block">RLINKS</span>
      </div>
    </div>
  );
}
