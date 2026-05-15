import { create } from 'zustand';

interface SearchStore {
  // --- Overlay open/close ---
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleSearch: () => void;

  // --- Shared search term (written by SearchBar & SearchContent mobile input) ---
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  // Overlay
  isOpen: false,
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
  toggleSearch: () => set((state) => ({ isOpen: !state.isOpen })),

  // Search term — starts empty; initialised from URL on first mount by SearchContent
  searchTerm: '',
  setSearchTerm: (term) => set({ searchTerm: term }),
}));
