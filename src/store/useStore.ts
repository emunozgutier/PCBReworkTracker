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
    isMobile: boolean;
    
    // Actions
    setPage: (page: Page) => void;
    setActiveTab: (tab: string) => void;
    editItem: (page: Page, id: string | number) => void;
    addItem: (page: Page) => void;
    goBack: () => void;
    setIsMobile: (isMobile: boolean) => void;
}

const getInitialPage = (): Page => {
    if (typeof window === 'undefined') return 'projects';
    const path = window.location.pathname.replace('/', '') || 'projects';
    const validPages: Page[] = ['projects', 'pcbs', 'reworks', 'owners', 'tags'];
    if (validPages.includes(path as Page)) return path as Page;
    return 'projects';
};

const initialPage = getInitialPage();

export const useStore = create<NavigationState>((set) => ({
    page: initialPage,
    activeTab: initialPage,
    selectedId: null,
    isMobile: typeof window !== 'undefined' ? window.innerWidth <= 768 : false,

    setPage: (page) => set({ page }),
    
    setActiveTab: (tab) => {
        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', `/${tab}`);
        }
        set({ 
            activeTab: tab, 
            page: tab as Page, // When we switch tabs, we go to the main list page
            selectedId: null 
        });
    },

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

    setIsMobile: (isMobile) => set({ isMobile }),
}));

// Initialize listener
if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
        const mobile = window.innerWidth <= 768;
        if (useStore.getState().isMobile !== mobile) {
            useStore.getState().setIsMobile(mobile);
        }
    });

    window.addEventListener('popstate', () => {
        const path = window.location.pathname.replace('/', '') || 'projects';
        const validPages = ['projects', 'pcbs', 'reworks', 'owners', 'tags'];
        if (validPages.includes(path)) {
            useStore.setState({
                activeTab: path,
                page: path as Page,
                selectedId: null
            });
        }
    });
}
