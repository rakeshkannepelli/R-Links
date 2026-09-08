import { useState, useMemo, useEffect } from 'react';
import Icon3D, { getCategoryTheme, getCategoryStyle } from './Icon3D';

// Clean and reliable FQDN domain extractor
export function extractDomain(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let clean = rawUrl.trim().toLowerCase();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = 'https://' + clean;
  }
  try {
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    const match = clean.match(/https?:\/\/(?:www\.)?([^\/\s:]+)/i);
    return match ? match[1].toLowerCase() : '';
  }
}

// Strict Brand Logos: ONLY matched when domain is strictly identical or a direct subdomain
const STRICT_BRAND_LOGOS = {
  'github.com': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#1b1c17]">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  ),
  'youtube.com': (
    <svg viewBox="0 0 24 24" fill="#ff0000" className="w-full h-full">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  'google.com': (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  ),
  'x.com': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#1b1c17]">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  'twitter.com': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#1da1f2]">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z"/>
    </svg>
  ),
  'reddit.com': (
    <svg viewBox="0 0 24 24" fill="#ff4500" className="w-full h-full">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.56 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.56 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  ),
  'figma.com': (
    <svg viewBox="0 0 24 24" className="w-full h-full">
      <path fill="#0ACF83" d="M12 24a6 6 0 0 1-6-6 6 6 0 0 1 6-6h6v6a6 6 0 0 1-6 6z"/>
      <path fill="#A259FF" d="M6 18a6 6 0 0 1 6-6V6H6a6 6 0 0 0 0 12z"/>
      <path fill="#F24E1E" d="M6 6a6 6 0 0 1 6-6h6v6H6z"/>
      <path fill="#FF7262" d="M18 6V0h-6v6h6z"/>
      <path fill="#1ABCFE" d="M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0z"/>
    </svg>
  ),
  'spotify.com': (
    <svg viewBox="0 0 24 24" fill="#1ed760" className="w-full h-full">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  ),
  'notion.so': (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-[#1b1c17]">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.64c-.466-.373-.793-.42-1.68-.373L3.106 2.387c-.326.046-.28.28-.14.42zm.84 3.732v12.783c0 .886.42 1.166 1.4 1.073l13.822-.84c.98-.046 1.166-.606 1.166-1.306V6.96c0-.653-.28-.98-1.026-.933l-14.335.84c-.746.047-1.026.373-1.026 1.073zm13.402.793c.093.42 0 .84-.42.886l-.7.14v9.61c-1.026.56-1.96.84-2.8.84-1.26 0-1.633-.42-2.566-1.633l-4.153-6.44v6.58l1.353.28s0 .84-1.12.84l-3.36-.046c-.093-.373.187-.746.56-.84l.84-.186V9.293l-1.166-.093c-.093-.42 0-.84.42-.887l3.64-.233 4.526 6.953v-6.02l-1.166-.14c-.093-.42.093-.84.42-.886z"/>
    </svg>
  )
};

export default function WebsiteIcon({ url = '', icon = '', category = 'WORK', size = 'md', className = '' }) {
  const domain = useMemo(() => extractDomain(url), [url]);
  const categoryTheme = useMemo(() => getCategoryTheme(category), [category]);
  const categoryStyle = useMemo(() => getCategoryStyle(category), [category]);

  // Size configurations
  const sizeMap = {
    xs: { box: 'w-6 h-6 rounded-lg p-1 text-[10px]', img: 'w-4 h-4', icon3d: 'xs' },
    sm: { box: 'w-8 h-8 rounded-xl p-1 text-xs', img: 'w-5 h-5', icon3d: 'sm' },
    md: { box: 'w-10 h-10 rounded-2xl p-1.5 text-sm', img: 'w-6 h-6', icon3d: 'md' },
    lg: { box: 'w-12 h-12 rounded-2xl p-2 text-base', img: 'w-8 h-8', icon3d: 'lg' },
  };
  const currentSize = sizeMap[size] || sizeMap.md;

  // STRICT brand logo check - ONLY if domain matches exactly or is subdomain
  // e.g. "github.com" or "gist.github.com", NEVER substrings or empty domains
  const strictBrandSvg = useMemo(() => {
    if (!domain) return null;
    const matchKey = Object.keys(STRICT_BRAND_LOGOS).find(k => domain === k || domain.endsWith('.' + k));
    return matchKey ? STRICT_BRAND_LOGOS[matchKey] : null;
  }, [domain]);

  // Multi-tier authentic favicon source list:
  // 1. Explicit user/saved icon (if present)
  // 2. Google High-Res 128px Favicon service (most reliable worldwide CDN)
  // 3. DuckDuckGo Icon service
  const candidateSources = useMemo(() => {
    if (!domain) return [];
    const list = [];
    if (icon && typeof icon === 'string' && icon.startsWith('http')) {
      list.push(icon);
    }
    list.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);
    list.push(`https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`);
    return list;
  }, [domain, icon]);

  const [sourceIndex, setSourceIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  // Reset state when url or icon changes
  useEffect(() => {
    setSourceIndex(0);
    setAllFailed(false);
  }, [url, icon]);

  const handleImgError = () => {
    if (sourceIndex + 1 < candidateSources.length) {
      setSourceIndex(prev => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  // Case 1: Strict Brand Vector SVG
  if (strictBrandSvg) {
    return (
      <div 
        className={`relative inline-flex items-center justify-center bg-white border border-[#5f5e5e]/25 shadow-[2px_2px_0px_rgba(0,0,0,0.06)] shrink-0 overflow-hidden ${currentSize.box} ${className}`}
        title={domain || category}
      >
        <div className={`flex items-center justify-center ${currentSize.img}`}>
          {strictBrandSvg}
        </div>
      </div>
    );
  }

  // Case 2: If no domain or all authentic favicon sources failed, show authentic Domain Monogram Badge
  // NEVER show another company's icon!
  if (allFailed || !domain || candidateSources.length === 0) {
    if (domain) {
      const letter = domain.charAt(0).toUpperCase();
      return (
        <div 
          className={`relative inline-flex items-center justify-center font-black select-none border-2 shrink-0 shadow-[2px_2px_0px_rgba(0,0,0,0.08)] ${currentSize.box} ${categoryStyle.activeTab} ${className}`}
          title={domain}
        >
          <span>{letter}</span>
        </div>
      );
    }
    // Only if URL is totally empty, display category 3D icon
    return <Icon3D name={categoryTheme.name} theme={categoryTheme.theme} size={currentSize.icon3d} className={className} />;
  }

  // Case 3: Authentic live high-res Favicon from cascade
  const currentSrc = candidateSources[sourceIndex];

  return (
    <div 
      className={`relative inline-flex items-center justify-center bg-white border border-[#5f5e5e]/25 shadow-[2px_2px_0px_rgba(0,0,0,0.06)] shrink-0 overflow-hidden ${currentSize.box} ${className}`}
      title={domain || category}
    >
      <img
        key={currentSrc}
        src={currentSrc}
        alt={`${domain} icon`}
        loading="lazy"
        className={`object-contain select-none transition-transform group-hover:scale-110 ${currentSize.img}`}
        style={{
          imageRendering: '-webkit-optimize-contrast',
        }}
        onError={handleImgError}
      />
    </div>
  );
}
