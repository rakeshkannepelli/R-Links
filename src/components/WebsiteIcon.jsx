import { useState } from 'react';
import Icon3D, { getCategoryTheme } from './Icon3D';

/**
 * WebsiteIcon.jsx
 * Renders the exact high-res icon provided by the website with zero distortion,
 * with progressive fallbacks to DuckDuckGo and Category 3D Icon.
 */
export default function WebsiteIcon({ url = '', icon = '', category = 'WORK', size = 'md', className = '' }) {
  const [errorStep, setErrorStep] = useState(0); // 0: primary (icon / google s2), 1: duckduckgo, 2: fallback to Icon3D

  let domain = '';
  try {
    if (url) {
      domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace('www.', '');
    }
  } catch {
    domain = '';
  }

  // Exact icon candidates
  const primaryIconUrl = icon || (domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '');
  const fallbackIconUrl = domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : '';

  // Size configurations
  const sizeMap = {
    xs: { box: 'w-6 h-6 rounded-md p-0.5', img: 'w-4 h-4', icon3d: 'xs' },
    sm: { box: 'w-8 h-8 rounded-lg p-1', img: 'w-5 h-5', icon3d: 'sm' },
    md: { box: 'w-10 h-10 rounded-xl p-1.5', img: 'w-6 h-6', icon3d: 'md' },
    lg: { box: 'w-12 h-12 rounded-xl p-2', img: 'w-8 h-8', icon3d: 'lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const { name, theme } = getCategoryTheme(category);

  if (errorStep >= 2 || (!primaryIconUrl && !domain)) {
    return <Icon3D name={name} theme={theme} size={currentSize.icon3d} className={className} />;
  }

  const activeSrc = errorStep === 0 ? primaryIconUrl : fallbackIconUrl;

  return (
    <div 
      className={`relative inline-flex items-center justify-center bg-white border border-[#5f5e5e]/25 shadow-[2px_2px_0px_rgba(0,0,0,0.06)] shrink-0 overflow-hidden ${currentSize.box} ${className}`}
      title={domain || category}
    >
      <img
        src={activeSrc}
        alt={domain ? `${domain} icon` : `${category} icon`}
        loading="lazy"
        className={`object-contain select-none transition-transform group-hover:scale-105 ${currentSize.img}`}
        style={{
          imageRendering: '-webkit-optimize-contrast',
        }}
        onError={() => setErrorStep(prev => prev + 1)}
      />
    </div>
  );
}
