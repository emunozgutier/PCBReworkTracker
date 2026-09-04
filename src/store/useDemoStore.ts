import { create } from 'zustand';

interface DemoState {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
    setDemoMode: (val: boolean) => void;
}

const initialDemoState = typeof window !== 'undefined' 
    ? window.location.hostname.includes('github.io') || window.location.pathname.includes('/demo') || window.location.search.includes('demo')
    : false;

export const useDemoStore = create<DemoState>()(
    (set) => ({
        isDemoMode: initialDemoState,
        toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
        setDemoMode: (val) => set({ isDemoMode: val }),
    })
);

export function getDocumentUrl(pathStr: string, filename: string): string {
    const isDemoMode = useDemoStore.getState().isDemoMode;
    const basePath = import.meta.env.BASE_URL || '/';
    const cleanBase = basePath.endsWith('/') ? basePath : `${basePath}/`;

    if (isDemoMode) {
        // Resolve path to the copied files in the public/docs directory of production bundle
        return `${window.location.origin}${cleanBase}docs/${filename}`;
    }
    
    if (pathStr.startsWith('http')) {
        return pathStr;
    }

    const cleanPath = pathStr.startsWith('/') ? pathStr.slice(1) : pathStr;
    return `${window.location.origin}${cleanBase}api/${cleanPath}`;
}

