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
    expandedProject: string | null;
    expandedPcb: string | null;
    
    // Actions
    setPage: (page: Page) => void;
    setActiveTab: (tab: string) => void;
    editItem: (page: Page, id: string | number) => void;
    addItem: (page: Page, prefillId?: string | number) => void;
    goBack: () => void;
    setIsMobile: (isMobile: boolean) => void;
    setExpandedProject: (name: string | null) => void;
    setExpandedPcb: (name: string | null) => void;
}

const getInitialExpandedPcb = (): string | null => {
    if (typeof window === 'undefined') return null;
    const rawPath = window.location.pathname;
    if (rawPath.startsWith('/pcbs/') && !rawPath.startsWith('/pcbs_')) {
        return decodeURIComponent(rawPath.replace('/pcbs/', ''));
    }
    return null;
};

const getInitialExpandedProject = (): string | null => {
    if (typeof window === 'undefined') return null;
    const rawPath = window.location.pathname;
    if (rawPath.startsWith('/projects/')) {
        return decodeURIComponent(rawPath.replace('/projects/', ''));
    }
    return null;
};

const getInitialPage = (): Page => {
    if (typeof window === 'undefined') return 'projects';
    const rawPath = window.location.pathname;
    if (rawPath.startsWith('/projects/')) return 'projects';
    if (rawPath.startsWith('/pcbs/') && !rawPath.startsWith('/pcbs_')) return 'pcbs';
    const path = rawPath.replace('/', '') || 'projects';
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
    expandedProject: getInitialExpandedProject(),
    expandedPcb: getInitialExpandedPcb(),

    setPage: (page) => set({ page }),
    
    setExpandedProject: (name) => {
        if (typeof window !== 'undefined') {
            if (name) {
                window.history.pushState({}, '', `/projects/${encodeURIComponent(name)}`);
            } else {
                window.history.pushState({}, '', `/projects`);
            }
        }
        set({ expandedProject: name });
    },

    setExpandedPcb: (name) => {
        if (typeof window !== 'undefined') {
            if (name) {
                window.history.pushState({}, '', `/pcbs/${encodeURIComponent(name)}`);
            } else {
                window.history.pushState({}, '', `/pcbs`);
            }
        }
        set({ expandedPcb: name });
    },

    setActiveTab: (tab) => {
        if (typeof window !== 'undefined') {
            window.history.pushState({}, '', `/${tab}`);
        }
        set({ 
            activeTab: tab, 
            page: tab as Page, // When we switch tabs, we go to the main list page
            selectedId: null,
            expandedProject: null,
            expandedPcb: null
        });
    },

    editItem: (page, id) => set({ 
        page, 
        selectedId: id 
    }),

    addItem: (page, prefillId) => {
        const baseTab = page.split('_')[0];
        if (typeof window !== 'undefined' && useStore.getState().activeTab !== baseTab) {
            window.history.pushState({}, '', `/${baseTab}`);
            set({ 
                activeTab: baseTab,
                page, 
                selectedId: prefillId || null 
            });
            return;
        }
        set({ 
            page, 
            selectedId: prefillId || null 
        });
    },

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
        const rawPath = window.location.pathname;
        if (rawPath.startsWith('/projects/')) {
            useStore.setState({
                activeTab: 'projects',
                page: 'projects',
                selectedId: null,
                expandedProject: decodeURIComponent(rawPath.replace('/projects/', ''))
            });
            return;
        }
        if (rawPath.startsWith('/pcbs/') && !rawPath.startsWith('/pcbs_')) {
            useStore.setState({
                activeTab: 'pcbs',
                page: 'pcbs',
                selectedId: null,
                expandedPcb: decodeURIComponent(rawPath.replace('/pcbs/', ''))
            });
            return;
        }

        const path = rawPath.replace('/', '') || 'projects';
        const validPages = ['projects', 'pcbs', 'reworks', 'owners', 'tags'];
        if (validPages.includes(path)) {
            useStore.setState({
                activeTab: path,
                page: path as Page,
                selectedId: null,
                expandedProject: null,
                expandedPcb: null
            });
        }
    });
}
