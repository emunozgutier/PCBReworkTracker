import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DemoState {
    isDemoMode: boolean;
    toggleDemoMode: () => void;
    setDemoMode: (val: boolean) => void;
}

export const useDemoStore = create<DemoState>()(
    persist(
        (set) => ({
            isDemoMode: false,
            toggleDemoMode: () => set((state) => ({ isDemoMode: !state.isDemoMode })),
            setDemoMode: (val) => set({ isDemoMode: val }),
        }),
        {
            name: 'demo-mode-storage',
        }
    )
);
