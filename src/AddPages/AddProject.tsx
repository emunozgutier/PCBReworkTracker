import { useState } from 'react';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';

import { useProjectStore } from '../store/storeProject';

interface AddProjectProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddProject({ onBack, onSuccess }: AddProjectProps) {
    const [name, setName] = useState('');
    const [revisions, setRevisions] = useState('');
    const [projectKey, setProjectKey] = useState('');
    
    const { addProject, loading, projects, error } = useProjectStore();

    let keyBorderColor = undefined;
    let keyTextColor = undefined;
    if (projectKey.length === 2) {
        const isDuplicate = projects.some(p => p.project_key === projectKey);
        if (isDuplicate) {
            keyBorderColor = '#ef4444';
            keyTextColor = '#ef4444';
        } else {
            keyBorderColor = '#22c55e';
            keyTextColor = '#22c55e';
        }
    } else if (projectKey.length === 1) {
        keyBorderColor = '#ef4444';
        keyTextColor = '#ef4444';
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addProject({ name, description: '', revisions, project_key: projectKey });
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
                    <label htmlFor="project_key" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Project Key (2 Letters)
                        <span title="The 2-letter project key is for the links and storing data" style={{ cursor: 'help', display: 'flex' }}>
                            <HelpCircle size={14} color="var(--text-muted)" />
                        </span>
                    </label>
                    <input 
                        id="project_key"
                        type="text" 
                        maxLength={2}
                        value={projectKey} 
                        onChange={(e) => setProjectKey(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())} 
                        placeholder="e.g. MO (Auto-generates if blank)"
                        style={{ 
                            textTransform: 'uppercase',
                            borderColor: keyBorderColor,
                            color: keyTextColor,
                            outlineColor: keyBorderColor
                        }}
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
                {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
                <button type="submit" className="submit-button" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Project'}</span>
                </button>
            </form>
        </div>
    );
}
