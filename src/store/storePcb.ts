import { create } from 'zustand';
import { API_BASE } from '../api';

export interface Pcb {
    id: number;
    board_number: string;
    status: string;
    project: string;
    owner: string;
    product: string;
}

interface PcbState {
    pcbs: Pcb[];
    loading: boolean;
    error: string | null;
    fetchPcbs: () => Promise<void>;
    addPcb: (data: { board_number: string; status: string; product_name_and_rev: string; project_id: number | null; owner_id: number | null }) => Promise<boolean>;
    updatePcb: (id: number | string, data: { board_number: string; status: string; product_name_and_rev: string; project_id: number | null; owner_id: number | null }) => Promise<boolean>;
    deletePcb: (id: number | string) => Promise<boolean>;
}

export const usePcbStore = create<PcbState>((set, get) => ({
    pcbs: [],
    loading: false,
    error: null,

    fetchPcbs: async () => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_BASE}/pcbs`);
            if (!res.ok) throw new Error('Failed to fetch pcbs');
            const data = await res.json();
            set({ pcbs: data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    addPcb: async (data) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_BASE}/pcbs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (!res.ok) {
                set({ error: result.error || 'Failed to add pcb', loading: false });
                return false;
            }
            
            await get().fetchPcbs();
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    updatePcb: async (id, data) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_BASE}/pcbs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (!res.ok) {
                set({ error: result.error || 'Failed to update pcb', loading: false });
                return false;
            }

            await get().fetchPcbs();
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    deletePcb: async (id) => {
        set({ loading: true, error: null });
        try {
            const res = await fetch(`${API_BASE}/pcbs/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                set({ error: 'Failed to delete pcb', loading: false });
                return false;
            }

            const newPcbs = get().pcbs.filter(p => p.id.toString() !== id.toString());
            set({ pcbs: newPcbs, loading: false });
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    }
}));
