import { useMemo, useRef, useState } from 'react';
import useAppStore from '../store';
import Icon3D, { getCategoryTheme } from '../components/Icon3D';
import toast from 'react-hot-toast';
import { 
  User, 
  Award, 
  Calendar, 
  Layers, 
  Camera, 
  Sparkles, 
  Flame, 
  Edit3, 
  Share2, 
  TrendingUp, 
  CheckCircle2,
  Shield
} from 'lucide-react';

export default function Profile() {
  const fileInputRef = useRef(null);
  const { total, tagsCount } = useAppStore(state => state.stats());
  
  // Dynamic Level computation
  const computedLevel = Math.max(1, Math.floor(total / 3));
  
  const getRank = (level) => {
    if (level < 5) return { title: 'Bronze Archivist', icon: 'award', theme: 'amber' };
    if (level < 15) return { title: 'Silver Curator', icon: 'award', theme: 'slate' };
    if (level < 35) return { title: 'Gold Strategist', icon: 'star', theme: 'amber' };
    if (level < 60) return { title: 'Platinum Architect', icon: 'sparkles', theme: 'purple' };
    return { title: 'Diamond Core', icon: 'sparkles', theme: 'cyan' };
  };

  const currentRank = getRank(computedLevel);

  const user = useAppStore(state => state.user) || { username: 'Vault_Operator', level: computedLevel, role: 'Chief Link Curator' };
  const links = useAppStore(state => state.links);
  const updateUser = useAppStore(state => state.updateUser);
  const dispatchBotEvent = useAppStore(state => state.dispatchBotEvent);

  const [hoveredCell, setHoveredCell] = useState(null);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // Dynamic Category Breakdown sorted by count
  const categoryCounts = useMemo(() => {
    const counts = links.reduce((acc, link) => {
      const cat = link.category || 'PERSONAL';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [links]);

  // Curation Activity Matrix mapped to last 35 days (5 rows x 7 cols)
  const { contributionGrid, totalMatrixLinks, activeDaysCount, maxInSingleDay } = useMemo(() => {
    const totalDays = 35; // 5 weeks of 7 days
    const daysArray = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      daysArray.push({
        date: d,
        count: 0,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
      });
    }

    links.forEach(l => {
      if (!l.date) return;
      const d = new Date(l.date);
      if (isNaN(d.getTime())) return;
      d.setHours(0, 0, 0, 0);
      const match = daysArray.find(day => day.date.getTime() === d.getTime());
      if (match) match.count += 1;
    });

    let totalLinks = 0;
    let activeDays = 0;
    let maxDay = 0;

    const cells = daysArray.map(day => {
      totalLinks += day.count;
      if (day.count > 0) activeDays += 1;
      if (day.count > maxDay) maxDay = day.count;

      let color = 'bg-[#e4e3da] border-[#5f5e5e]/20';
      let glow = '';
      if (day.count === 1) {
        color = 'bg-[#86efac] border-[#22c55e]';
      } else if (day.count >= 2 && day.count <= 4) {
        color = 'bg-[#00f99b] border-[#006d41]';
        glow = 'shadow-[0_0_8px_rgba(0,249,155,0.4)]';
      } else if (day.count > 4) {
        color = 'bg-[#006d41] border-[#002110] text-white';
        glow = 'shadow-[0_0_12px_rgba(0,249,155,0.7)]';
      }

      return { ...day, color, glow };
    });

    return {
      contributionGrid: cells,
      totalMatrixLinks: totalLinks,
      activeDaysCount: activeDays,
      maxInSingleDay: maxDay
    };
  }, [links]);

  const handleEditDetails = () => {
    setIsEditingDetails(true);
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    const username = e.target.username.value.trim();
    const role = e.target.role.value.trim();
    updateUser({ username, role });
    dispatchBotEvent('PROFILE_UPDATE');
    setIsEditingDetails(false);
    toast.success('Operator profile updated');
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
        dispatchBotEvent('PROFILE_UPDATE');
        toast.success('Avatar updated');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 page-enter pb-16">
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Hero Profile Deck */}
      <section className="card-3d p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-[#fbf9f0]">
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-8">
          {/* Avatar & Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full lg:w-auto">
            <div className="relative group cursor-pointer shrink-0" onClick={handleEditPhoto}>
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl border-2 border-[#5f5e5e] p-1.5 bg-[#f0eee5] relative overflow-hidden flex items-center justify-center shadow-[4px_4px_0_#006d41]">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <Icon3D name="user" theme="emerald" size="xl" />
                )}
              </div>
              <div className="absolute inset-0 bg-black/60 rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={22} className="text-white" />
                <span className="text-white text-[9px] font-mono font-bold uppercase mt-1">Change Avatar</span>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-2 flex-grow">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-[10px] font-mono font-black uppercase text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                  {currentRank.title}
                </span>
                <span className="text-[10px] font-mono text-primary/50 uppercase">
                  ACTIVE
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-primary leading-tight">
                {user.username || user.operatorId || 'Vault_Operator'}
              </h1>

              <p className="text-secondary font-mono text-xs sm:text-sm font-bold uppercase tracking-wider">
                {user.role || 'Chief Link Curator'}
              </p>

              <button 
                onClick={handleEditDetails} 
                className="btn-3d-secondary mt-3 px-4 py-2 bg-[#f0eee5] text-primary text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 mx-auto sm:mx-0"
              >
                <Edit3 size={14} className="text-secondary" />
                <span>Modify Operator Data</span>
              </button>
            </div>
          </div>

          {/* Level & Progression Deck */}
          <div className="w-full lg:w-80 space-y-4 pt-4 lg:pt-0 border-t-2 border-dashed border-[#5f5e5e]/20 lg:border-none shrink-0">
            <div className="flex justify-between items-end border-b-2 border-[#5f5e5e]/15 pb-2">
              <div>
                <span className="text-3xl font-black text-primary tracking-tight">
                  LVL. {computedLevel}
                </span>
                <p className="text-[10px] font-mono text-primary/60 uppercase">Curator Level</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-secondary uppercase block">
                  {total} TOTAL SAVED
                </span>
                <span className="text-[10px] font-mono text-primary/50 uppercase">
                  {3 - (total % 3)} TO NEXT LVL
                </span>
              </div>
            </div>

            {/* 3D Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-primary/70">
                <span>XP Progress</span>
                <span>{Math.min(100, Math.floor((total % 3) / 3 * 100))}%</span>
              </div>
              <div className="h-5 bg-[#f0eee5] border-2 border-[#5f5e5e]/30 rounded-xl overflow-hidden shadow-inner p-0.5 relative">
                <div 
                  className="h-full bg-gradient-to-r from-[#006d41] to-[#00f99b] rounded-lg shadow-sm transition-all duration-500" 
                  style={{ width: `${Math.max(8, Math.min(100, Math.floor((total % 3) / 3 * 100)))}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Curation Matrix & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Curation Matrix (Left 8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <section className="card-3d p-6 sm:p-7 rounded-3xl bg-[#fbf9f0] space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-[#5f5e5e]/15 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={18} className="text-[#006d41]" />
                  <h2 className="font-black text-xl uppercase tracking-tight">Curation Matrix</h2>
                </div>
                <p className="text-xs font-mono text-primary/60">
                  35-day activity telemetry synchronized with your vault
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="bg-[#f0eee5] border border-[#5f5e5e]/20 px-3 py-1 rounded-xl">
                  <span className="text-xl font-black text-secondary block leading-tight">{activeDaysCount}</span>
                  <span className="text-[9px] font-mono font-bold uppercase text-primary/60">ACTIVE DAYS</span>
                </div>
                <div className="bg-[#f0eee5] border border-[#5f5e5e]/20 px-3 py-1 rounded-xl">
                  <span className="text-xl font-black text-primary block leading-tight">{totalMatrixLinks}</span>
                  <span className="text-[9px] font-mono font-bold uppercase text-primary/60">WINDOW LINKS</span>
                </div>
              </div>
            </div>

            {/* 3D Curation Matrix Grid */}
            <div className="space-y-3">
              <div className="overflow-x-auto no-scrollbar pb-2">
                <div className="grid grid-flow-col grid-rows-5 gap-2.5 min-w-max p-2 bg-[#f0eee5] rounded-2xl border-2 border-[#5f5e5e]/20 shadow-inner">
                  {contributionGrid.map((cell, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg border-2 ${cell.color} ${cell.glow} cursor-pointer transition-all duration-200 transform hover:scale-125 hover:z-20 flex items-center justify-center`}
                      title={`${cell.label}: ${cell.count} links`}
                    >
                      {cell.count > 0 && (
                        <span className={`text-[9px] font-mono font-black ${cell.count > 4 ? 'text-white' : 'text-[#006d41]'}`}>
                          {cell.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Cell Tooltip Info */}
              <div className="flex justify-between items-center text-xs font-mono font-bold min-h-[24px]">
                <div className="text-secondary">
                  {hoveredCell ? (
                    <span>📅 {hoveredCell.label}: <strong className="text-primary">{hoveredCell.count} link{hoveredCell.count === 1 ? '' : 's'}</strong> stored</span>
                  ) : (
                    <span className="text-primary/40 font-normal">Hover any cell for daily contribution details</span>
                  )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-1.5 text-[10px] uppercase text-primary/60 font-mono">
                  <span>Less</span>
                  <div className="w-3 h-3 rounded bg-[#e4e3da] border border-[#5f5e5e]/20" />
                  <div className="w-3 h-3 rounded bg-[#86efac] border border-[#22c55e]" />
                  <div className="w-3 h-3 rounded bg-[#00f99b] border-[#006d41]" />
                  <div className="w-3 h-3 rounded bg-[#006d41] border-[#002110]" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </section>

          {/* Category Distribution Breakdown */}
          <section className="card-3d p-6 rounded-3xl bg-[#fbf9f0]">
            <h3 className="text-sm font-black uppercase tracking-wider text-primary border-b border-[#5f5e5e]/15 pb-2 mb-4 flex items-center justify-between">
              <span>Top Stored Categories</span>
              <Layers size={16} className="text-secondary" />
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryCounts.map(([cat, cnt]) => {
                const { name, theme, label } = getCategoryTheme(cat);
                const percent = Math.round((cnt / (total || 1)) * 100);
                return (
                  <div key={cat} className="p-3 bg-[#f0eee5] rounded-xl border border-[#5f5e5e]/20 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Icon3D name={name} theme={theme} size="xs" />
                      <span className="font-mono text-xs font-bold uppercase truncate">{cat || label}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-black text-secondary">{cnt}</span>
                      <span className="text-[10px] text-primary/50 ml-1">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right 4 Cols: Ranks & Milestones */}
        <div className="lg:col-span-4 space-y-6">
          <section className="card-3d p-6 rounded-3xl bg-[#fbf9f0] space-y-5">
            <h3 className="text-sm font-black uppercase tracking-wider text-primary border-b border-[#5f5e5e]/15 pb-2 flex items-center gap-2">
              <Award size={16} className="text-secondary" />
              <span>Rank Milestones</span>
            </h3>

            <div className="space-y-3">
              {[
                { title: 'Bronze Archivist', level: 1, theme: 'amber', icon: 'award' },
                { title: 'Silver Curator', level: 5, theme: 'slate', icon: 'award' },
                { title: 'Gold Strategist', level: 15, theme: 'amber', icon: 'star' },
                { title: 'Platinum Architect', level: 35, theme: 'purple', icon: 'sparkles' },
                { title: 'Diamond Core', level: 60, theme: 'cyan', icon: 'sparkles' }
              ].map((tier) => {
                const isUnlocked = computedLevel >= tier.level;
                return (
                  <div 
                    key={tier.title} 
                    className={`p-3 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isUnlocked 
                        ? 'bg-[#f0eee5] border-[#5f5e5e]/30 shadow-sm' 
                        : 'bg-[#f0eee5]/40 border-transparent opacity-40 grayscale'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon3D name={tier.icon} theme={tier.theme} size="sm" />
                      <div>
                        <span className="font-mono text-xs font-bold block">{tier.title}</span>
                        <span className="text-[10px] font-mono text-primary/60">Unlocks at Lvl {tier.level}</span>
                      </div>
                    </div>
                    {isUnlocked && (
                      <CheckCircle2 size={16} className="text-secondary shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Profile Export */}
          <button 
            onClick={() => {
              toast.success('Preparing profile summary');
              setTimeout(() => window.print(), 300);
            }} 
            className="btn-3d w-full bg-primary text-on-primary py-3.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <Share2 size={15} className="text-[#00f99b]" />
            <span>Export Profile Sheet</span>
          </button>
        </div>
      </div>

      {/* 3D Centered Modal Dialog */}
      {isEditingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm page-enter">
          <div className="card-3d p-6 rounded-2xl bg-[#fbf9f0] max-w-sm w-full space-y-4 shadow-[8px_8px_0_#006d41]">
            <div className="flex items-center justify-between border-b border-[#5f5e5e]/20 pb-2">
              <h3 className="font-bold text-sm uppercase tracking-wider text-secondary flex items-center gap-2">
                <Edit3 size={16} />
                Modify Operator ID
              </h3>
              <button 
                type="button" 
                onClick={() => setIsEditingDetails(false)} 
                className="text-primary/50 hover:text-primary font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveDetails} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-primary/70 mb-1">
                  Operator Name / Handle
                </label>
                <input 
                  name="username" 
                  required
                  defaultValue={user.username || user.operatorId || 'Vault_Operator'} 
                  className="w-full bg-[#f0eee5] border-2 border-[#5f5e5e]/30 rounded-xl text-xs font-bold p-2.5 outline-none uppercase focus:border-secondary" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-primary/70 mb-1">
                  Classification / Role
                </label>
                <input 
                  name="role" 
                  required
                  defaultValue={user.role || 'Chief Link Curator'} 
                  className="w-full bg-[#f0eee5] border-2 border-[#5f5e5e]/30 rounded-xl text-xs font-bold p-2.5 outline-none focus:border-secondary" 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsEditingDetails(false)} 
                  className="btn-3d-secondary py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase flex-1"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-3d bg-secondary text-white py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase flex-1"
                >
                  Save Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
