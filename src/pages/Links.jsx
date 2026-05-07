import { useState } from 'react';
import useAppStore from '../store';
import toast from 'react-hot-toast';

export default function Links() {
  const addLink = useAppStore(state => state.addLink);
  const links = useAppStore(state => state.links);
  const recentLinks = links.slice(0, 3);

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');

  const availableTags = ['WORK', 'STREAM', 'AI CHATBOT', 'DEV', 'SOCIAL'];

  const autoCategorize = (urlStr) => {
    try {
      const hostname = new URL(urlStr).hostname.toLowerCase();
      
      // DEV ecosystem
      if (hostname.includes('github') || hostname.includes('stackoverflow') || hostname.includes('gitlab') || hostname.includes('bitbucket') || hostname.includes('vercel') || hostname.includes('npmjs')) return 'DEV';
      
      // STREAM & MEDIA ecosystem
      if (hostname.includes('youtube') || hostname.includes('twitch') || hostname.includes('vimeo') || hostname.includes('netflix') || hostname.includes('spotify')) return 'STREAM';
      
      // AI & ML ecosystem
      if (hostname.includes('openai') || hostname.includes('anthropic') || hostname.includes('claude') || hostname.includes('huggingface') || hostname.includes('chatgpt') || hostname.includes('midjourney')) return 'AI CHATBOT';
      
      // SOCIAL ecosystem
      if (hostname.includes('twitter') || hostname.includes('bsky.app') || hostname.includes('linkedin') || hostname.includes('reddit') || hostname.includes('instagram') || hostname.includes('facebook') || hostname.includes('x.com')) return 'SOCIAL';
      
      // DESIGN ecosystem
      if (hostname.includes('figma') || hostname.includes('dribbble') || hostname.includes('behance') || hostname.includes('canva') || hostname.includes('pinterest') || hostname.includes('framer') || hostname.includes('awwwards')) return 'DESIGN';
      
      // WORK & PRODUCTIVITY ecosystem
      if (hostname.includes('notion') || hostname.includes('slack') || hostname.includes('trello') || hostname.includes('asana') || hostname.includes('jira') || hostname.includes('linear') || hostname.includes('google')) return 'WORK';
      
      // Fallback for unrecognized domains
      return 'WORK';
    } catch {
      return 'WORK';
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!url.startsWith('http')) {
      toast.error('Valid URL required');
      return;
    }

    setAdding(true);
    setTimeout(() => {
      const category = autoDetect ? autoCategorize(url) : selectedTag || 'WORK';
      addLink({
        url,
        title: title || `Entry: ${new URL(url).hostname}`,
        category,
        tags: [category.toLowerCase(), 'curated']
      });
      setUrl('');
      setTitle('');
      setSelectedTag('');
      setAdding(false);
      toast.success('Resource saved to database');
    }, 800);
  };

  return (
    <div className="mt-8 max-w-2xl mx-auto space-y-8 pb-16 relative">
      <header className="mb-12">
        <span className="text-[10px] font-bold tracking-[0.2em] uppercase bg-primary text-on-primary px-2 py-1 inline-block mb-4 shadow-[2px_2px_0px_#fbf9f0]">SESSION_ACTIVE: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '.')}</span>
        <h1 className="text-4xl md:text-5xl font-black uppercase text-primary tracking-tighter leading-none mb-4">CURATED_RESOURCES</h1>
        <p className="text-sm border-l-0 md:border-l-4 border-secondary pl-0 md:pl-3 text-on-surface-variant font-medium tracking-tight">
          A tactile digital manuscript for link archival. Every entry is preserved with metadata and automated categorization.
        </p>
      </header>

      {/* ADD NEW RESOURCE Form */}
      <section className="bg-surface-container p-6 md:p-8 border-2 border-primary/20 sticky-note relative -ml-2 -mr-2 md:mx-0 shadow-[8px_8px_0px_#5f5e5e] mb-12">
        <div className="absolute right-6 top-6 grid grid-cols-3 gap-1 opacity-20 hidden sm:grid">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 bg-primary"></div>
          ))}
        </div>
        <h2 className="text-[10px] font-black uppercase tracking-widest flex items-center text-secondary mb-6 relative z-10">
          ADD NEW RESOURCE
        </h2>

        <form onSubmit={handleAdd} className="space-y-8 relative z-10">
          <div className="flex bg-transparent border-b-2 border-primary pb-2 items-end">
            <span className="text-secondary font-black text-xl mr-3 mb-1">&gt;</span>
            <input
              required
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="paste your link here."
              className="w-full bg-transparent outline-none font-bold text-lg md:text-2xl placeholder:text-primary/30 tracking-tight text-primary placeholder:font-black pb-1"
            />
          </div>

          <div className="flex flex-col gap-6 w-full max-w-xs md:max-w-[200px] ml-auto pb-4 border-b border-primary/10">
            <button
              disabled={adding}
              type="submit"
              className="w-full bg-primary text-on-primary font-bold uppercase tracking-widest py-3 flex items-center justify-center gap-2 hover:bg-surface-variant hover:text-primary border-2 border-primary transition-all shadow-[4px_4px_0px_0px_rgba(95,94,94,0.4)] active:shadow-none active:translate-y-1"
            >
              <span className="relative z-10">{adding ? 'PROCESSING...' : 'SAVE >'}</span>
            </button>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60">AUTO-DETECT</span>
              <button type="button" onClick={() => setAutoDetect(!autoDetect)} className={`w-12 h-6 border-2 border-primary flex items-center p-0.5 transition-colors ${autoDetect ? 'bg-secondary-container' : 'bg-surface'}`}>
                <div className={`w-4 h-4 border border-primary transition-transform ${autoDetect ? 'bg-surface translate-x-[20px]' : 'bg-primary translate-x-0'}`}></div>
              </button>
            </div>

            <div className={`transition-all duration-300 ${autoDetect ? 'opacity-40 grayscale' : 'opacity-100'}`}>
              <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60 block mb-4">MANUAL OVERRIDE:</span>

              <div className="flex bg-transparent border-b border-primary pb-2 items-center mb-6 max-w-xs">
                <span className="text-secondary font-bold mr-3 text-sm">&gt;</span>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="RESOURCE_NAME"
                  className="w-full bg-transparent outline-none font-bold text-xs placeholder:text-primary/30 uppercase tracking-widest"
                  disabled={autoDetect}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => { if (!autoDetect) setSelectedTag(tag); }}
                    disabled={autoDetect}
                    className={`px-3 py-1.5 text-[9px] font-bold uppercase border-2 transition-all ${selectedTag === tag ? 'bg-primary border-primary text-surface' : 'bg-surface border-primary text-primary hover:bg-primary/5'}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Link Cards Feed */}
      <div className="space-y-6 md:space-y-10 mt-8 relative z-10">
        {recentLinks.map((link, i) => {
          // Replicate exactly: Title, desc, then link

          // Randomly rotate to feel analogue
          const rotClass = i % 2 === 0 ? '-rotate-[0.5deg]' : 'rotate-[0.5deg]';

          let badgeColor = 'bg-primary text-on-primary';
          if (link.category === 'DEV') badgeColor = 'bg-[#006d41] text-white';
          else if (link.category === 'STREAM') badgeColor = 'bg-[#5f5e5e] text-white';
          else if (link.category === 'AI CHATBOT') badgeColor = 'bg-[#015dce] text-white';
          else if (link.category === 'WORK') badgeColor = 'bg-[#00f99b] text-[#1b1c17] font-black';
          else if (link.category === 'SOCIAL') badgeColor = 'bg-[#c8c6c5] text-[#1b1c17]';
          else if (link.category === 'DESIGN') badgeColor = 'bg-[#00f99b] text-black font-black';

          let iconBgColor = 'bg-[#1b1c17] text-white';
          if (link.category === 'AI CHATBOT') iconBgColor = 'bg-[#1b1c17] text-[#015dce]';
          else if (link.category === 'WORK') iconBgColor = 'bg-white text-[#1b1c17]';
          else if (link.category === 'SOCIAL') iconBgColor = 'bg-[#015dce] text-white';

          // Icons map
          let iconSymbol = 'draft';
          if (link.category === 'DEV') iconSymbol = 'hexagon';
          else if (link.category === 'STREAM') iconSymbol = 'chat_bubble';
          else if (link.category === 'AI CHATBOT') iconSymbol = 'radio_button_unchecked';
          else if (link.category === 'WORK') iconSymbol = 'article';
          else if (link.category === 'SOCIAL') iconSymbol = 'cloud';
          else if (link.category === 'DESIGN') iconSymbol = 'palette';

          // Generate jagged SVG pattern path
          const jaggedPattern = encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 10' preserveAspectRatio='none'><polygon points='0,0 100,0 100,8 90,10 80,6 70,10 60,7 50,10 40,5 30,10 20,7 10,10 0,6' fill='#fbf9f0'/></svg>`);

          return (
            <div key={link.id} className="relative group transition-all duration-300 hover:scale-[1.01] z-10 -ml-2 -mr-2 md:mx-0">
              <div className={`bg-surface-container p-6 md:p-8 relative ${rotClass} border-x-2 border-t-2 border-primary/10 shadow-sm`}>
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-8 h-8 border border-primary flex items-center justify-center p-1.5 ${iconBgColor}`}>
                    <span className="material-symbols-outlined text-sm">{iconSymbol}</span>
                  </div>
                  <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 ${badgeColor}`}>
                    {link.category}
                  </span>
                </div>

                <h3 className="font-bold text-lg md:text-xl leading-tight mb-3 text-primary pr-4">{link.title}</h3>

                <p className="text-xs md:text-sm text-primary/60 mb-8 max-w-sm tracking-tight leading-relaxed line-clamp-2">{link.description || `Exploring the upcoming features of the next major ${link.category} resources and how it impacts standard deployments within the current ecosystem framework over multiple nodes.`}</p>

                <div className="flex justify-between items-end border-t border-primary/10 pt-4 relative">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[10px] sm:text-[11px] font-bold uppercase text-primary/40 hover:text-secondary transition-colors tracking-widest truncate max-w-[200px] sm:max-w-xs">
                    {new URL(link.url).hostname} / {link.url.split('/').pop().substring(0, 15) || 'home'}
                  </a>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-primary/60 hover:text-primary">
                    <span className="material-symbols-outlined text-lg">arrow_outward</span>
                  </a>
                </div>
              </div>
              {/* Ripped Bottom Edge via pseudo-element simulation */}
              <div className={`absolute bottom-0 left-0 w-full h-4 z-20 translate-y-[90%] ${rotClass}`} style={{ backgroundImage: `url("data:image/svg+xml,${jaggedPattern}")`, backgroundRepeat: 'repeat-x', backgroundSize: '40px 10px' }}></div>
            </div>
          )
        })}

        {/* Placeholder dashed box at bottom */}
        <div className="border-2 border-dashed border-secondary/40 p-8 text-center text-primary/20 uppercase font-bold text-[10px] tracking-widest flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">add</span>
          </div>
          APPEND NEW ENTRY
        </div>
      </div>
    </div>
  );
}
