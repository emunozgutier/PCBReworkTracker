import { create } from 'zustand';
import { usePcbStore } from './storePcb';
import { useReworkStore } from './storeRework';

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
    isolatedView: boolean;
    qrModalBoard: string | null;
    
    // Actions
    setPage: (page: Page) => void;
    setActiveTab: (tab: string) => void;
    editItem: (page: Page, id: string | number) => void;
    addItem: (page: Page, prefillId?: string | number) => void;
    goBack: () => void;
    setIsMobile: (isMobile: boolean) => void;
    setExpandedProject: (name: string | null) => void;
    setExpandedPcb: (name: string | null) => void;
    setIsolatedView: (isolatedView: boolean) => void;
    setQrModalBoard: (board: string | null) => void;
}

const getNormalizedPath = () => {
    if (typeof window === 'undefined') return '/';
    let path = window.location.pathname;
    let base = import.meta.env.BASE_URL || '/';
    if (base.endsWith('/')) base = base.slice(0, -1);
    if (path.startsWith(base)) {
        path = path.slice(base.length);
    }
    if (!path.startsWith('/')) path = '/' + path;
    return path;
};

const getInitialExpandedPcb = (): string | null => {
    if (typeof window === 'undefined') return null;
    const rawPath = getNormalizedPath();
    if (rawPath.startsWith('/pcbs/') && !rawPath.startsWith('/pcbs_')) {
        let board = decodeURIComponent(rawPath.replace('/pcbs/', ''));
        if (board.endsWith('/view')) {
            board = board.replace('/view', '');
        }
        return board;
    }
    return null;
};

const getInitialIsolatedView = (): boolean => {
    if (typeof window === 'undefined') return false;
    return getNormalizedPath().endsWith('/view');
};

const getInitialExpandedProject = (): string | null => {
    if (typeof window === 'undefined') return null;
    const rawPath = getNormalizedPath();
    if (rawPath.startsWith('/projects/')) {
        return decodeURIComponent(rawPath.replace('/projects/', ''));
    }
    return null;
};

const getInitialPage = (): Page => {
    if (typeof window === 'undefined') return 'projects';
    const rawPath = getNormalizedPath();
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
    isolatedView: getInitialIsolatedView(),
    qrModalBoard: null,

    setPage: (page) => set({ page }),
    setIsolatedView: (isolatedView) => set({ isolatedView }),
    
    setExpandedProject: (name) => {
        if (typeof window !== 'undefined') {
            let base = import.meta.env.BASE_URL || '/';
            if (base.endsWith('/')) base = base.slice(0, -1);
            if (name) {
                window.history.pushState({}, '', `${base}/projects/${encodeURIComponent(name)}`);
            } else {
                window.history.pushState({}, '', `${base}/projects`);
            }
        }
        set({ expandedProject: name });
    },

    setExpandedPcb: (name) => {
        if (typeof window !== 'undefined') {
            let base = import.meta.env.BASE_URL || '/';
            if (base.endsWith('/')) base = base.slice(0, -1);
            if (name) {
                const isolated = useStore.getState().isolatedView;
                window.history.pushState({}, '', `${base}/pcbs/${encodeURIComponent(name)}${isolated ? '/view' : ''}`);
            } else {
                window.history.pushState({}, '', `${base}/pcbs`);
            }
        }
        set({ expandedPcb: name });
    },

    setQrModalBoard: (name) => set({ qrModalBoard: name }),

    setActiveTab: (tab) => {
        if (typeof window !== 'undefined') {
            let base = import.meta.env.BASE_URL || '/';
            if (base.endsWith('/')) base = base.slice(0, -1);
            window.history.pushState({}, '', `${base}/${tab}`);
        }
        
        if (tab !== 'pcbs') usePcbStore.getState().resetFilters();
        if (tab !== 'reworks') useReworkStore.getState().resetFilters();

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
            let base = import.meta.env.BASE_URL || '/';
            if (base.endsWith('/')) base = base.slice(0, -1);
            window.history.pushState({}, '', `${base}/${baseTab}`);
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
        const rawPath = getNormalizedPath();
        if (rawPath.startsWith('/projects/')) {
            usePcbStore.getState().resetFilters();
            useReworkStore.getState().resetFilters();
            useStore.setState({
                activeTab: 'projects',
                page: 'projects',
                selectedId: null,
                expandedProject: decodeURIComponent(rawPath.replace('/projects/', ''))
            });
            return;
        }
        if (rawPath.startsWith('/pcbs/') && !rawPath.startsWith('/pcbs_')) {
            useReworkStore.getState().resetFilters();
            let board = decodeURIComponent(rawPath.replace('/pcbs/', ''));
            let isolated = false;
            if (board.endsWith('/view')) {
                board = board.replace('/view', '');
                isolated = true;
            }
            useStore.setState({
                activeTab: 'pcbs',
                page: 'pcbs',
                selectedId: null,
                expandedPcb: board,
                isolatedView: isolated
            });
            return;
        }

        const path = rawPath.replace('/', '') || 'projects';
        const validPages = ['projects', 'pcbs', 'reworks', 'owners', 'tags'];
        if (validPages.includes(path)) {
            if (path !== 'pcbs') usePcbStore.getState().resetFilters();
            if (path !== 'reworks') useReworkStore.getState().resetFilters();
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
