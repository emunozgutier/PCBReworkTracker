import { create } from 'zustand';

type Page = 
    | 'projects' | 'projects_add' | 'projects_edit'
    | 'pcbs' | 'pcbs_add' | 'pcbs_edit'
    | 'reworks' | 'reworks_add' | 'reworks_edit'
    | 'owners' | 'owners_add' | 'owners_edit'
    | 'tags' | 'tags_add' | 'tags_edit';

interface NavigationState {
    page: Page;
    activeTab: string;
    selectedId: string | number | null;
    
    // Actions
    setPage: (page: Page) => void;
    setActiveTab: (tab: string) => void;
    editItem: (page: Page, id: string | number) => void;
    addItem: (page: Page) => void;
    goBack: () => void;
}

export const useStore = create<NavigationState>((set) => ({
    page: 'projects',
    activeTab: 'projects',
    selectedId: null,

    setPage: (page) => set({ page }),
    
    setActiveTab: (tab) => set({ 
        activeTab: tab, 
        page: tab as Page, // When we switch tabs, we go to the main list page
        selectedId: null 
    }),

    editItem: (page, id) => set({ 
        page, 
        selectedId: id 
    }),

    addItem: (page) => set({ 
        page, 
        selectedId: null 
    }),

    goBack: () => set((state) => ({ 
        page: state.activeTab as Page, 
        selectedId: null 
    })),
}));
