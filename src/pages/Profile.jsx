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
  Zap,
  Target
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
      const cat = (link.category || 'PERSONAL').trim().toUpperCase();
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [links]);

  // 1-Month (30 Days) Responsive Curation Matrix & Streak Calculation
  const { 
    monthDays, 
    activeDaysCount, 
    totalMonthLinks, 
    currentStreak, 
    bestStreak, 
    consistencyRate 
  } = useMemo(() => {
    const TOTAL_DAYS = 28; // Exactly 4 full 7-day weeks for a pristine 7-column calendar
    const daysArray = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      daysArray.push({
        date: d,
        dayNum: d.getDate(),
        weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        count: 0,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
      });
    }

    // Map user links to date cells
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

    const cells = daysArray.map(day => {
      totalLinks += day.count;
      if (day.count > 0) activeDays += 1;

      let color = 'bg-[#f0eee5] border-[#5f5e5e]/20 text-primary/40';
      let glow = '';
      if (day.count === 1) {
        color = 'bg-[#86efac] border-[#22c55e] text-[#006d41]';
      } else if (day.count >= 2 && day.count <= 4) {
        color = 'bg-[#00f99b] border-[#006d41] text-[#00472a]';
        glow = 'shadow-[0_0_8px_rgba(0,249,155,0.4)]';
      } else if (day.count > 4) {
        color = 'bg-[#006d41] border-[#002110] text-white';
        glow = 'shadow-[0_0_12px_rgba(0,249,155,0.6)]';
      }

      return { ...day, color, glow };
    });

    // Compute active consecutive streaks
    let current = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Check consecutive days ending today/yesterday
    for (let i = cells.length - 1; i >= 0; i--) {
      if (cells[i].count > 0) {
        current++;
      } else {
        // If today has 0 links yet, allow streak from yesterday
        if (i === cells.length - 1) continue;
        break;
      }
    }

    // Best streak in window
    for (let i = 0; i < cells.length; i++) {
      if (cells[i].count > 0) {
        tempStreak++;
        if (tempStreak > maxStreak) maxStreak = tempStreak;
      } else {
        tempStreak = 0;
      }
    }

    const rate = Math.round((activeDays / TOTAL_DAYS) * 100);

    return {
      monthDays: cells,
      activeDaysCount: activeDays,
      totalMonthLinks: totalLinks,
      currentStreak: current,
      bestStreak: Math.max(current, maxStreak),
      consistencyRate: rate
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

  const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-8 page-enter pb-16">
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

      {/* Hero Profile Deck */}
      <section className="card-3d p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-[#fbf9f0] border-2 border-[#5f5e5e]/25">
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
                  ACTIVE OPERATOR
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
                className="btn-3d-secondary mt-3 px-4 py-2 bg-[#f0eee5] text-primary text-xs font-mono font-bold uppercase tracking-wider rounded-xl flex items-center gap-2 mx-auto sm:mx-0 cursor-pointer"
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

      {/* Main Grid: Curation Matrix & Streak Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Simple, Clean, Small Curation Streak Widget (Left 8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <section className="card-3d p-5 rounded-2xl bg-[#fbf9f0] border-2 border-[#5f5e5e]/25 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-[#00f99b] fill-[#006d41]" />
                <h3 className="font-bold text-sm uppercase tracking-tight text-primary">
                  Activity Streak
                </h3>
              </div>

              <div className="flex items-center gap-1.5 bg-[#121417] text-[#00f99b] px-2.5 py-1 rounded-lg border border-[#00f99b]/40 font-mono text-xs font-black">
                <Flame size={12} className="fill-current" />
                <span>{currentStreak} DAY STREAK</span>
              </div>
            </div>

            {/* Clean compact dot row */}
            <div className="flex items-center justify-between gap-1.5 p-2.5 bg-[#f0eee5] rounded-xl border border-[#5f5e5e]/20 overflow-x-auto no-scrollbar">
              {monthDays.map((cell, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCell(cell)}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md border ${cell.color} ${cell.glow} transition-all duration-150 transform hover:scale-125 cursor-pointer shrink-0`}
                  title={`${cell.label}: ${cell.count} links`}
                />
              ))}
            </div>

            {/* Micro stats strip */}
            <div className="flex items-center justify-between text-[11px] font-mono text-primary/60 pt-0.5">
              <span>
                {hoveredCell ? (
                  <strong className="text-secondary">{hoveredCell.label}: {hoveredCell.count} saved</strong>
                ) : (
                  <span>{activeDaysCount} active days ({consistencyRate}% consistency)</span>
                )}
              </span>
              <span className="text-primary/40 font-bold">{totalMonthLinks} links this month</span>
            </div>
          </section>

          {/* Category Distribution Breakdown */}
          <section className="card-3d p-6 rounded-3xl bg-[#fbf9f0] border-2 border-[#5f5e5e]/25">
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
          <section className="card-3d p-6 rounded-3xl bg-[#fbf9f0] border-2 border-[#5f5e5e]/25 space-y-5">
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
            className="btn-3d w-full bg-primary text-on-primary py-3.5 px-4 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
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
                className="text-primary/50 hover:text-primary font-bold text-sm cursor-pointer"
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
                  className="btn-3d-secondary py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase flex-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-3d bg-secondary text-white py-2.5 px-4 rounded-xl text-xs font-mono font-bold uppercase flex-1 cursor-pointer"
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
