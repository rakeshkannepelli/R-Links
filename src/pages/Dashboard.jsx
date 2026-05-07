import { Link } from 'react-router-dom';
import useAppStore from '../store';

const getIconForCategory = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('design')) return 'design_services';
  if (cat.includes('video') || cat.includes('stream')) return 'movie';
  if (cat.includes('music')) return 'music_note';
  if (cat.includes('code') || cat.includes('dev') || cat.includes('css')) return 'code';
  return 'article';
};

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function Dashboard() {
  const { total, pinned, tagsCount } = useAppStore(state => state.stats());
  const links = useAppStore(state => state.links).slice(0, 3);

  return (
    <>
      <section className="mt-8">
        <div className="flex items-start gap-4">
          <span className="text-secondary text-3xl font-bold mt-2">&gt;</span>
          <div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-primary uppercase leading-tight">
              Hey dev, ready to organize your links?<span className="cursor-blink"></span>
            </h2>
            <p className="mt-4 text-on-surface-variant font-medium tracking-tight max-w-2xl">
              Your personal digital common-place book. Curated, tagged, and indexed for high-performance retrieval.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3 md:gap-8 mt-12 mb-12">
        <div className="sticky-note bg-surface-container-highest p-3 md:p-4 border-2 border-primary flex flex-col justify-between aspect-square hover:bg-secondary-container">
          <div className="flex justify-between items-start">
            <span className="font-label text-[8px] md:text-[10px] font-bold tracking-widest opacity-60">RECORDS</span>
            <span className="material-symbols-outlined text-secondary scale-75 md:scale-90">link</span>
          </div>
          <div>
            <p className="text-xl md:text-5xl font-black tracking-tighter leading-none">{total}</p>
            <p className="text-[8px] md:text-[10px] font-bold mt-1 uppercase tracking-tighter">Indexed</p>
          </div>
        </div>

        <div className="sticky-note bg-surface-container-highest p-3 md:p-4 border-2 border-primary flex flex-col justify-between aspect-square hover:bg-secondary-container" style={{transform: "rotate(1.2deg)"}}>
          <div className="flex justify-between items-start">
            <span className="font-label text-[8px] md:text-[10px] font-bold tracking-widest opacity-60">SAVED</span>
            <span className="material-symbols-outlined text-secondary scale-75 md:scale-90" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
          </div>
          <div>
            <p className="text-xl md:text-5xl font-black tracking-tighter leading-none">{pinned}</p>
            <p className="text-[8px] md:text-[10px] font-bold mt-1 uppercase tracking-tighter">Pinned</p>
          </div>
        </div>

        <div className="sticky-note bg-surface-container-highest p-3 md:p-4 border-2 border-primary flex flex-col justify-between aspect-square hover:bg-secondary-container" style={{transform: "rotate(-0.8deg)"}}>
          <div className="flex justify-between items-start">
            <span className="font-label text-[8px] md:text-[10px] font-bold tracking-widest opacity-60">TAGS</span>
            <span className="material-symbols-outlined text-secondary scale-75 md:scale-90">label</span>
          </div>
          <div>
            <p className="text-xl md:text-5xl font-black tracking-tighter leading-none">{tagsCount}</p>
            <p className="text-[8px] md:text-[10px] font-bold mt-1 uppercase tracking-tighter">Unique</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface p-6 border-2 border-primary pixel-border">
            <h3 className="text-xl font-bold mb-6 tracking-tighter uppercase border-b-2 border-dashed border-outline-variant pb-2">Actions</h3>
            <div className="space-y-4">
              <Link to="/links">
                <button className="w-full bg-primary text-on-primary py-4 px-6 flex items-center justify-between group active:translate-y-0.5 duration-75">
                  <span className="font-bold tracking-tighter uppercase">Add New Link</span>
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">add_circle</span>
                </button>
              </Link>
              <Link to="/database" className="block w-full">
                <button className="w-full border-2 border-primary text-primary py-4 px-6 flex items-center justify-between hover:bg-surface-variant transition-colors active:translate-y-0.5 duration-75">
                  <span className="font-bold tracking-tighter uppercase">View All Archives</span>
                  <span className="material-symbols-outlined">database</span>
                </button>
              </Link>
            </div>
          </div>
          <div className="bg-tertiary text-on-tertiary p-6 border-2 border-primary pixel-border relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg tracking-tighter uppercase mb-2">Sync Status</h4>
              <p className="text-sm opacity-90 leading-snug">Everything is up to date. Local repository matches remote cloud storage.</p>
            </div>
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-10 rotate-12">sync</span>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white/40 border-2 border-primary p-6">
            <div className="flex justify-between items-end border-b-2 border-primary pb-3 mb-2">
              <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">Recent Activity</h3>
              <Link to="/database" className="text-tertiary text-xs font-bold underline decoration-wavy underline-offset-4 uppercase tracking-widest">Full Log</Link>
            </div>
            <div className="divide-y divide-outline-variant/30">
              {links.length === 0 ? (
                <div className="py-4 text-center text-primary/50 text-sm italic">No recent activity detected.</div>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="flex items-center gap-3 py-3 hover:bg-secondary-container/20 transition-all px-2">
                    <div className="w-10 h-10 bg-surface-container-highest border-2 border-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">{getIconForCategory(link.category)}</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-bold tracking-tight text-primary text-sm truncate">{link.title || link.url}</h4>
                      <div className="flex gap-3 mt-0.5 items-center">
                        <span className="text-[9px] font-bold text-secondary uppercase tracking-tighter bg-secondary/10 px-1.5 py-0">{link.category || 'Uncategorized'}</span>
                        <span className="text-[9px] font-bold text-tertiary uppercase tracking-tighter truncate max-w-[150px]">{new URL(link.url).hostname.replace('www.', '')}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold opacity-40 uppercase shrink-0">
                      {timeAgo(link.date)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

