import { useMemo, useRef } from 'react';
import useAppStore from '../store';
import toast from 'react-hot-toast';

export default function Profile() {
  const fileInputRef = useRef(null);
  const { total, tagsCount } = useAppStore(state => state.stats());
  // Compute level dynamically based on total links saved
  const computedLevel = Math.max(1, Math.floor(total / 3));
  
  const getRank = (level) => {
    if (level < 10) return 'Bronze Node';
    if (level < 25) return 'Silver Operative';
    if (level < 50) return 'Gold Curator';
    if (level < 100) return 'Platinum Arch';
    return 'Diamond Core';
  };

  const currentRank = getRank(computedLevel);

  const user = useAppStore(state => state.user) || { username: 'Alex_Protocol', level: computedLevel, role: 'Senior Link Architect' };
  const links = useAppStore(state => state.links);
  const updateUser = useAppStore(state => state.updateUser);

  const categoryCounts = useMemo(() => {
    const counts = links.reduce((acc, link) => {
      const cat = link.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [links]);

  const handleEditDetails = () => {
    toast((t) => (
      <form onSubmit={(e) => {
        e.preventDefault();
        updateUser({ username: e.target.username.value, role: e.target.role.value });
        toast.dismiss(t.id);
        toast.success('Details Updated');
      }} className="flex flex-col gap-3 p-2 bg-surface text-primary border-2 border-primary">
        <label className="text-[10px] uppercase font-bold tracking-widest text-primary/60">Modify Details</label>
        <input name="username" defaultValue={user.username || user.operatorId || 'Alex_Protocol'} className="bg-transparent border-b-2 border-primary/20 text-xs font-bold outline-none uppercase p-1 focus:border-secondary" placeholder="Operator ID"/>
        <input name="role" defaultValue={user.role || 'Senior Link Architect'} className="bg-transparent border-b-2 border-primary/20 text-xs font-bold outline-none uppercase p-1 focus:border-secondary" placeholder="Class/Role"/>
        <div className="flex gap-2">
            <button type="submit" className="bg-primary text-on-primary p-2 text-[10px] font-bold uppercase tracking-widest flex-1">Save</button>
            <button type="button" onClick={() => toast.dismiss(t.id)} className="border-2 border-primary p-2 text-[10px] font-bold uppercase tracking-widest flex-1">Cancel</button>
        </div>
      </form>
    ), { duration: Infinity });
  };

  const handleEditPhoto = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            updateUser({ photoUrl: reader.result });
            toast.success('Local Photo Updated');
        };
        reader.readAsDataURL(file);
    }
  };

  // Generate curation streak logic exactly mapped to last 30 days
  const contributionGrid = useMemo(() => {
    const pastDays = 30; // Monthly-like streak as requested
    const daysArray = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = pastDays - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        daysArray.push({
            date: d,
            count: 0,
            label: d.toLocaleDateString()
        });
    }

    links.forEach(l => {
        const d = new Date(l.date);
        d.setHours(0,0,0,0);
        const match = daysArray.find(day => day.date.getTime() === d.getTime());
        if (match) match.count += 1;
    });

    return daysArray.map(day => {
        let color = 'bg-surface-container-highest';
        if (day.count === 1) color = 'bg-secondary-container/30 border-secondary/20';
        else if (day.count > 1 && day.count <= 3) color = 'bg-secondary-container/60 border-secondary/40';
        else if (day.count > 3) color = 'bg-secondary border-secondary shadow-[0_0_10px_rgba(0,249,155,0.4)] z-10';
        
        return { color, count: day.count, label: day.label };
    });
  }, [links]);

  const monthName = new Date().toLocaleString('default', { month: 'long' }).toUpperCase();

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
      {/* Hidden File Input for Native Image Upload */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      
      {/* Left Column: Header Restructure */}
      <div className="md:col-span-12 space-y-8">
        <section className="bg-surface-container-highest p-6 border-2 border-primary relative">
          <div className="flex flex-col xl:flex-row items-center xl:items-start justify-between gap-6">
            {/* Profile Photo Left & Details */}
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-12 flex-grow">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative group cursor-pointer shrink-0" onClick={handleEditPhoto}>
                    <div className="w-32 h-32 border-2 border-primary p-1 bg-surface relative overflow-hidden flex items-center justify-center">
                      {user.photoUrl ? (
                        <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover mix-blend-luminosity opacity-80" />
                      ) : (
                        <span className="material-symbols-outlined text-6xl text-primary/40">person</span>
                      )}
                    </div>
                    <button className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white">add_a_photo</span>
                      <span className="text-white text-[10px] font-bold uppercase mt-1">Edit Photo</span>
                    </button>
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-primary leading-none">{user.username || user.operatorId || 'Alex_Protocol'}</h1>
                    <p className="text-secondary font-mono text-sm font-bold uppercase tracking-widest">{user.role || 'Senior Link Architect'}</p>
                    <button onClick={handleEditDetails} className="mt-2 px-5 py-2 border-2 border-primary bg-background text-primary font-mono text-[11px] uppercase tracking-[0.2em] hover:bg-primary hover:text-background transition-all flex items-center gap-2.5 shadow-[4px_4px_0px_#5f5e5e] active:shadow-none mx-auto sm:mx-0">
                      <span className="material-symbols-outlined text-sm">terminal</span>
                      MODIFY_DETAILS
                    </button>
                  </div>
              </div>
              
              {/* Category Breakdown (Most saved right beside photo) */}
              <div className="border border-primary/20 bg-surface/50 p-4 shrink-0 flex flex-col gap-2 min-w-[200px]">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 border-b-2 border-primary/10 pb-1 w-full flex justify-between">Top Categories <span className="material-symbols-outlined text-[12px]">dataset</span></span>
                 {categoryCounts.length > 0 ? categoryCounts.map(([cat, cnt]) => (
                     <div key={cat} className="flex justify-between items-center text-xs font-bold uppercase">
                         <span>[{cat}]</span>
                         <span className="text-secondary">{cnt} <span className="text-[9px] text-primary/40">RCORDS</span></span>
                     </div>
                 )) : (
                     <div className="text-xs text-primary/40 uppercase font-bold italic py-2">No Records Yet</div>
                 )}
              </div>
            </div>
            
            {/* Player Status Right */}
            <div className="w-full xl:w-80 space-y-4 pt-4 xl:pt-0 border-t-2 border-dashed border-primary/10 xl:border-none shrink-0">
              <div className="flex justify-between items-end border-b-2 border-primary/10 pb-2">
                <span className="text-3xl font-black text-primary tracking-tighter uppercase">LVL. {computedLevel}</span>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase block">Status_Active</span>
                  <span className="text-[10px] font-bold text-secondary uppercase block">Rank_{currentRank.replace(' ', '_')}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-bold uppercase tracking-tighter text-on-surface-variant">
                  <span>Experience_Points</span>
                  <span>{Math.min(100, Math.floor((total % 3) / 3 * 100))}%</span>
                </div>
                <div className="h-6 bg-surface border-2 border-primary relative overflow-hidden">
                  <div className="h-full bg-secondary-container border-r-2 border-primary shadow-[2px_0px_10px_rgba(0,249,155,0.4)] transition-all" style={{width: `${Math.min(100, Math.floor((total % 3) / 3 * 100))}%`}}></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-primary mix-blend-overlay">TNL: {3 - (total % 3)} Links</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Achievements Progression Map */}
      <div className="md:col-span-4">
        <section className="bg-surface p-6 border-2 border-primary h-full">
          <h3 className="font-black text-lg tracking-tighter uppercase mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">insights</span>
            Achievement Path
          </h3>
          <div className="relative flex px-2 sm:px-4 flex-row justify-between">
            {/* Visual Progression Map */}
            <div className="absolute left-4 right-4 top-[24px] h-0.5 border-t-2 border-dashed border-outline-variant z-0"></div>
            
            <div className={`relative z-10 flex items-center group flex-col gap-2 ${computedLevel >= 10 ? '' : 'opacity-40 grayscale'}`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-container-highest border-2 border-primary flex items-center justify-center group-hover:bg-secondary-container transition-colors shrink-0">
                <span className="material-symbols-outlined text-lg sm:text-xl text-outline">military_tech</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-secondary block">Lvl 10</span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tighter hidden sm:block">Silver Operative</span>
              </div>
            </div>
            
            <div className={`relative z-10 flex items-center group flex-col gap-2 ${computedLevel >= 25 ? '' : 'opacity-40 grayscale'}`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-container-highest border-2 border-primary flex items-center justify-center group-hover:bg-secondary-container transition-colors shadow-[4px_4px_0px_#006d41] shrink-0">
                <span className="material-symbols-outlined text-lg sm:text-xl text-primary" style={{fontVariationSettings: "'FILL' 1"}}>stars</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-secondary block">Lvl 25</span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tighter hidden sm:block">Gold Curator</span>
              </div>
            </div>
            
            <div className={`relative z-10 flex items-center group flex-col gap-2 ${computedLevel >= 50 ? '' : 'opacity-40 grayscale'}`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-container-highest border-2 border-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lg sm:text-xl text-outline">diamond</span>
              </div>
              <div className="text-center">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-on-surface-variant block">Lvl 50</span>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-tighter hidden sm:block">Diamond Core</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Right Column: Activity & Stats */}
      <div className="md:col-span-8 space-y-8">
        {/* Curation Streak */}
        <section className="bg-surface-container p-6 border-2 border-primary">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div>
              <h2 className="font-black text-xl tracking-tighter uppercase">Curation Streak</h2>
              <p className="text-xs sm:text-sm font-mono text-secondary">30-day activity matrix</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-3xl font-black text-primary">{total > 0 ? total : "0"}</span>
              <p className="text-[10px] font-bold uppercase text-on-surface-variant">TOTAL_CONTRIBUTIONS</p>
            </div>
          </div>
          
          <div className="overflow-x-auto no-scrollbar pb-4 -mx-2 px-2 md:mx-0 md:px-0">
            <div className="grid grid-flow-col grid-rows-5 gap-2 min-w-max">
              {contributionGrid.map((cell, i) => (
                <div key={i} title={`${cell.label}: ${cell.count} links`} className={`w-4 h-4 sm:w-5 sm:h-5 ${cell.color} border border-primary/5 hover:border-primary cursor-help transition-colors relative`}></div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4 text-[9px] sm:text-[10px] font-bold text-on-surface-variant uppercase">
            <span>{monthName} {new Date().getFullYear()}</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <span>Less</span>
              <div className="w-2 h-2 bg-surface-container-highest border border-primary/10"></div>
              <div className="w-2 h-2 bg-secondary-container/30 border border-primary/10"></div>
              <div className="w-2 h-2 bg-secondary-container/60 border border-primary/10"></div>
              <div className="w-2 h-2 bg-secondary border border-primary/10"></div>
              <span>More</span>
            </div>
            <span>CURRENT</span>
          </div>
        </section>

        {/* Taxonomy Section */}
        <section className="bg-surface p-6 border-2 border-primary">
          <h3 className="font-black text-lg tracking-tighter uppercase mb-6 border-b-2 border-primary pb-2 flex justify-between">
            Taxonomy
            <span className="material-symbols-outlined text-secondary">analytics</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 sm:p-6 bg-surface-container-low border border-primary flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">TOTAL_LINKS</span>
              <span className="text-2xl sm:text-3xl font-black text-primary tracking-tighter">{total}</span>
            </div>
            <div className="p-4 sm:p-6 bg-surface-container-low border border-primary flex flex-col justify-center items-center text-center">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase mb-1">CATEGORIES</span>
              <span className="text-2xl sm:text-3xl font-black text-primary tracking-tighter">{tagsCount > 0 ? tagsCount : 0}</span>
            </div>
          </div>
        </section>

        {/* Profile Action Footer */}
        <div className="flex flex-wrap gap-4 items-center justify-center pt-8 border-t-2 border-dashed border-outline-variant">
          <button onClick={() => {
              toast.success('Initiating complete telemetry export!');
              setTimeout(() => window.print(), 300);
          }} className="flex-1 sm:flex-none px-6 py-3 border-2 border-primary font-bold uppercase text-xs tracking-widest bg-surface hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">share</span>
            Export Profile
          </button>
        </div>
      </div>
    </div>
  );
}
