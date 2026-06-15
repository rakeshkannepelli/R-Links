import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5000'
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

const useAppStore = create(
  persist(
    (set, get) => ({
      user: null, // { operatorId: string, email: string, level: number, xp: number, role: string, photoUrl: string }
      links: [], // Array of { _id, url, title, category, tags: [], date, pinned: boolean }
      lastAction: null, // { type: 'ADD' | 'UPDATE' | 'DELETE', timestamp: number }
      
      login: (userData) => set({ user: userData }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, links: [] });
      },
      
      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({ user: null });
            return;
          }
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            set({ user: data.user });
          } else {
            localStorage.removeItem('token');
            set({ user: null });
          }
        } catch (err) {
          console.error('Session validation failed', err);
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
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_URL}/api/links`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Map MongoDB _id to id for frontend compatibility
            const links = data.map(l => ({ ...l, id: l._id }));
            set({ links });
          }
        } catch (err) {
          console.error('Failed to fetch links', err);
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
            newLink.id = newLink._id; // Map MongoDB _id
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
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_URL}/api/links/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            set((state) => ({
              links: state.links.filter(l => l.id !== id),
              lastAction: { type: 'DELETE', timestamp: Date.now() }
            }));
          }
        } catch (err) {
          console.error('Failed to delete link', err);
        }
      },

      updateLink: async (id, updatedData) => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;
          const res = await fetch(`${API_URL}/api/links/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(updatedData)
          });
          if (res.ok) {
            set((state) => ({
              links: state.links.map(l => l.id === id ? { ...l, ...updatedData } : l),
              lastAction: { type: 'UPDATE', timestamp: Date.now() }
            }));
          }
        } catch (err) {
          console.error('Failed to update link', err);
        }
      },

      togglePin: async (id) => {
        const link = get().links.find(l => l.id === id);
        if (link) {
          await get().updateLink(id, { pinned: !link.pinned });
        }
      },
      
      stats: () => {
        const links = get().links;
        const total = links.length;
        const pinned = links.filter(l => l.pinned).length;
        const tagsCount = new Set(links.flatMap(l => l.tags || [])).size;
        return { total, pinned, tagsCount };
      }
    }),
    {
      name: 'rlinks-storage', // only user state and offline cache
    }
  )
);

export default useAppStore;
