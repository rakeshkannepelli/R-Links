import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }

      toast.success(data.message || 'Password successfully updated!');
      navigate('/auth');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 dotted-grid w-full max-w-[100vw] overflow-x-hidden">
      <div className="grain-texture"></div>

      <main className="relative w-full max-w-lg z-10 transition-transform duration-300 hover:rotate-0 -rotate-1 pb-16">
        <section className="bg-surface-container-highest p-6 sm:p-8 md:p-12 border-2 border-primary/20 shadow-[20px_20px_60px_rgba(27,28,23,0.05)] relative overflow-hidden">
          <header className="mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tighter text-primary leading-none uppercase">
              RESET <br />
              <span className="text-secondary">PASSPHRASE</span>
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
            <div className="relative group">
              <label className="block font-label text-[10px] font-bold text-primary/50 mb-2 uppercase tracking-widest">
                [00] NEW PASSPHRASE
              </label>
              <div className="flex items-center border-b-2 border-primary/20 group-focus-within:border-secondary transition-all">
                <span className="text-secondary font-bold mr-2 text-xl tracking-tighter">&gt;</span>
                <input required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 outline-none text-primary font-bold placeholder:text-primary/20 py-2" placeholder="••••••••" type="password" />
                <span className="w-3 h-6 bg-secondary/30 hidden group-focus-within:block blink"></span>
              </div>
            </div>

            <div className="pt-4">
              <button disabled={isLoading} className="w-full bg-primary text-on-primary py-5 px-8 font-bold flex items-center justify-between group relative active:translate-y-1 active:shadow-none transition-all shadow-[6px_6px_0px_#00f99b] hover:bg-on-surface-variant disabled:opacity-50" type="submit">
                <span className="uppercase tracking-tighter text-lg">UPDATE PASSPHRASE</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">trending_flat</span>
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <Link to="/auth" className="text-primary/60 hover:text-secondary text-xs uppercase font-bold tracking-widest transition-colors">
                Back to Login
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
