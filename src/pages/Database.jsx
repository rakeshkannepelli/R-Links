import { useState } from 'react';
import useAppStore from '../store';

const getCategoryDetails = (category) => {
  const cat = (category || '').toUpperCase();
  if (cat.includes('DESIGN')) return { icon: 'palette', fg: 'text-secondary', bg: 'bg-secondary-container' };
  if (cat.includes('STREAM') || cat.includes('VIDEO')) return { icon: 'movie', fg: 'text-error', bg: 'bg-error-container text-on-error-container' };
  if (cat.includes('SOCIAL')) return { icon: 'share', fg: 'text-tertiary', bg: 'bg-tertiary-container' };
  if (cat.includes('DEV') || cat.includes('CODE')) return { icon: 'database', fg: 'text-tertiary', bg: 'bg-tertiary-container' };
  if (cat.includes('WORK')) return { icon: 'terminal', fg: 'text-primary', bg: 'bg-primary-container' };
  return { icon: 'deployed_code', fg: 'text-secondary', bg: 'bg-secondary/10' };
};

export default function Database() {
  const links = useAppStore(state => state.links);
  const deleteLink = useAppStore(state => state.deleteLink);
  const updateLink = useAppStore(state => state.updateLink);
  const total = useAppStore(state => state.stats().total);
  
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL_SOURCES');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const filteredLinks = links.filter(l => {
    const matchesSearch = l.title?.toLowerCase().includes(search.toLowerCase()) || 
                          l.url.toLowerCase().includes(search.toLowerCase()) ||
                          l.category?.toLowerCase().includes(search.toLowerCase());
    
    if (filterCategory === 'ALL_SOURCES') return matchesSearch;
    return matchesSearch && l.category?.toUpperCase() === filterCategory.replace('[', '').replace(']', '');
  });

  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLinks = filteredLinks.slice(startIndex, startIndex + itemsPerPage);

  const handleEditInit = (link) => {
    setEditingId(link.id);
    setEditTitle(link.title || '');
    setEditUrl(link.url || '');
    setEditCategory(link.category || '');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updateLink(editingId, { title: editTitle, url: editUrl, category: editCategory });
    setEditingId(null);
  };

  const filterChips = ['ALL_SOURCES', '[DEV]', '[DESIGN]', '[STREAM]', '[WORK]', '[SOCIAL]'];

  return (
    <div className="w-full">
      {/* Header Stats & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 mt-8">
        <div className="flex flex-col gap-1 w-full">
          <div className="font-label text-[10px] uppercase text-primary font-bold tracking-[0.2em] mb-2">System Status</div>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="bg-surface-container-highest px-3 py-1 border-l-4 border-secondary">
              <span className="text-xs font-bold font-label">TOTAL_ENTRIES: <span className="text-secondary">{total}</span></span>
            </div>
            <div className="bg-surface-container-highest px-3 py-1 border-l-4 border-tertiary">
              <span className="text-xs font-bold font-label">FILTERED: <span className="text-tertiary">{filteredLinks.length}</span></span>
            </div>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 font-bold font-label text-xs tracking-wider transition-all hover:bg-on-background shadow-[4px_4px_0px_0px_#00f99b]">
            <span className="material-symbols-outlined text-sm">add_box</span>
            NEW ENTRY
          </button>
        </div>
      </div>

      {/* Terminal Search */}
      <div className="relative mb-12">
        <div className="flex items-center border-b-2 border-primary pb-2 overflow-hidden group focus-within:border-secondary transition-colors">
          <span className="text-secondary font-bold text-xl mr-3 font-mono">&gt;</span>
          <input 
            className="bg-transparent border-none focus:ring-0 w-full text-sm md:text-lg placeholder:text-primary/30 font-headline outline-none" 
            placeholder="Search entries by title, domain, or category..." 
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
          />
          <div className="w-2 h-5 md:h-6 bg-secondary cursor-blink ml-2 border-r-2 shrink-0"></div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {filterChips.map(chip => (
          <button 
            key={chip} 
            onClick={() => {
              setFilterCategory(chip);
              setCurrentPage(1);
            }} 
            className={`px-3 py-1 text-[10px] font-bold font-label border-2 transition-colors ${filterCategory === chip ? 'border-secondary bg-secondary-container text-on-secondary-container' : 'border-outline-variant hover:border-primary text-primary'}`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Link Grid/List with Edit inline */}
      <div className="space-y-4">
        {filteredLinks.length === 0 ? (
          <div className="py-12 text-center text-primary/40 uppercase tracking-widest font-bold border-2 border-dashed border-primary/20">
            NO RECORDS FOUND
          </div>
        ) : (
          paginatedLinks.map((link, index) => {
             const rot = ['rotate-[0.3deg]', 'rotate-[-0.5deg]', 'rotate-[0.2deg]', 'rotate-[-0.2deg]', 'rotate-[0.4deg]'][index % 5];
             const catDetails = getCategoryDetails(link.category);
             
             if (editingId === link.id) {
                return (
                  <form key={link.id} onSubmit={handleSaveEdit} className={`bg-surface-container-highest p-4 border-2 border-secondary sticky-note flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all ${rot}`}>
                    <div className="flex-grow space-y-3 w-full">
                      <input required type="text" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} className="w-full bg-surface border-2 border-outline/50 px-2 py-1 text-sm font-bold outline-none focus:border-secondary" placeholder="Title" />
                      <div className="flex gap-2">
                        <input required type="url" value={editUrl} onChange={(e)=>setEditUrl(e.target.value)} className="w-full bg-surface border-2 border-outline/50 px-2 py-1 text-xs font-mono outline-none focus:border-secondary" placeholder="URL" />
                        <input 
                          required 
                          type="text" 
                          list="category-options" 
                          value={editCategory} 
                          onChange={(e) => setEditCategory(e.target.value.toUpperCase())} 
                          className="bg-surface border-2 border-outline/50 px-2 py-1 text-xs font-bold outline-none focus:border-secondary uppercase w-1/3 min-w-[120px]" 
                          placeholder="CATEGORY" 
                        />
                        <datalist id="category-options">
                            <option value="DEV" />
                            <option value="DESIGN" />
                            <option value="STREAM" />
                            <option value="WORK" />
                            <option value="SOCIAL" />
                            <option value="AI CHATBOT" />
                            <option value="UNCATEGORIZED" />
                        </datalist>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                      <button type="submit" className="bg-secondary text-white px-4 py-2 text-xs font-bold uppercase w-full md:w-auto">SAVE</button>
                      <button type="button" onClick={() => setEditingId(null)} className="border-2 border-outline px-4 py-2 text-xs font-bold uppercase w-full md:w-auto hover:bg-surface-variant">CANCEL</button>
                    </div>
                  </form>
                );
             }

             return (
              <div key={link.id} className={`bg-surface-container-highest p-4 flex flex-col md:flex-row items-start md:items-center justify-between group transition-all hover:bg-[#f5f9f0] border-2 border-transparent hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#00f99b] ${rot}`}>
                <div className="flex items-center gap-4 overflow-hidden w-full md:w-3/4">
                  <div className="w-10 h-10 bg-surface flex items-center justify-center border-2 border-primary/10 shrink-0">
                    <span className={`material-symbols-outlined ${catDetails.fg}`}>{catDetails.icon}</span>
                  </div>
                  <div className="overflow-hidden w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] font-bold font-label ${catDetails.fg} ${catDetails.bg} px-1 shrink-0`}>
                        [{link.category ? link.category.toUpperCase() : 'UNCATEGORIZED'}]
                      </span>
                      <h3 className="font-bold text-on-background truncate flex-grow text-sm md:text-base leading-tight">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline decoration-secondary underline-offset-4">{link.title || link.url}</a>
                      </h3>
                    </div>
                    <p className="text-xs font-label text-primary/60 truncate">{link.url.replace(/^https?:\/\//, '')}</p>
                  </div>
                </div>
                <div className="flex gap-4 mt-4 md:mt-0 pt-3 md:pt-0 border-t-2 border-dashed border-outline/20 md:border-none w-full md:w-auto justify-end opacity-100 md:opacity-40 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditInit(link)} className="hover:text-secondary p-1" title="Edit Entry"><span className="material-symbols-outlined text-lg">edit</span></button>
                  <button onClick={() => deleteLink(link.id)} className="hover:text-error p-1" title="Delete Entry"><span className="material-symbols-outlined text-lg">delete</span></button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-between items-center bg-surface-container-low border-2 border-primary/10 p-2">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className={`font-bold font-label text-[10px] tracking-widest uppercase px-4 py-2 border-2 ${currentPage === 1 ? 'border-outline-variant text-outline opacity-50' : 'border-primary text-primary hover:bg-primary hover:text-on-primary'} transition-colors`}
          >
            &lt; PREV
          </button>
          
          <div className="font-mono text-xs font-bold text-primary/60 tracking-widest">
            PG_{currentPage.toString().padStart(2, '0')}/{totalPages.toString().padStart(2, '0')}
          </div>
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className={`font-bold font-label text-[10px] tracking-widest uppercase px-4 py-2 border-2 ${currentPage === totalPages ? 'border-outline-variant text-outline opacity-50' : 'border-primary text-primary hover:bg-primary hover:text-on-primary'} transition-colors`}
          >
            NEXT &gt;
          </button>
        </div>
      )}

      {/* End of File Indicator */}
      <div className="mt-16 flex flex-col items-center opacity-20">
        <div className="w-full border-t-2 border-dashed border-primary mb-4"></div>
        <div className="font-label text-[10px] uppercase font-bold tracking-[0.5em]">End of Index</div>
      </div>
    </div>
  );
}
