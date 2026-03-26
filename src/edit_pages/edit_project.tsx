import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

import { API_BASE } from '../api';
import { RevisionManager } from '../components/RevisionManager';
import { useProjectStore } from '../store/storeProject';

interface EditProjectProps {
    id: string | number;
    onBack: () => void;
    onSuccess: () => void;
}

export function EditProject({ id, onBack, onSuccess }: EditProjectProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [revisions, setRevisions] = useState('');
    const [loading, setLoading] = useState(true);
    
    const { projects, updateProject, deleteProject, loading: saving } = useProjectStore();

    useEffect(() => {
        // Find existing project from store directly if available, else fetch
        const existingProject = projects.find(p => p.id.toString() === id.toString());
        if (existingProject) {
            setName(existingProject.name);
            setDescription(existingProject.description || '');
            setRevisions(Array.isArray(existingProject.revisions) ? existingProject.revisions.join(', ') : (existingProject.revisions || ''));
            setLoading(false);
        } else {
            fetch(`${API_BASE}/projects`)
                .then(res => res.json())
                .then(data => {
                    const project = data.find((p: any) => p.id.toString() === id.toString());
                    if (project) {
                        setName(project.name);
                        setDescription(project.description || '');
                        setRevisions(Array.isArray(project.revisions) ? project.revisions.join(', ') : (project.revisions || ''));
                    }
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [id, projects]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await updateProject(id, { name, description, revisions });
        if (success) {
            onSuccess();
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;
        const success = await deleteProject(id);
        if (success) {
            onSuccess();
        }
    };

    if (loading) return <div className="loading">Loading Project...</div>;

    return (
        <div className="add-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Edit Project</h2>
                <button onClick={handleDelete} className="delete-icon-button" title="Delete Project">
                    <Trash2 size={20} color="#ef4444" />
                </button>
            </header>

            <form onSubmit={handleUpdate} className="add-form">
                <div className="form-group">
                    <label htmlFor="name">Project Name</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="revisions">Available Revisions (comma separated)</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <input 
                            id="revisions"
                            type="text" 
                            value={revisions} 
                            onChange={(e) => setRevisions(e.target.value)} 
                            placeholder="e.g. A0, A1, B0, B1"
                        />
                        <RevisionManager revisions={revisions} onChange={setRevisions} />
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea 
                        id="description"
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows={4}
                    />
                </div>
                <button type="submit" className="submit-button" disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Update Project'}</span>
                </button>
            </form>
        </div>
    );
}
