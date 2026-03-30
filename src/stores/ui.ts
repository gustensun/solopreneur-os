import { create } from 'zustand';

export type PageId =
  | 'dashboard'
  | 'chat'
  | 'brain'
  | 'income'
  | 'skills'
  | 'brand'
  | 'niche'
  | 'offer'
  | 'avatar'
  | 'projects'
  | 'calendar'
  | 'messages'
  | 'clients'
  | 'academy'
  | 'program'
  | 'content'
  | 'quiz'
  | 'settings';

interface UIStore {
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  activePage: PageId;
  activeModal: string | null;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setActivePage: (page: PageId) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  sidebarCollapsed: false,
  sidebarOpen: true,
  activePage: 'dashboard',
  activeModal: null,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setActivePage: (page) => set({ activePage: page }),

  openModal: (modalId) => set({ activeModal: modalId }),

  closeModal: () => set({ activeModal: null }),
}));
