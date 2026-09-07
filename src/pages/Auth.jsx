import { useState, useEffect } from 'react';
import useAppStore from '../store';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import HexagonBg from '../components/HexagonBg';
import Icon3D from '../components/Icon3D';
import { API_URL, GITHUB_CLIENT_ID } from '../config';

export default function Auth() {
  const user = useAppStore(state => state.user);
  const login = useAppStore(state => state.login);
  const navigate = useNavigate();
  const [operator, setOperator] = useState('');
  const [email, setEmail] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  // If already authenticated, redirect straight to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      handleGithubCallback(code);
    }
  }, [searchParams]);

  const handleGithubCallback = async (code) => {
    setIsLoading(true);
    setSearchParams({});
    
    try {
      const res = await fetch(`${API_URL}/api/auth/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'GitHub Auth Failed');
      
      login(data.user, data.token);
      toast.success('SYS_ACCESS_GRANTED');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    try {
      if (isForgot) {
        const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, frontendUrl: window.location.origin })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to send reset link.');
        toast.success(data.message);
        setIsForgot(false);
        setIsLoading(false);
        return;
      }

      const endpoint = isLogin ? `${API_URL}/api/auth/login` : `${API_URL}/api/auth/register`;
      const body = isLogin ? { email, password: passphrase } : { operatorId: operator, email, password: passphrase };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      login(data.user, data.token);

      toast.success(isLogin ? "Login Successful" : "Registration Successful");
      navigate('/');
    } catch (error) {
      toast.error(error.message === 'Failed to fetch' ? 'Server waking up. Please retry in a moment.' : error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Google Auth Failed');
        
        login(data.user, data.token);
        toast.success('SYS_ACCESS_GRANTED');
        navigate('/');
      } catch (err) {
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error('Google Login Cancelled')
  });

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 dotted-grid w-full max-w-[100vw] overflow-x-hidden">
      <HexagonBg />
      <div className="grain-texture"></div>

      <main className="relative w-full max-w-lg z-10 transition-transform duration-300 hover:rotate-0 -rotate-0.5 pb-16 page-enter">
        <nav className="flex w-full mb-0 space-x-0 items-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => !isLoading && setIsLogin(true)}
            className={`px-8 py-3.5 font-bold border-t-2 border-l-2 border-r-2 relative z-20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isLogin ? 'bg-[#fbf9f0] text-secondary border-[#5f5e5e] shadow-[-2px_-2px_0_rgba(0,0,0,0.05)]' : 'bg-surface-container text-primary/60 border-primary/20 hover:bg-surface-variant'}`}
          >
            LOGIN
            {isLogin && <div className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-[#fbf9f0]"></div>}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => !isLoading && setIsLogin(false)}
            className={`px-8 py-2.5 font-bold border-t-2 border-l-2 border-r-2 relative z-20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${!isLogin ? 'bg-[#fbf9f0] text-secondary border-[#5f5e5e] py-3.5 shadow-[-2px_-2px_0_rgba(0,0,0,0.05)]' : 'bg-surface-container text-primary/60 border-primary/20 hover:bg-surface-variant'}`}
          >
            REGISTER
            {!isLogin && <div className="absolute bottom-[-2px] left-0 w-full h-[3px] bg-[#fbf9f0]"></div>}
          </button>
          <div className="flex-grow border-b-2 border-[#5f5e5e] mb-[2px]"></div>
        </nav>

        <section className="bg-[#fbf9f0] p-6 sm:p-8 md:p-10 border-2 border-[#5f5e5e] shadow-[10px_10px_0px_#006d41] relative overflow-hidden">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Icon3D name="code" theme="emerald" size="sm" />
              <div>
                <span className="font-label text-[10px] tracking-widest text-[#006d41] uppercase font-bold block">
                  System Integrity: Active Node
                </span>
                <span className="text-[9px] text-[#5f5e5e] font-mono">
                  AES-256 SESSION PROTECTED
                </span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-headline font-black tracking-tight text-primary leading-none uppercase">
              {isForgot ? 'RECOVERY' : isLogin ? 'ENTER RLINKS' : 'JOIN RLINKS'} <br />
              <span className="text-secondary">SYSTEM VAULT</span>
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            {(!isLogin && !isForgot) && (
              <div className="relative group">
                <label htmlFor="operator-input" className="block font-label text-[11px] font-bold text-primary mb-2 uppercase tracking-widest">
                  [00] OPERATOR_ID
                </label>
                <div className="flex items-center border-b-2 border-[#5f5e5e]/40 group-focus-within:border-secondary transition-all pb-1">
                  <span className="text-secondary font-bold mr-2 text-xl tracking-tighter">&gt;</span>
                  <input id="operator-input" required={!isLogin} disabled={isLoading} value={operator} onChange={(e) => setOperator(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 outline-none text-primary font-bold placeholder:text-primary/40 placeholder:font-normal uppercase py-1 disabled:opacity-50" placeholder="NEW_OPERATOR" type="text" />
                  <span className="w-2.5 h-5 bg-secondary/40 hidden group-focus-within:block blink"></span>
                </div>
              </div>
            )}

            <div className="relative group">
              <label htmlFor="email-input" className="block font-label text-[11px] font-bold text-primary mb-2 uppercase tracking-widest">
                {isLogin && !isForgot ? '[01] EMAIL OR OPERATOR_ID' : '[01] EMAIL_ADDRESS'}
              </label>
              <div className="flex items-center border-b-2 border-[#5f5e5e]/40 group-focus-within:border-secondary transition-all pb-1">
                <span className="text-secondary font-bold mr-2 text-xl tracking-tighter">&gt;</span>
                <input id="email-input" required disabled={isLoading} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 outline-none text-primary font-bold placeholder:text-primary/40 placeholder:font-normal uppercase py-1 disabled:opacity-50" placeholder={isLogin && !isForgot ? "OPERATOR OR EMAIL@NETWORK.COM" : "OPERATOR@NETWORK.COM"} type={isLogin && !isForgot ? "text" : "email"} />
                <span className="w-2.5 h-5 bg-secondary/40 hidden group-focus-within:block blink"></span>
              </div>
            </div>

            {!isForgot && (
              <div className="relative group">
                <label htmlFor="passphrase-input" className="block font-label text-[11px] font-bold text-primary mb-2 uppercase tracking-widest flex justify-between">
                  <span>[02] PASSPHRASE</span>
                  {isLogin && (
                    <button type="button" disabled={isLoading} onClick={() => !isLoading && setIsForgot(true)} className="text-secondary hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">Forgot?</button>
                  )}
                </label>
                <div className="flex items-center border-b-2 border-[#5f5e5e]/40 group-focus-within:border-secondary transition-all pb-1">
                  <span className="text-secondary font-bold mr-2 text-xl tracking-tighter">&gt;</span>
                  <input id="passphrase-input" required disabled={isLoading} value={passphrase} onChange={(e) => setPassphrase(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 outline-none text-primary font-bold placeholder:text-primary/40 py-1 disabled:opacity-50" placeholder="••••••••" type="password" />
                  <span className="w-2.5 h-5 bg-secondary/40 hidden group-focus-within:block blink"></span>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button disabled={isLoading} className="btn-3d w-full bg-primary text-on-primary py-4 px-6 font-bold flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed" type="submit">
                <span className="uppercase tracking-tight text-base flex items-center gap-2">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full shrink-0"></span>
                      {isForgot ? 'SENDING_LINK...' : isLogin ? 'CONNECTING_TO_HOST...' : 'REGISTERING_OPERATOR...'}
                    </span>
                  ) : (
                    isForgot ? 'SEND RESET LINK' : isLogin ? 'AUTHENTICATE & ENTER' : 'REGISTER OPERATOR'
                  )}
                </span>
                <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
            
            {isForgot && (
              <div className="mt-4 text-center">
                <button type="button" disabled={isLoading} onClick={() => !isLoading && setIsForgot(false)} className="text-primary/80 hover:text-secondary text-xs uppercase font-bold tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  Back to Login
                </button>
              </div>
            )}
          </form>

          {/* OAUTH BLOCK */}
          <div className="mt-8 pt-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-grow border-t-2 border-[#5f5e5e]/15"></div>
              <span className="font-label text-[10px] font-bold text-primary/70 uppercase tracking-widest">Or Continue With</span>
              <div className="flex-grow border-t-2 border-[#5f5e5e]/15"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button aria-label="Sign in with Google" type="button" disabled={isLoading} onClick={() => !isLoading && googleLogin()} className="btn-3d-secondary w-full bg-[#fbf9f0] text-primary py-3 px-4 font-bold flex items-center justify-center gap-3 disabled:opacity-50">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span className="uppercase tracking-tight text-xs font-bold">Google</span>
              </button>
              <button aria-label="Sign in with GitHub" type="button" disabled={isLoading} onClick={() => !isLoading && window.location.assign(`https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email`)} className="btn-3d-secondary w-full bg-[#fbf9f0] text-primary py-3 px-4 font-bold flex items-center justify-center gap-3 disabled:opacity-50">
                <svg className="w-5 h-5 flex-shrink-0 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                <span className="uppercase tracking-tight text-xs font-bold">GitHub</span>
              </button>
            </div>
          </div>
        </section>

        <footer className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2 hidden sm:flex">
          <div className="flex gap-6">
            <span className="text-[11px] font-label text-tertiary font-bold tracking-tight">RLINKS ENCRYPTED ARCHIVE</span>
          </div>
          <div className="font-label text-[9px] text-primary/40 uppercase tracking-[0.2em]">
            Session Preserved // Ready
          </div>
        </footer>
      </main>
    </div>
  );
}
