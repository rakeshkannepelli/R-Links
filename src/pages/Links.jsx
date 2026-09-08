import { useState, useEffect } from 'react';
import useAppStore from '../store';
import Icon3D, { getCategoryTheme, getCategoryStyle } from '../components/Icon3D';
import WebsiteIcon, { extractDomain } from '../components/WebsiteIcon';
import RudeStingraySwitch from '../components/RudeStingraySwitch';
import toast from 'react-hot-toast';
import { 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  ArrowRight, 
  Link as LinkIcon, 
  Type, 
  Tag, 
  FolderPlus,
  Globe,
  Clipboard,
  X,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UNIVERSAL_CATEGORIES = [
  { id: 'AI TOOLS', label: 'AI Tools', icon: 'ai', theme: 'purple' },
  { id: 'WORK', label: 'Work', icon: 'work', theme: 'cyan' },
  { id: 'LEARNING', label: 'Learning', icon: 'learning', theme: 'indigo' },
  { id: 'DESIGN', label: 'Design', icon: 'design', theme: 'rose' },
  { id: 'DEV & TECH', label: 'Dev & Tech', icon: 'dev', theme: 'emerald' },
  { id: 'GAMING', label: 'Gaming', icon: 'gaming', theme: 'violet' },
  { id: 'MEDIA', label: 'Media', icon: 'media', theme: 'rose' },
  { id: 'SHOPPING', label: 'Shopping', icon: 'shopping', theme: 'amber' },
  { id: 'SOCIAL', label: 'Social', icon: 'social', theme: 'teal' },
  { id: 'LIFESTYLE', label: 'Lifestyle', icon: 'lifestyle', theme: 'cyan' },
  { id: 'PERSONAL', label: 'Personal', icon: 'personal', theme: 'slate' },
];

export default function Links() {
  const addLink = useAppStore(state => state.addLink);
  const links = useAppStore(state => state.links);
  const recentLinks = links.slice(0, 4);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('AI TOOLS');
  const [autoDetect, setAutoDetect] = useState(true);
  const [adding, setAdding] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Universal Smart Auto-Categorizer
  const detectCategory = (urlStr) => {
    try {
      const hostname = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`).hostname.toLowerCase();

      // Gaming & Esports
      if (hostname.includes('steam') || hostname.includes('epicgames') || hostname.includes('twitch') || 
          hostname.includes('roblox') || hostname.includes('riotgames') || hostname.includes('playstation') || 
          hostname.includes('xbox') || hostname.includes('nintendo') || hostname.includes('ign.com') || 
          hostname.includes('gamespot') || hostname.includes('chess.com') || hostname.includes('blizzard') || 
          hostname.includes('ea.com') || hostname.includes('gog.com')) {
        return 'GAMING';
      }
      // AI & Tools
      if (hostname.includes('openai') || hostname.includes('chatgpt') || hostname.includes('claude') || 
          hostname.includes('anthropic') || hostname.includes('huggingface') || hostname.includes('midjourney') || 
          hostname.includes('perplexity') || hostname.includes('gemini') || hostname.includes('copilot')) {
        return 'AI TOOLS';
      }
      // Dev & Tech
      if (hostname.includes('github') || hostname.includes('gitlab') || hostname.includes('stackoverflow') || 
          hostname.includes('npm') || hostname.includes('vercel') || hostname.includes('docker') || 
          hostname.includes('developer') || hostname.includes('w3schools') || hostname.includes('hashnode')) {
        return 'DEV & TECH';
      }
      // Work & Productivity
      if (hostname.includes('notion') || hostname.includes('slack') || hostname.includes('trello') || 
          hostname.includes('asana') || hostname.includes('jira') || hostname.includes('linear') || 
          hostname.includes('docs.google') || hostname.includes('figma') || hostname.includes('miro') || 
          hostname.includes('linkedin')) {
        return 'WORK';
      }
      // Learning & Study
      if (hostname.includes('coursera') || hostname.includes('udemy') || hostname.includes('edx') || 
          hostname.includes('wikipedia') || hostname.includes('medium') || hostname.includes('substack') || 
          hostname.includes('khanacademy') || hostname.includes('mit.edu') || hostname.includes('arxiv')) {
        return 'LEARNING';
      }
      // Design & Art
      if (hostname.includes('dribbble') || hostname.includes('behance') || hostname.includes('pinterest') || 
          hostname.includes('canva') || hostname.includes('artstation') || hostname.includes('unsplash') || 
          hostname.includes('coolors')) {
        return 'DESIGN';
      }
      // Media & Entertainment
      if (hostname.includes('youtube') || hostname.includes('spotify') || hostname.includes('netflix') || 
          hostname.includes('vimeo') || hostname.includes('soundcloud') || hostname.includes('disney') || 
          hostname.includes('music')) {
        return 'MEDIA';
      }
      // Shopping & Wishlist
      if (hostname.includes('amazon') || hostname.includes('ebay') || hostname.includes('etsy') || 
          hostname.includes('walmart') || hostname.includes('target') || hostname.includes('aliexpress') || 
          hostname.includes('shop')) {
        return 'SHOPPING';
      }
      // Social & Community
      if (hostname.includes('reddit') || hostname.includes('twitter') || hostname.includes('x.com') || 
          hostname.includes('instagram') || hostname.includes('facebook') || hostname.includes('threads') || 
          hostname.includes('discord') || hostname.includes('tiktok')) {
        return 'SOCIAL';
      }
      // Lifestyle & Travel
      if (hostname.includes('booking') || hostname.includes('airbnb') || hostname.includes('tripadvisor') || 
          hostname.includes('allrecipes') || hostname.includes('maps.google') || hostname.includes('uber') || 
          hostname.includes('health')) {
        return 'LIFESTYLE';
      }

      return 'PERSONAL';
    } catch {
      return 'PERSONAL';
    }
  };

  // Auto-detect category whenever URL changes
  useEffect(() => {
    if (autoDetect && url.trim().length > 6) {
      const detected = detectCategory(url);
      setSelectedCategory(detected);
    }
  }, [url, autoDetect]);

  const handleUrlChange = (val) => {
    setUrl(val);
    if (!title) {
      try {
        const clean = val.startsWith('http') ? val : `https://${val}`;
        const u = new URL(clean);
        const host = u.hostname.replace('www.', '');
        const path = u.pathname.split('/').filter(Boolean)[0] || '';
        const derived = host + (path ? ` / ${path}` : '');
        setTitle(derived);
      } catch {
        // typing incomplete URL
      }
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleUrlChange(text.trim());
        toast.success('Pasted URL from clipboard');
      }
    } catch {
      toast.error('Please paste manually using Ctrl+V');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    let cleanedUrl = url.trim();
    if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      cleanedUrl = `https://${cleanedUrl}`;
    }

    try {
      new URL(cleanedUrl);
    } catch {
      toast.error('Please enter a valid website URL');
      return;
    }

    setAdding(true);
    try {
      let finalTitle = title.trim();
      if (!finalTitle) {
        try {
          finalTitle = new URL(cleanedUrl).hostname.replace('www.', '');
        } catch {
          finalTitle = 'Saved Resource';
        }
      }

      const domain = extractDomain(cleanedUrl);
      const iconToSave = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';

      await addLink({
        url: cleanedUrl,
        title: finalTitle,
        category: selectedCategory,
        icon: iconToSave,
        tags: [selectedCategory.toLowerCase()],
        date: new Date().toISOString(),
        pinned: false
      });

      setUrl('');
      setTitle('');
      toast.success('Link successfully archived in Vault');
    } catch (err) {
      toast.error('Failed to save link');
    } finally {
      setAdding(false);
    }
  };

  const handleCopy = (id, urlToCopy) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedId(id);
    toast.success('Copied link');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const detectedDomain = extractDomain(url);

  return (
    <div className="max-w-4xl mx-auto space-y-10 page-enter pb-16">
      {/* Header */}
      <header className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-[10px] tracking-widest text-secondary font-bold uppercase bg-secondary/10 px-2.5 py-0.5 rounded border border-secondary/20">
            INGESTION TERMINAL
          </span>
          <span className="text-[10px] font-mono text-primary/50 uppercase">
            ANY LINK // INSTANT AUTHENTIC PREVIEW
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black uppercase text-primary tracking-tight leading-none mb-3">
          Add Resource Link
        </h1>
        <p className="text-xs sm:text-sm text-primary/70 font-medium max-w-xl leading-relaxed">
          Store any web resource in seconds. Smart AI detection automatically classifies and fetches verified authentic icons directly into your vault.
        </p>
      </header>

      {/* 3D Tactile Input Deck */}
      <section className="card-3d p-6 sm:p-8 rounded-3xl relative overflow-hidden bg-[#fbf9f0] border-2 border-[#5f5e5e]/30 shadow-[6px_6px_0px_#1b1c17]">
        {/* Header bar with Modern Physical Switch Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-[#5f5e5e]/20">
          <div className="flex items-center gap-2 text-secondary font-mono text-xs font-black uppercase tracking-wider">
            <FolderPlus size={16} />
            <span>LINK SPECIFICATIONS</span>
          </div>

          {/* Authentic Rude Stingray Uiverse Switch */}
          <div className="flex items-center gap-2.5 bg-[#f0eee5] border-2 border-[#5f5e5e]/30 px-3 py-1.5 rounded-2xl shadow-inner select-none">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary/70">
              SMART DETECT:
            </span>
            <RudeStingraySwitch
              checked={autoDetect}
              onChange={setAutoDetect}
              labelLeft="MANUAL"
              labelRight="AUTO"
            />
          </div>
        </div>

        <form onSubmit={handleAdd} className="space-y-6">
          {/* Website URL Input with Live Authentic Favicon Detection & Quick Paste */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="url-input" className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wide">
                <LinkIcon size={14} className="text-secondary" />
                <span>Website URL</span>
                <span className="text-red-500">*</span>
              </label>
              {detectedDomain ? (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-secondary flex items-center gap-1.5 bg-[#00f99b]/15 px-2.5 py-0.5 rounded-full border border-[#00f99b]/40">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                    <span>AUTHENTIC ICON ACTIVE</span>
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-[10px] font-mono font-bold text-primary/70 hover:text-secondary flex items-center gap-1 cursor-pointer transition-colors bg-[#f0eee5] hover:bg-[#e4e3da] px-2.5 py-1 rounded-lg border border-[#5f5e5e]/20"
                >
                  <Clipboard size={12} />
                  <span>PASTE CLIPBOARD</span>
                </button>
              )}
            </div>

            <div className="flex items-center bg-white border-2 border-[#5f5e5e]/30 rounded-2xl px-4 py-3 focus-within:border-secondary focus-within:shadow-[0_0_0_4px_rgba(0,249,155,0.18)] transition-all duration-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
              {url.trim() ? (
                <div className="mr-3 shrink-0">
                  <WebsiteIcon url={url} category={selectedCategory} size="sm" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#f0eee5] flex items-center justify-center mr-3 shrink-0 text-primary/50 border border-[#5f5e5e]/20">
                  <Globe size={18} />
                </div>
              )}
              <input
                id="url-input"
                required
                type="text"
                value={url}
                onChange={e => handleUrlChange(e.target.value)}
                placeholder="https://example.com/article, github repo, steam game, or tool..."
                className="w-full bg-transparent outline-none font-bold text-sm sm:text-base text-primary placeholder:text-primary/30"
              />
              {url.trim() && (
                <button
                  type="button"
                  onClick={() => { setUrl(''); setTitle(''); }}
                  className="p-1.5 text-primary/40 hover:text-primary hover:bg-[#f0eee5] rounded-lg transition-colors ml-2 shrink-0 cursor-pointer"
                  title="Clear input"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="title-input" className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wide">
                <Type size={14} className="text-secondary" />
                <span>Display Title (Optional)</span>
              </label>
              <span className="text-[10px] font-mono text-primary/50">AUTO-DERIVED IF BLANK</span>
            </div>

            <div className="flex items-center bg-white border-2 border-[#5f5e5e]/30 rounded-2xl px-4 py-3 focus-within:border-secondary focus-within:shadow-[0_0_0_4px_rgba(0,249,155,0.18)] transition-all duration-200 shadow-[3px_3px_0px_rgba(0,0,0,0.06)]">
              <div className="w-8 h-8 rounded-xl bg-[#f0eee5] flex items-center justify-center mr-3 shrink-0 text-primary/50 border border-[#5f5e5e]/20">
                <Type size={16} />
              </div>
              <input
                id="title-input"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Steam Community Hub, Notion Workspace, or Claude AI..."
                className="w-full bg-transparent outline-none font-bold text-sm text-primary placeholder:text-primary/30"
              />
              {title.trim() && (
                <button
                  type="button"
                  onClick={() => setTitle('')}
                  className="p-1.5 text-primary/40 hover:text-primary hover:bg-[#f0eee5] rounded-lg transition-colors ml-2 shrink-0 cursor-pointer"
                  title="Clear title"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Clean 3D Category Selector Chips with Distinct Theme Styling */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase tracking-wide">
                <Tag size={14} className="text-secondary" />
                <span>Select Category</span>
              </label>
              {autoDetect && (
                <span className="text-[10px] font-mono font-bold text-secondary bg-secondary/10 px-2.5 py-0.5 rounded-full border border-secondary/20 flex items-center gap-1.5">
                  <Sparkles size={11} />
                  <span>SMART CLASSIFIED: {selectedCategory}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
              {UNIVERSAL_CATEGORIES.map(cat => {
                const isSelected = selectedCategory === cat.id;
                const catStyle = getCategoryStyle(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setAutoDetect(false);
                      setSelectedCategory(cat.id);
                    }}
                    className={`p-2.5 rounded-xl border-2 flex items-center gap-2 transition-all duration-150 text-left font-mono text-[11px] font-bold uppercase truncate cursor-pointer ${
                      isSelected
                        ? `${catStyle.activeTab} -translate-y-0.5`
                        : `bg-[#f0eee5] border-[#5f5e5e]/20 text-primary/80 hover:bg-[#e4e3da] hover:border-[#5f5e5e]/40`
                    }`}
                  >
                    <Icon3D name={cat.icon} theme={catStyle.theme} size="xs" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Action — Tactile High-Contrast Button */}
          <div className="pt-4 flex justify-end">
            <button
              disabled={adding}
              type="submit"
              className="w-full sm:w-auto bg-[#121417] text-white hover:bg-black active:translate-y-0.5 font-black uppercase tracking-wider py-4 px-9 rounded-2xl flex items-center justify-center gap-3 text-sm shadow-[5px_5px_0px_#00f99b] border-2 border-[#121417] hover:shadow-[6px_6px_0px_#00f99b] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {adding ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-[#00f99b] border-t-transparent rounded-full" />
                  <span className="text-[#00f99b]">SAVING TO VAULT...</span>
                </>
              ) : (
                <>
                  <Plus size={18} className="text-[#00f99b]" />
                  <span>ARCHIVE LINK →</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Recently Archived Resources Preview with Authentic Favicons */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-black uppercase tracking-tight text-primary flex items-center gap-2">
            <span>Recently Added Entries</span>
            <span className="text-xs font-mono text-primary/50 font-normal">({recentLinks.length})</span>
          </h3>
          <Link to="/database" className="text-secondary text-xs font-mono font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
            <span>View Full Database</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentLinks.map((link) => {
            const catStyle = getCategoryStyle(link.category);
            const domain = extractDomain(link.url);
            const isCopied = copiedId === (link.id || link._id);

            return (
              <div key={link.id || link._id} className="card-3d p-4 rounded-2xl flex flex-col justify-between group bg-[#fbf9f0] border-2 border-[#5f5e5e]/25">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <WebsiteIcon url={link.url} icon={link.icon} category={link.category} size="sm" />
                      <div>
                        <span className={catStyle.flag}>
                          {link.category || catStyle.label}
                        </span>
                        <p className="text-[10px] font-mono text-primary/50 mt-0.5">{domain}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(link.id || link._id, link.url)}
                      className="p-1.5 hover:bg-[#5f5e5e]/10 text-primary/60 hover:text-primary rounded-lg transition-colors cursor-pointer"
                      title="Copy URL"
                    >
                      {isCopied ? <Check size={14} className="text-secondary font-bold" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <h4 className="font-bold text-sm text-primary line-clamp-2 mt-1">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-secondary">
                      {link.title || link.url}
                    </a>
                  </h4>
                </div>

                <div className="pt-3 mt-3 border-t border-[#5f5e5e]/15 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-primary/40 truncate max-w-[200px]">
                    {link.url}
                  </span>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d bg-[#00f99b] text-[#006d41] font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 uppercase"
                  >
                    <span>OPEN</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
