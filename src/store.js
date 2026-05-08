import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialLinks = [
  { id: '1', title: 'Building with Tailwind v4: The New Era of JIT', url: 'https://github.com/blog', category: 'DEV', description: 'Exploring the upcoming features of the next major Tailwind CSS release and how i...', date: new Date().toISOString(), pinned: false, tags: ['dev', 'css'] },
  { id: '2', title: 'Memory Management in LLM Agents', url: 'https://openai.com/research', category: 'AI CHATBOT', description: 'A technical deep dive into how modern AI agents persist context across sessions...', date: new Date().toISOString(), pinned: false, tags: ['ai', 'research'] },
  { id: '3', title: 'Low-Latency Video Over WebRTC', url: 'https://twitch.tv/engineering', category: 'STREAM', description: 'How real-time streaming platforms are reducing broadcast lag to sub-second...', date: new Date().toISOString(), pinned: false, tags: ['stream', 'webrtc'] },
  { id: '4', title: 'Productivity Systems for Solopreneurs', url: 'https://notion.so/templates', category: 'WORK', description: 'Setting up a sustainable workflow using the Para method within Notion\'s block-...', date: new Date().toISOString(), pinned: false, tags: ['work', 'notion'] },
  { id: '5', title: 'The AT Protocol Specification', url: 'https://atproto.com', category: 'SOCIAL', description: 'Documentation for the Authenticated Transfer Protocol, a federated social...', date: new Date().toISOString(), pinned: false, tags: ['social', 'atproto'] },
  { id: '6', title: 'React-Query Documentation', url: 'https://tanstack.com/query/latest', category: 'DEV', description: 'Comprehensive guide to fetching, caching, and updating asynchronous data in React.', date: new Date().toISOString(), pinned: false, tags: ['react', 'docs'] },
  { id: '7', title: 'Tailwind CSS Color Palette', url: 'https://tailwindcss.com/docs/customizing-colors', category: 'DESIGN', description: 'A complete reference for customizing your Tailwind CSS color palette.', date: new Date().toISOString(), pinned: false, tags: ['design', 'css'] },
  { id: '8', title: 'Project Archive Q3', url: 'https://internal-notion.so/rlinks-v2', category: 'WORK', description: 'Documentation and assets from the Q3 rlinks-v2 project sprint.', date: new Date().toISOString(), pinned: false, tags: ['work', 'archive'] },
  { id: '9', title: 'Twitch Live Dashboard', url: 'https://dashboard.twitch.tv/u/dev_stream', category: 'STREAM', description: 'Live creator dashboard for monitoring stream events and chat in real-time.', date: new Date().toISOString(), pinned: false, tags: ['stream', 'twitch'] },
  { id: '10', title: 'GitHub Repositories', url: 'https://github.com/r-links-main', category: 'SOCIAL', description: 'Source code repositories and open-source contributions for the R-Links ecosystem.', date: new Date().toISOString(), pinned: false, tags: ['social', 'repo'] },
];

const useAppStore = create(
  persist(
    (set, get) => ({
      user: null, // { operatorId: string, level: number, xp: number }
      links: initialLinks, // Array of { id, url, title, category, tags: [], date, pinned: boolean }
      lastAction: null, // { type: 'ADD' | 'UPDATE' | 'DELETE', timestamp: number }
      
      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
      dispatchBotEvent: (type) => set({ lastAction: { type, timestamp: Date.now() } }),
      
      addLink: (link) => set((state) => ({ 
        links: [{...link, id: Date.now().toString(), date: new Date().toISOString(), pinned: false}, ...state.links],
        lastAction: { type: 'ADD', timestamp: Date.now() }
      })),
      
      deleteLink: (id) => set((state) => ({
        links: state.links.filter(l => l.id !== id),
        lastAction: { type: 'DELETE', timestamp: Date.now() }
      })),

      updateLink: (id, updatedData) => set((state) => ({
        links: state.links.map(l => l.id === id ? { ...l, ...updatedData } : l),
        lastAction: { type: 'UPDATE', timestamp: Date.now() }
      })),

      togglePin: (id) => set((state) => ({
        links: state.links.map(l => l.id === id ? { ...l, pinned: !l.pinned } : l)
      })),
      
      stats: () => {
        const links = get().links;
        const total = links.length;
        const pinned = links.filter(l => l.pinned).length;
        const tagsCount = new Set(links.flatMap(l => l.tags || [])).size;
        return { total, pinned, tagsCount };
      }
    }),
    {
      name: 'rlinks-storage', // name of the item in the storage (must be unique)
    }
  )
);

export default useAppStore;
