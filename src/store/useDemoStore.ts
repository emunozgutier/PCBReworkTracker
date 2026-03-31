import { create } from 'zustand';

interface DemoState {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
    setDemoMode: (val: boolean) => void;
}

const initialDemoState = typeof window !== 'undefined' ? window.location.hostname.includes('github.io') : false;

export const useDemoStore = create<DemoState>()(
    (set) => ({
        isDemoMode: initialDemoState,
        toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
        setDemoMode: (val) => set({ isDemoMode: val }),
    })
);
