import { create } from 'zustand';
import { API_BASE } from '../serverDataBase/apiBridge';
import { apiFetch } from '../serverDataBase/apiBridge';
import { useAppState } from '../useAppState';

export interface PcbFlavor {
    name: string;
    revisions: string[];
    boms?: string[];
}

export interface Project {
    id: number;
    name: string;
    description: string;
    pcb_count: number;
    pcbs: string[];
    revisions: string[];
    project_key: string;
    flavors: PcbFlavor[];
    silicon_corners?: string;
    number_format?: string;
}

interface ProjectState {
    projects: Project[];
    projectSchematics: Record<string, any[]>;
    loading: boolean;
    error: string | null;
    fetchProjects: () => Promise<void>;
    fetchSchematics: (projectId: number | string) => Promise<void>;
    uploadSchematics: (projectId: number | string, files: File[]) => Promise<boolean>;
    deleteSchematic: (projectId: number | string, schematicId: number | string) => Promise<boolean>;
    addProject: (data: { name: string; description: string; revisions: string; project_key: string; flavors?: PcbFlavor[]; silicon_corners?: string; number_format?: string }, files?: File[]) => Promise<boolean>;
    updateProject: (id: number | string, data: { name: string; description: string; revisions: string; project_key: string; flavors?: PcbFlavor[]; silicon_corners?: string; number_format?: string }, files?: File[]) => Promise<boolean>;
    deleteProject: (id: number | string) => Promise<boolean>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    projectSchematics: {},
    loading: false,
    error: null,

    fetchProjects: async () => {
        set({ loading: true, error: null });
        try {
            const res = await apiFetch(`${API_BASE}/projects`);
            if (!res.ok) throw new Error('Failed to fetch projects');
            const data = await res.json();
            set({ projects: data, loading: false });
        } catch (err: any) {
            set({ error: err.message, loading: false });
        }
    },

    fetchSchematics: async (projectId) => {
        try {
            const res = await apiFetch(`${API_BASE}/projects/${projectId}/schematics`);
            if (!res.ok) throw new Error('Failed to fetch schematics');
            const data = await res.json();
            set(state => ({
                projectSchematics: {
                    ...state.projectSchematics,
                    [projectId.toString()]: data
                }
            }));
        } catch (err: any) {
            console.error("fetchSchematics error:", err);
        }
    },

    uploadSchematics: async (projectId, files) => {
        if (files.length === 0) return true;
        try {
            const formData = new FormData();
            files.forEach((file) => {
                formData.append('schematics', file);
            });
            const res = await apiFetch(`${API_BASE}/projects/${projectId}/schematics`, {
                method: 'POST',
                body: formData
            });
            if (!res.ok) throw new Error('Failed to upload schematics');
            await get().fetchSchematics(projectId);
            return true;
        } catch (err: any) {
            console.error("uploadSchematics error:", err);
            return false;
        }
    },

    deleteSchematic: async (projectId, schematicId) => {
        try {
            const res = await apiFetch(`${API_BASE}/projects/${projectId}/schematics/${schematicId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete schematic');
            await get().fetchSchematics(projectId);
            return true;
        } catch (err: any) {
            console.error("deleteSchematic error:", err);
            return false;
        }
    },

    addProject: async (data, files) => {
        set({ loading: true, error: null });
        try {
            const res = await apiFetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (!res.ok) {
                set({ error: result.error || 'Failed to add project', loading: false });
                return false;
            }

            const newProjectId = result.id;
            if (files && files.length > 0 && newProjectId) {
                await get().uploadSchematics(newProjectId, files);
            }
            
            // Re-fetch to get complete updated state with arrays correctly parsed
            await get().fetchProjects();
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    updateProject: async (id, data, files) => {
        set({ loading: true, error: null });
        try {
            const res = await apiFetch(`${API_BASE}/projects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            
            if (!res.ok) {
                set({ error: result.error || 'Failed to update project', loading: false });
                return false;
            }

            if (files && files.length > 0) {
                await get().uploadSchematics(id, files);
            }

            // Re-fetch to get complete updated state
            await get().fetchProjects();
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    },

    deleteProject: async (id) => {
        set({ loading: true, error: null });
        try {
            const projectToDelete = get().projects.find(p => p.id.toString() === id.toString());
            const projectName = projectToDelete?.name;

            const res = await apiFetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                set({ error: 'Failed to delete project', loading: false });
                return false;
            }

            if (projectName && useAppState.getState().expandedProject === projectName) {
                useAppState.getState().setExpandedProject(null);
            }

            // Update state locally or re-fetch
            const newProjects = get().projects.filter(p => p.id.toString() !== id.toString());
            set({ projects: newProjects, loading: false });
            return true;
        } catch (err: any) {
            set({ error: err.message, loading: false });
            return false;
        }
    }
}));
