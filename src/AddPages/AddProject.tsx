import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { useProjectStore } from '../store/storeProject';

interface AddProjectProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddProject({ onBack, onSuccess }: AddProjectProps) {
    const [name, setName] = useState('');
    const [revisions, setRevisions] = useState('');
    
    const { addProject, loading } = useProjectStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addProject({ name, description: '', revisions });
        if (success) {
            onSuccess();
        }
    };

    return (
        <div className="add-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Add New Project</h2>
            </header>

            <form onSubmit={handleSubmit} className="add-form">
                <div className="form-group">
                    <label htmlFor="name">Project Name</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. Project Ares"
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="revisions">Available Revisions (comma separated)</label>
                    <input 
                        id="revisions"
                        type="text" 
                        value={revisions} 
                        onChange={(e) => setRevisions(e.target.value)} 
                        placeholder="e.g. A0, A1, B0, B1"
                    />
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Project'}</span>
                </button>
            </form>
        </div>
    );
}
