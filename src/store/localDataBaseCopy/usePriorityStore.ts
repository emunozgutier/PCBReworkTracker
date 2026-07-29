import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface PriorityStore {
    priorities: Record<string, 'High' | 'Low'>;
    setPriorities: (priorities: Record<string, 'High' | 'Low'>) => void;
    resetPriorities: () => void;
}

const defaultPriorities: Record<string, 'High' | 'Low'> = {
    'Silicon Swap': 'High',
    'Major Rework': 'High',
    'Minor Rework': 'Low',
    'Resistor Swap': 'Low',
};

export const usePriorityStore = create<PriorityStore>()(
    persist(
        (set) => ({
            priorities: { ...defaultPriorities },
            setPriorities: (priorities) => set({ priorities }),
            resetPriorities: () => set({ priorities: { ...defaultPriorities } }),
        }),
        {
            name: 'pcb-rework-tracker-priorities-state',
            storage: createJSONStorage(() => {
                if (typeof window !== 'undefined' && window.localStorage) {
                    return window.localStorage;
                }
                return {
                    getItem: () => null,
                    setItem: () => {},
                    removeItem: () => {},
                };
            }),
        }
    )
);
