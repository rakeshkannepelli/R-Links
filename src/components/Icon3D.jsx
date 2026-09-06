import React from 'react';
import {
  Bot,
  Briefcase,
  BookOpen,
  Palette,
  Code2,
  Film,
  ShoppingBag,
  Users,
  Compass,
  Folder,
  Link as LinkIcon,
  ExternalLink,
  Pin,
  Trash2,
  Edit3,
  Copy,
  Check,
  Search,
  Plus,
  LogOut,
  Database,
  Home,
  User,
  Sparkles,
  Layers,
  Globe,
  Bookmark,
  ShieldCheck,
  Star,
  Share2,
  Heart,
  Terminal,
  PlaySquare,
  Flame,
  Activity,
  Award
} from 'lucide-react';

const ICON_MAP = {
  // Navigation & Core
  home: Home,
  database: Database,
  links: LinkIcon,
  link: LinkIcon,
  share: Share2,
  profile: User,
  user: User,
  logout: LogOut,
  search: Search,
  plus: Plus,
  pin: Pin,
  trash: Trash2,
  edit: Edit3,
  copy: Copy,
  check: Check,
  external: ExternalLink,
  star: Star,
  award: Award,
  activity: Activity,
  sparkles: Sparkles,
  layers: Layers,

  // Universal Simple Categories
  aitools: Bot,
  ai: Bot,
  work: Briefcase,
  learning: BookOpen,
  design: Palette,
  devtech: Code2,
  dev: Code2,
  tech: Code2,
  code: Terminal,
  media: Film,
  stream: PlaySquare,
  shopping: ShoppingBag,
  social: Users,
  lifestyle: Compass,
  personal: Folder,
  curated: Bookmark,
  verified: ShieldCheck,
};

// Theme presets for realistic 3D appearance
const THEMES = {
  emerald: {
    bg: 'from-[#00f99b] to-[#006d41]',
    shadow: 'shadow-[0_4px_0_#00472a,0_8px_16px_rgba(0,109,65,0.25)]',
    text: 'text-white',
    border: 'border-[#00e38d]/50',
    topHighlight: 'rgba(255,255,255,0.55)',
  },
  cyan: {
    bg: 'from-[#38bdf8] to-[#0284c7]',
    shadow: 'shadow-[0_4px_0_#0369a1,0_8px_16px_rgba(2,132,199,0.25)]',
    text: 'text-white',
    border: 'border-[#38bdf8]/50',
    topHighlight: 'rgba(255,255,255,0.6)',
  },
  purple: {
    bg: 'from-[#c084fc] to-[#7e22ce]',
    shadow: 'shadow-[0_4px_0_#581c87,0_8px_16px_rgba(126,34,206,0.25)]',
    text: 'text-white',
    border: 'border-[#c084fc]/50',
    topHighlight: 'rgba(255,255,255,0.6)',
  },
  amber: {
    bg: 'from-[#fbbf24] to-[#b45309]',
    shadow: 'shadow-[0_4px_0_#78350f,0_8px_16px_rgba(180,83,9,0.25)]',
    text: 'text-white',
    border: 'border-[#fbbf24]/50',
    topHighlight: 'rgba(255,255,255,0.6)',
  },
  rose: {
    bg: 'from-[#fb7185] to-[#be123c]',
    shadow: 'shadow-[0_4px_0_#881337,0_8px_16px_rgba(190,18,60,0.25)]',
    text: 'text-white',
    border: 'border-[#fb7185]/50',
    topHighlight: 'rgba(255,255,255,0.6)',
  },
  indigo: {
    bg: 'from-[#818cf8] to-[#4338ca]',
    shadow: 'shadow-[0_4px_0_#312e81,0_8px_16px_rgba(67,56,202,0.25)]',
    text: 'text-white',
    border: 'border-[#818cf8]/50',
    topHighlight: 'rgba(255,255,255,0.6)',
  },
  slate: {
    bg: 'from-[#94a3b8] to-[#475569]',
    shadow: 'shadow-[0_4px_0_#1e293b,0_8px_16px_rgba(71,85,105,0.25)]',
    text: 'text-white',
    border: 'border-[#cbd5e1]/50',
    topHighlight: 'rgba(255,255,255,0.5)',
  },
  teal: {
    bg: 'from-[#2dd4bf] to-[#0f766e]',
    shadow: 'shadow-[0_4px_0_#115e59,0_8px_16px_rgba(15,118,110,0.25)]',
    text: 'text-white',
    border: 'border-[#2dd4bf]/50',
    topHighlight: 'rgba(255,255,255,0.6)',
  }
};

const SIZES = {
  xs: { box: 'w-6 h-6 rounded-md', icon: 13 },
  sm: { box: 'w-8 h-8 rounded-lg', icon: 16 },
  md: { box: 'w-10 h-10 rounded-xl', icon: 20 },
  lg: { box: 'w-12 h-12 rounded-2xl', icon: 24 },
  xl: { box: 'w-16 h-16 rounded-3xl', icon: 32 }
};

export default function Icon3D({
  name = 'link',
  theme = 'emerald',
  size = 'md',
  className = '',
  iconClassName = '',
  badge = false
}) {
  const normalizedKey = (name || 'link').toLowerCase().replace(/[^a-z0-9]/g, '');
  const IconComponent = ICON_MAP[normalizedKey] || ICON_MAP[name] || LinkIcon;
  const themeObj = THEMES[theme] || THEMES.emerald;
  const sizeObj = SIZES[size] || SIZES.md;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none transition-all duration-200 transform-gpu hover:-translate-y-0.5 active:translate-y-0.5 group ${sizeObj.box} ${themeObj.shadow} ${className}`}
      style={{ perspective: '600px' }}
    >
      {/* 3D Base Cube / Plaque */}
      <div
        className={`absolute inset-0 rounded-[inherit] bg-gradient-to-b ${themeObj.bg} border ${themeObj.border} overflow-hidden`}
        style={{
          boxShadow: `inset 0 1.5px 0 ${themeObj.topHighlight}, inset 0 -2px 0 rgba(0,0,0,0.25)`,
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-gradient-to-tr from-transparent via-white/20 to-white/40" />
      </div>

      {/* Vector Icon */}
      <span className={`relative z-10 ${themeObj.text} drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] ${iconClassName}`}>
        <IconComponent size={sizeObj.icon} strokeWidth={2.4} />
      </span>

      {badge && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#fbf9f0] shadow-sm z-20" />
      )}
    </div>
  );
}

// Map universal simple categories to clean icons and 3D palettes
export function getCategoryTheme(category) {
  const cat = (category || '').toUpperCase().trim();
  
  if (cat.includes('AI') || cat.includes('BOT')) return { name: 'ai', theme: 'emerald', label: 'AI TOOLS' };
  if (cat.includes('WORK') || cat.includes('BUSINESS')) return { name: 'work', theme: 'amber', label: 'WORK' };
  if (cat.includes('LEARN') || cat.includes('STUDY') || cat.includes('EDU')) return { name: 'learning', theme: 'indigo', label: 'LEARNING' };
  if (cat.includes('DESIGN') || cat.includes('ART')) return { name: 'design', theme: 'purple', label: 'DESIGN' };
  if (cat.includes('DEV') || cat.includes('TECH') || cat.includes('CODE')) return { name: 'dev', theme: 'cyan', label: 'DEV & TECH' };
  if (cat.includes('MEDIA') || cat.includes('STREAM') || cat.includes('VIDEO')) return { name: 'media', theme: 'rose', label: 'MEDIA' };
  if (cat.includes('SHOP')) return { name: 'shopping', theme: 'amber', label: 'SHOPPING' };
  if (cat.includes('SOCIAL') || cat.includes('COMMUNITY')) return { name: 'social', theme: 'teal', label: 'SOCIAL' };
  if (cat.includes('LIFE') || cat.includes('TRAVEL')) return { name: 'lifestyle', theme: 'emerald', label: 'LIFESTYLE' };
  if (cat.includes('PERSON') || cat.includes('FINANCE')) return { name: 'personal', theme: 'slate', label: 'PERSONAL' };
  
  return { name: 'curated', theme: 'emerald', label: 'PERSONAL' };
}
