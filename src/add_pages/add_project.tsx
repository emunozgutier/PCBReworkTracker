import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { API_BASE } from '../api';

interface AddProjectProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddProject({ onBack, onSuccess }: AddProjectProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [revisions, setRevisions] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, revisions })
            });
            if (res.ok) {
                onSuccess();
            } else {
                alert('Failed to add project');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to server');
        } finally {
            setLoading(false);
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
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea 
                        id="description"
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        placeholder="Briefly describe the project goals..."
                        rows={4}
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
