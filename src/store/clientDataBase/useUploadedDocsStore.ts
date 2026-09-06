import { create } from 'zustand';
import { API_BASE, apiFetch } from '../serverDataBase/apiBridge';

export interface UploadedDoc {
    id: number;
    entity_type: 'rework' | 'revision' | 'project' | 'pcb' | string;
    entity_id: number;
    project_id?: number | null;
    project_name?: string | null;
    project_key?: string | null;
    pcb_id?: number | null;
    pcb_board_number?: string | null;
    pcb_crc?: string | null;
    rework_number?: number | null;
    rework_title?: string | null;
    doc_type: 'picture' | 'schematic' | 'board_file' | 'bom_csv' | 'datasheet' | 'other' | string;
    filename: string;
    original_filename?: string | null;
    path: string;
    file_size?: number;
    mime_type?: string | null;
    uploaded_by?: string | null;
    uploaded_at: string;
}

export interface DocSummary {
    picture: number;
    schematic: number;
    board_file: number;
    bom_csv: number;
    datasheet: number;
    other: number;
    total: number;
}

interface UploadedDocsFilter {
    project_id?: number;
    pcb_id?: number;
    doc_type?: string;
    entity_type?: string;
    search?: string;
}

interface UploadedDocsState {
    docs: UploadedDoc[];
    summary: DocSummary | null;
    loading: boolean;
    error: string | null;
    fetchDocs: (filters?: UploadedDocsFilter) => Promise<void>;
    fetchSummary: (filters?: { project_id?: number; pcb_id?: number }) => Promise<void>;
    deleteDoc: (docId: number) => Promise<boolean>;
}

export const useUploadedDocsStore = create<UploadedDocsState>((set) => ({
    docs: [],
    summary: null,
    loading: false,
    error: null,

    fetchDocs: async (filters) => {
        set({ loading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters) {
                if (filters.project_id) params.append('project_id', String(filters.project_id));
                if (filters.pcb_id) params.append('pcb_id', String(filters.pcb_id));
                if (filters.doc_type && filters.doc_type !== 'all') params.append('doc_type', filters.doc_type);
                if (filters.entity_type) params.append('entity_type', filters.entity_type);
                if (filters.search) params.append('search', filters.search);
            }
            const url = `${API_BASE}/uploaded-docs${params.toString() ? '?' + params.toString() : ''}`;
            const res = await apiFetch(url);
            if (!res.ok) throw new Error('Failed to fetch uploaded documents');
            const data = await res.json();
            set({ docs: Array.isArray(data) ? data : [], loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchSummary: async (filters) => {
        try {
            const params = new URLSearchParams();
            if (filters) {
                if (filters.project_id) params.append('project_id', String(filters.project_id));
                if (filters.pcb_id) params.append('pcb_id', String(filters.pcb_id));
            }
            const url = `${API_BASE}/uploaded-docs/summary${params.toString() ? '?' + params.toString() : ''}`;
            const res = await apiFetch(url);
            if (res.ok) {
                const data = await res.json();
                set({ summary: data });
            }
        } catch (err: any) {
            console.error("fetchSummary error:", err);
        }
    },

    deleteDoc: async (docId: number) => {
        try {
            const res = await apiFetch(`${API_BASE}/uploaded-docs/${docId}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to delete document');
            }
            set(state => ({
                docs: state.docs.filter(d => d.id !== docId)
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message });
            return false;
        }
    }
}));
