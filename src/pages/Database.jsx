import { useState, useMemo } from 'react';
import useAppStore from '../store';
import Icon3D, { getCategoryTheme, getCategoryStyle } from '../components/Icon3D';
import WebsiteIcon from '../components/WebsiteIcon';
import SkeletonCard from '../components/SkeletonCard';
import toast from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  ExternalLink, 
  Copy, 
  Check, 
  Pin, 
  Trash2, 
  Edit3, 
  LayoutGrid, 
  List, 
  ArrowUpDown, 
  X,
  Sparkles,
  Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Database() {
  const links = useAppStore(state => state.links);
  const deleteLink = useAppStore(state => state.deleteLink);
  const updateLink = useAppStore(state => state.updateLink);
  const togglePin = useAppStore(state => state.togglePin);
  const isLinksLoading = useAppStore(state => state.isLinksLoading);
  const total = useAppStore(state => state.stats().total);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('pinned_first'); // 'pinned_first' | 'newest' | 'alphabetical'
  const [copiedId, setCopiedId] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 6 : 10;

  // Inline Edit State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Category list with accurate counts
  const categoryCounts = useMemo(() => {
    const counts = { ALL: links.length, PINNED: 0 };
    links.forEach(l => {
      if (l.pinned) counts.PINNED += 1;
      const cat = (l.category || 'UNCATEGORIZED').toUpperCase();
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [links]);

  const availableCategories = ['ALL', 'PINNED', 'AI TOOLS', 'WORK', 'LEARNING', 'DESIGN', 'DEV & TECH', 'MEDIA', 'SHOPPING', 'SOCIAL', 'LIFESTYLE', 'PERSONAL'];

  // Filter and Sort Pipeline
  const filteredLinks = useMemo(() => {
    let result = links.filter(l => {
      const q = search.toLowerCase();
      const matchesSearch = (l.title || '').toLowerCase().includes(q) ||
        (l.url || '').toLowerCase().includes(q) ||
        (l.category || '').toLowerCase().includes(q) ||
        (l.tags || []).some(t => t.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (filterCategory === 'ALL') return true;
      if (filterCategory === 'PINNED') return Boolean(l.pinned);
      return (l.category || '').toUpperCase() === filterCategory;
    });

    return result.sort((a, b) => {
      if (sortBy === 'pinned_first') {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.date || 0) - new Date(a.date || 0);
      }
      if (sortBy === 'newest') {
        return new Date(b.date || 0) - new Date(a.date || 0);
      }
      if (sortBy === 'alphabetical') {
        return (a.title || a.url).localeCompare(b.title || b.url);
      }
      return 0;
    });
  }, [links, search, filterCategory, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLinks = filteredLinks.slice(startIndex, startIndex + itemsPerPage);

  const handleCopy = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleEditInit = (link) => {
    setEditingId(link.id || link._id);
    setEditTitle(link.title || '');
    setEditUrl(link.url || '');
    setEditCategory((link.category || 'WORK').toUpperCase());
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    await updateLink(editingId, { title: editTitle, url: editUrl, category: editCategory });
    setEditingId(null);
    toast.success('Resource updated');
  };

  const handleDelete = (id, title) => {
    if (window.confirm(`Delete entry "${title || 'this link'}"?`)) {
      deleteLink(id);
      toast.success('Resource deleted from vault');
    }
  };

  return (
    <div className="w-full space-y-8 page-enter pb-16">
      {/* Header Stats & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mt-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[10px] tracking-widest text-secondary font-bold uppercase bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
              DATABASE VAULT
            </span>
            <span className="text-[10px] font-mono text-primary/50 uppercase">
              ENCRYPTED INDEX
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase text-primary tracking-tight leading-none">
            Stored Link Archives
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-primary/70 font-medium">
            Search, sort, and access your curated resources with instant 3D tactile controls.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link to="/links" className="w-full md:w-auto">
            <button className="btn-3d w-full bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold font-label text-xs tracking-wider flex items-center justify-center gap-2 uppercase">
              <Plus size={16} className="text-[#00f99b]" />
              <span>New Link</span>
            </button>
          </Link>
        </div>
      </div>

      {/* 3D Search Deck & Filters */}
      <div className="card-3d p-4 sm:p-5 rounded-2xl space-y-4">
        {/* Search Bar */}
        <div className="relative flex items-center">
          <span className="absolute left-4 text-secondary">
            <Search size={18} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search resources by title, domain, keywords..."
            className="w-full bg-[#f0eee5] border-2 border-[#5f5e5e]/20 rounded-xl pl-12 pr-10 py-3 text-sm sm:text-base font-bold text-primary placeholder:text-primary/30 outline-none focus:border-secondary transition-all shadow-inner"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 p-1.5 hover:bg-[#5f5e5e]/10 rounded-lg text-primary/50 hover:text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* View Switcher, Sort & Counters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#5f5e5e]/15">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-primary/70">
              SHOWING <span className="text-secondary">{filteredLinks.length}</span> OF <span className="text-primary">{total}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-[#f0eee5] border border-[#5f5e5e]/20 rounded-lg px-2 py-1 text-xs">
              <ArrowUpDown size={13} className="text-secondary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-bold uppercase text-primary outline-none cursor-pointer"
              >
                <option value="pinned_first">Pinned First</option>
                <option value="newest">Newest First</option>
                <option value="alphabetical">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-[#5f5e5e]/25 rounded-lg overflow-hidden p-0.5 bg-[#f0eee5]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#fbf9f0] text-secondary shadow-sm font-bold' : 'text-primary/50 hover:text-primary'}`}
                title="Tactile 3D Cards View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#fbf9f0] text-secondary shadow-sm font-bold' : 'text-primary/50 hover:text-primary'}`}
                title="Compact Scanner View"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* 3D Category Pills Filter */}
        <div className="flex flex-wrap gap-2 pt-2 overflow-x-auto no-scrollbar">
          {availableCategories.map(cat => {
            const count = categoryCounts[cat] || 0;
            const isSelected = filterCategory === cat;
            const catStyle = getCategoryStyle(cat);
            return (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 rounded-xl text-[10px] sm:text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? `${catStyle.activeTab} -translate-y-0.5`
                    : 'bg-[#f0eee5] text-primary/70 border border-[#5f5e5e]/20 hover:bg-[#e4e3da] hover:text-primary'
                }`}
              >
                <span>{cat}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] ${isSelected ? 'bg-black/20 text-white' : 'bg-[#5f5e5e]/15 text-primary/60'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Edit Modal Overlay / Inline Form */}
      {editingId && (
        <form onSubmit={handleSaveEdit} className="card-3d p-6 rounded-2xl border-2 border-secondary bg-[#fbf9f0] space-y-4 page-enter">
          <div className="flex items-center justify-between border-b border-[#5f5e5e]/20 pb-2">
            <h3 className="font-bold text-sm uppercase tracking-wider text-secondary flex items-center gap-2">
              <Edit3 size={16} />
              Edit Stored Resource
            </h3>
            <button type="button" onClick={() => setEditingId(null)} className="text-primary/50 hover:text-primary">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-mono uppercase font-bold text-primary/60 mb-1">Title</label>
              <input 
                required 
                type="text" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                className="w-full bg-[#f0eee5] border border-[#5f5e5e]/30 rounded-lg p-2 text-sm font-bold outline-none focus:border-secondary" 
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-[10px] font-mono uppercase font-bold text-primary/60 mb-1">URL</label>
              <input 
                required 
                type="url" 
                value={editUrl} 
                onChange={(e) => setEditUrl(e.target.value)} 
                className="w-full bg-[#f0eee5] border border-[#5f5e5e]/30 rounded-lg p-2 text-sm font-mono outline-none focus:border-secondary" 
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-[10px] font-mono uppercase font-bold text-primary/60 mb-1">Category</label>
              <input 
                required 
                type="text" 
                value={editCategory} 
                onChange={(e) => setEditCategory(e.target.value.toUpperCase())} 
                className="w-full bg-[#f0eee5] border border-[#5f5e5e]/30 rounded-lg p-2 text-sm font-bold uppercase outline-none focus:border-secondary" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditingId(null)} className="btn-3d-secondary px-4 py-1.5 rounded-lg text-xs font-bold uppercase">
              Cancel
            </button>
            <button type="submit" className="btn-3d bg-secondary text-white px-5 py-1.5 rounded-lg text-xs font-bold uppercase">
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Loading Skeleton States */}
      {isLinksLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredLinks.length === 0 ? (
        /* Empty State */
        <div className="card-3d p-12 rounded-2xl text-center space-y-4 flex flex-col items-center justify-center">
          <Icon3D name="search" theme="slate" size="lg" />
          <h3 className="font-bold text-lg uppercase tracking-tight text-primary">No Matching Records Found</h3>
          <p className="text-xs text-primary/60 max-w-sm">
            Try adjusting your search terms or selecting a different category filter.
          </p>
          <button 
            onClick={() => { setSearch(''); setFilterCategory('ALL'); }}
            className="btn-3d px-4 py-2 bg-[#f0eee5] text-xs font-bold uppercase rounded-xl"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* ═══════════════ REALISTIC 3D CARDS GRID ═══════════════ */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedLinks.map((link) => {
            const { name, theme } = getCategoryTheme(link.category);
            let domain = '';
            try {
              domain = new URL(link.url).hostname.replace('www.', '');
            } catch {
              domain = link.url;
            }

            const isCopied = copiedId === (link.id || link._id);
            const catStyle = getCategoryStyle(link.category);

            return (
              <div 
                key={link.id || link._id} 
                className={`card-3d p-5 rounded-2xl flex flex-col justify-between relative group ${link.pinned ? 'border-amber-600/40 ring-1 ring-amber-500/20' : ''}`}
              >
                {/* Top Badge & Pin Indicator */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <WebsiteIcon url={link.url} icon={link.icon} category={link.category} size="md" />
                    <div className="min-w-0">
                      <span className={`text-[9px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md border inline-block truncate ${catStyle.badge}`}>
                        {link.category || catStyle.label}
                      </span>
                      <p className="text-[10px] font-mono text-primary/60 truncate mt-0.5">
                        {domain}
                      </p>
                    </div>
                  </div>

                  {/* Pin Toggle Button */}
                  <button
                    onClick={() => togglePin(link.id || link._id)}
                    className={`p-1.5 rounded-lg border transition-all ${
                      link.pinned 
                        ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm' 
                        : 'bg-[#f0eee5] text-primary/40 hover:text-amber-600 border-transparent'
                    }`}
                    title={link.pinned ? 'Unpin Link' : 'Pin to Top'}
                  >
                    <Pin size={14} className={link.pinned ? 'fill-current' : ''} />
                  </button>
                </div>

                {/* Resource Title & Monospace Link Preview */}
                <div className="my-2 space-y-1.5 flex-grow">
                  <h3 className="font-black text-base text-primary leading-snug line-clamp-2 group-hover:text-secondary transition-colors">
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.title || link.url}
                    </a>
                  </h3>
                  <p className="text-[11px] font-mono text-primary/50 truncate">
                    {link.url}
                  </p>
                </div>

                {/* 3D Action Strip */}
                <div className="pt-4 mt-3 border-t border-[#5f5e5e]/15 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Direct Launch Button */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-3d bg-[#00f99b] text-[#006d41] font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 hover:brightness-105 uppercase tracking-wider"
                      title="Open in new tab"
                    >
                      <span>OPEN</span>
                      <ExternalLink size={12} />
                    </a>

                    {/* Quick Copy Button */}
                    <button
                      onClick={() => handleCopy(link.id || link._id, link.url)}
                      className="btn-3d-secondary bg-[#fbf9f0] p-1.5 rounded-lg text-primary hover:text-secondary"
                      title="Copy URL"
                    >
                      {isCopied ? <Check size={14} className="text-secondary font-bold" /> : <Copy size={14} />}
                    </button>
                  </div>

                  {/* Edit & Delete Controls */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditInit(link)}
                      className="p-1.5 hover:bg-[#5f5e5e]/10 text-primary/60 hover:text-primary rounded-lg"
                      title="Edit Link"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id || link._id, link.title)}
                      className="p-1.5 hover:bg-red-50 text-primary/60 hover:text-red-600 rounded-lg"
                      title="Delete Link"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ═══════════════ COMPACT SCANNER LIST VIEW ═══════════════ */
        <div className="card-3d rounded-2xl overflow-hidden divide-y divide-[#5f5e5e]/15">
          {paginatedLinks.map((link) => {
            const { name, theme } = getCategoryTheme(link.category);
            const catStyle = getCategoryStyle(link.category);
            const isCopied = copiedId === (link.id || link._id);
            return (
              <div 
                key={link.id || link._id} 
                className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-[#00f99b]/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <WebsiteIcon url={link.url} icon={link.icon} category={link.category} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${catStyle.badge}`}>
                        {link.category || catStyle.label}
                      </span>
                      {link.pinned && (
                        <span className="text-[9px] font-mono font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Pin size={10} className="fill-current" /> PINNED
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-primary truncate">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-secondary">
                          {link.title || link.url}
                        </a>
                      </h4>
                    </div>
                    <p className="text-[11px] font-mono text-primary/50 truncate mt-0.5">
                      {link.url}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleCopy(link.id || link._id, link.url)}
                    className="p-1.5 bg-[#f0eee5] hover:bg-[#e4e3da] text-primary rounded-lg text-xs"
                    title="Copy URL"
                  >
                    {isCopied ? <Check size={14} className="text-secondary" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-3d bg-[#00f99b] text-[#006d41] font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 uppercase"
                  >
                    <span>OPEN</span>
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => handleEditInit(link)}
                    className="p-1.5 hover:bg-[#5f5e5e]/10 text-primary/60 hover:text-primary rounded-lg"
                    title="Edit"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id || link._id, link.title)}
                    className="p-1.5 hover:bg-red-50 text-primary/60 hover:text-red-600 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3D Tactile Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-[#f0eee5] border-2 border-[#5f5e5e]/30 rounded-2xl p-3 shadow-inner">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className={`btn-3d px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${
              currentPage === 1 
                ? 'opacity-40 cursor-not-allowed bg-transparent border-transparent shadow-none' 
                : 'bg-[#fbf9f0] text-primary'
            }`}
          >
            ← PREV
          </button>

          <div className="font-mono text-xs font-bold text-primary tracking-widest bg-[#fbf9f0] px-3 py-1.5 rounded-lg border border-[#5f5e5e]/20">
            PAGE {currentPage} OF {totalPages}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className={`btn-3d px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${
              currentPage === totalPages 
                ? 'opacity-40 cursor-not-allowed bg-transparent border-transparent shadow-none' 
                : 'bg-[#fbf9f0] text-primary'
            }`}
          >
            NEXT →
          </button>
        </div>
      )}
    </div>
  );
}
