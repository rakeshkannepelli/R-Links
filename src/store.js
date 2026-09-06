import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { API_URL } from './config';

const useAppStore = create(
  persist(
    (set, get) => ({
      user: null, // { operatorId: string, email: string, level: number, xp: number, role: string, photoUrl: string }
      links: [], // Array of { _id, id, url, title, category, tags: [], date, pinned: boolean }
      lastAction: null, // { type: 'ADD' | 'UPDATE' | 'DELETE', timestamp: number }
      isAuthLoading: typeof window !== 'undefined' ? Boolean(localStorage.getItem('token')) : false,
      isLinksLoading: false,
      isBackendOnline: true,
      
      login: (userData, token) => {
        if (token) {
          localStorage.setItem('token', token);
        }
        set({ user: userData, isAuthLoading: false });
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, links: [], isAuthLoading: false });
      },
      
      checkAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          set({ user: null, isAuthLoading: false });
          return;
        }

        try {
          // Keep isAuthLoading true while validating
          set({ isAuthLoading: true });
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout for cold start

          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data = await res.json();
            set({ user: data.user, isAuthLoading: false, isBackendOnline: true });
          } else if (res.status === 401 || res.status === 403) {
            // Token explicitly rejected by server
            console.warn('Session expired or unauthorized. Logging out.');
            localStorage.removeItem('token');
            set({ user: null, isAuthLoading: false });
          } else {
            // Server error (e.g. 502/503 during Render spinup) - DO NOT remove token!
            console.warn(`Auth check received server status ${res.status}. Preserving cached session.`);
            set({ isAuthLoading: false, isBackendOnline: false });
          }
        } catch (err) {
          // Network issue or timeout - DO NOT log out user! Keep cached session from storage
          console.warn('Network issue during session validation. Preserving cached session:', err.message);
          set({ isAuthLoading: false, isBackendOnline: false });
        }
      },

      updateUser: async (updates) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_URL}/api/auth/me`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(updates)
          });
          const data = await res.json();
          if (res.ok) {
            set({ user: data.user });
          }
        } catch (err) {
          console.error('Failed to update user profile', err);
        }
      },

      dispatchBotEvent: (type) => set({ lastAction: { type, timestamp: Date.now() } }),
      
      fetchLinks: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        set({ isLinksLoading: true });
        try {
          const res = await fetch(`${API_URL}/api/links`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Map MongoDB _id to id for frontend compatibility
            const links = data.map(l => ({ ...l, id: l._id || l.id }));
            set({ links, isLinksLoading: false, isBackendOnline: true });
          } else {
            set({ isLinksLoading: false });
          }
        } catch (err) {
          console.error('Failed to fetch links', err);
          set({ isLinksLoading: false });
        }
      },

      addLink: async (link) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_URL}/api/links`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(link)
          });
          if (res.ok) {
            const newLink = await res.json();
            newLink.id = newLink._id || newLink.id; // Map MongoDB _id
            set((state) => ({ 
              links: [newLink, ...state.links],
              lastAction: { type: 'ADD', timestamp: Date.now() }
            }));
          }
        } catch (err) {
          console.error('Failed to add link', err);
        }
      },
      
      deleteLink: async (id) => {
        const previousLinks = get().links;
        // 1. Optimistic Instant UI Update
        set((state) => ({
          links: state.links.filter(l => (l.id !== id && l._id !== id)),
          lastAction: { type: 'DELETE', timestamp: Date.now() }
        }));

        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_URL}/api/links/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) {
            // Revert if server rejected
            set({ links: previousLinks });
          }
        } catch (err) {
          console.error('Failed to delete link on server', err);
          set({ links: previousLinks });
        }
      },

      updateLink: async (id, updatedData) => {
        const previousLinks = get().links;
        // 1. Optimistic Instant UI Update (0ms delay for pins and edits)
        set((state) => ({
          links: state.links.map(l => (l.id === id || l._id === id) ? { ...l, ...updatedData } : l),
          lastAction: { type: 'UPDATE', timestamp: Date.now() }
        }));

        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_URL}/api/links/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(updatedData)
          });
          if (!res.ok) {
            // Revert on server rejection
            set({ links: previousLinks });
          }
        } catch (err) {
          console.error('Failed to update link on server', err);
          set({ links: previousLinks });
        }
      },

      togglePin: (id) => {
        const link = get().links.find(l => l.id === id || l._id === id);
        if (link) {
          // Instant synchronous state update via updateLink
          get().updateLink(id, { pinned: !link.pinned });
        }
      },
      
      stats: () => {
        const links = get().links || [];
        const total = links.length;
        const pinned = links.filter(l => l.pinned).length;
        const tagsCount = new Set(links.flatMap(l => l.tags || [])).size;
        return { total, pinned, tagsCount };
      }
    }),
    {
      name: 'rlinks-storage',
      partialize: (state) => ({
        user: state.user,
        links: state.links,
      }),
      onRehydrateStorage: () => (state) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          if (state) state.isAuthLoading = false;
        }
      }
    }
  )
);

export default useAppStore;
