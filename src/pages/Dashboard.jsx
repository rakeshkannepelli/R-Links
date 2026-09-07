import { Link } from 'react-router-dom';
import useAppStore from '../store';
import Icon3D, { getCategoryTheme } from '../components/Icon3D';
import WebsiteIcon from '../components/WebsiteIcon';
import { PlusCircle, Database, ExternalLink, ArrowRight, Activity, ShieldCheck, Sparkles } from 'lucide-react';

const timeAgo = (date) => {
  if (!date) return 'Recently';
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
  const links = useAppStore(state => state.links).slice(0, 4);
  const isBackendOnline = useAppStore(state => state.isBackendOnline);

  return (
    <div className="space-y-10 page-enter">
      {/* Hero Welcome Header */}
      <section className="mt-4">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Icon3D name="sparkles" theme="emerald" size="md" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-[10px] tracking-widest text-[#006d41] uppercase font-bold bg-[#00f99b]/20 px-2 py-0.5 rounded border border-[#006d41]/30">
                SYSTEM OPERATIONAL
              </span>
              <span className="text-[10px] text-primary/50 font-mono hidden sm:inline">
                NODE_ENCRYPTED_VAULT
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-primary uppercase leading-tight">
              Ready to organize your links?<span className="cursor-blink"></span>
            </h2>
            <p className="mt-2 text-on-surface-variant font-medium tracking-tight max-w-2xl text-sm sm:text-base">
              Your personal high-performance digital library. Curated, tagged, and indexed with instant 3D tactile access.
            </p>
          </div>
        </div>
      </section>

      {/* 3D Tactile Stat Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="card-3d p-5 rounded-2xl flex flex-col justify-between aspect-[4/3] sm:aspect-square relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="font-label text-[10px] font-bold tracking-widest opacity-60 uppercase">TOTAL RECORDS</span>
            <Icon3D name="link" theme="emerald" size="sm" />
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-primary group-hover:text-secondary transition-colors">
              {total}
            </p>
            <p className="text-[10px] font-bold mt-2 uppercase tracking-wider text-secondary font-mono">
              Indexed in Vault
            </p>
          </div>
        </div>

        <div className="card-3d p-5 rounded-2xl flex flex-col justify-between aspect-[4/3] sm:aspect-square relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="font-label text-[10px] font-bold tracking-widest opacity-60 uppercase">SAVED & PINNED</span>
            <Icon3D name="star" theme="amber" size="sm" />
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-primary group-hover:text-amber-600 transition-colors">
              {pinned}
            </p>
            <p className="text-[10px] font-bold mt-2 uppercase tracking-wider text-amber-600 font-mono">
              Priority Resources
            </p>
          </div>
        </div>

        <div className="card-3d p-5 rounded-2xl flex flex-col justify-between aspect-[4/3] sm:aspect-square relative overflow-hidden group">
          <div className="flex justify-between items-start">
            <span className="font-label text-[10px] font-bold tracking-widest opacity-60 uppercase">CATEGORIES / TAGS</span>
            <Icon3D name="layers" theme="purple" size="sm" />
          </div>
          <div>
            <p className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-primary group-hover:text-purple-600 transition-colors">
              {tagsCount}
            </p>
            <p className="text-[10px] font-bold mt-2 uppercase tracking-wider text-purple-600 font-mono">
              Unique Classifiers
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid: Actions & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-8">
        {/* Actions Left Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-3d p-6 rounded-2xl">
            <h3 className="text-base font-bold mb-4 tracking-tight uppercase border-b-2 border-dashed border-[#5f5e5e]/20 pb-2 flex items-center justify-between">
              <span>Quick Actions</span>
              <Activity size={16} className="text-secondary" />
            </h3>
            
            <div className="space-y-3">
              <Link to="/links" className="block">
                <button className="btn-3d w-full bg-primary text-on-primary py-3.5 px-4 rounded-xl flex items-center justify-between group font-bold tracking-tight text-xs uppercase">
                  <span className="flex items-center gap-2">
                    <PlusCircle size={16} className="text-[#00f99b]" />
                    Archive New Link
                  </span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <Link to="/database" className="block">
                <button className="btn-3d-secondary w-full bg-[#fbf9f0] text-primary py-3.5 px-4 rounded-xl flex items-center justify-between hover:bg-[#f0eee5] transition-colors font-bold tracking-tight text-xs uppercase">
                  <span className="flex items-center gap-2">
                    <Database size={16} className="text-secondary" />
                    Open Vault Archive
                  </span>
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>

          {/* Sync Status Banner */}
          <div className="card-3d p-5 rounded-2xl bg-gradient-to-br from-[#006d41] to-[#00472a] text-white border-2 border-[#002110] relative overflow-hidden">
            <div className="relative z-10 space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#00f99b]" />
                <h4 className="font-bold text-sm tracking-wide uppercase">Vault Status</h4>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                {isBackendOnline 
                  ? 'All local links synchronized with secure cloud storage.' 
                  : 'Operating in local offline cache mode. Changes will sync automatically.'}
              </p>
            </div>
            {/* Background 3D Emblem */}
            <div className="absolute -right-3 -bottom-4 opacity-15 pointer-events-none">
              <Icon3D name="database" theme="emerald" size="xl" />
            </div>
          </div>
        </div>

        {/* Recent Activity Right Column */}
        <div className="lg:col-span-8">
          <div className="card-3d p-6 rounded-2xl">
            <div className="flex justify-between items-center border-b-2 border-[#5f5e5e]/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight uppercase">Recent Activity</h3>
                <span className="text-[10px] font-mono bg-secondary/15 text-secondary px-2 py-0.5 rounded-full font-bold">
                  {links.length} LATEST
                </span>
              </div>
              <Link to="/database" className="text-secondary text-xs font-bold hover:underline tracking-wider uppercase font-mono flex items-center gap-1">
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="divide-y divide-[#5f5e5e]/15">
              {links.length === 0 ? (
                <div className="py-12 text-center text-primary/50 text-sm flex flex-col items-center gap-3">
                  <Icon3D name="link" theme="slate" size="lg" />
                  <p className="font-mono">No links stored yet in database vault.</p>
                  <Link to="/links" className="text-xs font-bold text-secondary underline uppercase">
                    Add your first link →
                  </Link>
                </div>
              ) : (
                links.map((link) => {
                  const { name, theme } = getCategoryTheme(link.category);
                  let domain = '';
                  try {
                    domain = new URL(link.url).hostname.replace('www.', '');
                  } catch {
                    domain = link.url;
                  }

                  return (
                    <div key={link.id} className="flex items-center gap-3.5 py-3 hover:bg-[#00f99b]/10 transition-colors px-2 rounded-xl group">
                      <WebsiteIcon url={link.url} icon={link.icon} category={link.category} size="sm" />
                      
                      <div className="flex-grow min-w-0">
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="font-bold tracking-tight text-primary text-sm truncate hover:text-secondary flex items-center gap-1.5"
                        >
                          <span className="truncate">{link.title || link.url}</span>
                          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-secondary" />
                        </a>
                        <div className="flex gap-2 mt-1 items-center flex-wrap">
                          <span className="text-[9px] font-bold text-secondary uppercase tracking-tight bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20 font-mono">
                            {link.category || 'Uncategorized'}
                          </span>
                          <span className="text-[10px] font-medium text-primary/60 font-mono truncate max-w-[160px]">
                            {domain}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-primary/50 shrink-0 uppercase">
                        {timeAgo(link.date)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
