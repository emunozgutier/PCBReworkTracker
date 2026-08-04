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
    if (isDemoMode) {
        const basePath = import.meta.env.BASE_URL || '/';
        // Resolve path to the copied files in the public/docs directory of production bundle
        return `${window.location.origin}${basePath}docs/${filename}`;
    }
    const apiPort = 5002;
    const API_BASE = typeof window !== 'undefined' ? `http://${window.location.hostname}:${apiPort}/api` : '';
    return pathStr.startsWith('http') 
        ? pathStr 
        : `${API_BASE.replace('/api', '')}/api${pathStr}`;
}
