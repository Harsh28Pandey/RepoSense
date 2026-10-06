import { create } from 'zustand';
import API from '../api/client';

export const useStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoadingUser: true,

  repos: [],
  selectedRepo: null,
  notifications: [],

  // Load User Profile
  fetchUser: async () => {
    try {
      set({ isLoadingUser: true });
      const res = await API.get('/auth/me');
      const userData = res.data.data;
      set({ user: userData, isAuthenticated: true, isLoadingUser: false });

      // After user is loaded, fetch repos
      get().fetchRepos();
    } catch (err) {
      // Clear state on failed auth
      get().resetStore();
      set({ isLoadingUser: false });
    }
  },

  // Reset all state & clear client storage (F4 requirement)
  resetStore: () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
    } catch (e) {}
    set({
      user: null,
      isAuthenticated: false,
      repos: [],
      selectedRepo: null,
      notifications: []
    });
  },

  // Logout
  logout: async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {}
    get().resetStore();
  },

  // Fetch Repos strictly for authenticated user
  fetchRepos: async () => {
    try {
      const res = await API.get('/repos');
      const list = res.data.data || [];
      const currentSelected = get().selectedRepo;

      // Validate selectedRepo against fetched user repos
      const validSelected = list.find(r => (r._id || r.id) === (currentSelected?._id || currentSelected?.id)) || list[0] || null;

      set({
        repos: list,
        selectedRepo: validSelected
      });
    } catch (err) {
      set({ repos: [], selectedRepo: null });
    }
  },

  setSelectedRepo: (repo) => set({ selectedRepo: repo }),

  // Connect New Repo
  connectRepoUrl: async (repoUrl) => {
    const res = await API.post('/repos/connect', { repoUrl });
    const newRepo = res.data.data;
    set((state) => ({
      repos: [newRepo, ...state.repos],
      selectedRepo: newRepo
    }));
    return newRepo;
  }
}));
