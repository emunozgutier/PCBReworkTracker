import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { API_BASE, apiFetch } from '../database/apiBridge';

interface PriorityStore {
    priorities: Record<string, 'High' | 'Low'>;
    setPriorities: (priorities: Record<string, 'High' | 'Low'>) => Promise<void>;
    resetPriorities: () => Promise<void>;
    fetchPriorities: () => Promise<void>;
}

const defaultPriorities: Record<string, 'High' | 'Low'> = {
    'Silicon Swap': 'High',
    'Major Rework': 'High',
    'Minor Rework': 'Low',
    'Resistor Swap': 'Low',
};

export const usePriorityStore = create<PriorityStore>((set) => ({
    priorities: { ...defaultPriorities },
    setPriorities: async (priorities) => {
        set({ priorities });
        const updates: Record<string, string> = {};
        Object.keys(priorities).forEach(key => {
            updates[`priority_${key}`] = priorities[key];
        });
        try {
            await apiFetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error('Failed to sync priorities to DB:', err);
        }
    },
    resetPriorities: async () => {
        set({ priorities: { ...defaultPriorities } });
        const updates: Record<string, string> = {};
        Object.keys(defaultPriorities).forEach(key => {
            updates[`priority_${key}`] = defaultPriorities[key];
        });
        try {
            await apiFetch(`${API_BASE}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
        } catch (err) {
            console.error('Failed to reset priorities on DB:', err);
        }
    },
    fetchPriorities: async () => {
        try {
            const res = await apiFetch(`${API_BASE}/settings`);
            if (res.ok) {
                const data = await res.json();
                const loadedPriorities: Record<string, 'High' | 'Low'> = {};
                let foundAny = false;
                Object.keys(data).forEach(key => {
                    if (key.startsWith('priority_')) {
                        const originalKey = key.substring('priority_'.length);
                        loadedPriorities[originalKey] = data[key] as 'High' | 'Low';
                        foundAny = true;
                    }
                });
                if (foundAny) {
                    set({ priorities: { ...defaultPriorities, ...loadedPriorities } });
                }
            }
        } catch (err) {
            console.error('Failed to fetch priorities from DB:', err);
        }
    }
}));
