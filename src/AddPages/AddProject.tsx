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
    const [siliconCorners, setSiliconCorners] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [formfactors, setFormfactors] = useState([{ name: 'Main', revisions: '', boms: '' }]);
    const [activeTab, setActiveTab] = useState(0);
    
    const { addProject, loading, projects, error } = useProjectStore();

    let keyBorderColor = undefined;
    let keyTextColor = undefined;
    if (projectKey.length === 3) {
        const isDuplicate = projects.some(p => p.project_key === projectKey);
        if (isDuplicate) {
            keyBorderColor = '#ef4444';
            keyTextColor = '#ef4444';
        } else {
            keyBorderColor = '#22c55e';
            keyTextColor = '#22c55e';
        }
    } else if (projectKey.length > 0 && projectKey.length < 3) {
        keyBorderColor = '#ef4444';
        keyTextColor = '#ef4444';
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payloadFormfactors = formfactors.filter(f => f.name.trim() !== '').map(f => ({
            name: f.name.trim(),
            revisions: f.revisions.split(',').map(r => r.trim()).filter(Boolean),
            boms: f.boms ? f.boms.split(',').map(b => b.trim()).filter(Boolean) : []
        }));
        const success = await addProject({ 
            name, description: '', revisions, project_key: projectKey, 
            formfactors: payloadFormfactors, silicon_corners: siliconCorners 
        });
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
                        Project Key (3 Letters)
                        <span title="The 3-letter project key is for the links and storing data" style={{ cursor: 'help', display: 'flex' }}>
                            <HelpCircle size={14} color="var(--text-muted)" />
                        </span>
                    </label>
                    <input 
                        id="project_key"
                        type="text" 
                        maxLength={3}
                        value={projectKey} 
                        onChange={(e) => setProjectKey(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())} 
                        placeholder="e.g. MOD (Auto-generates if blank)"
                        style={{ 
                            textTransform: 'uppercase',
                            borderColor: keyBorderColor,
                            color: keyTextColor,
                            outlineColor: keyBorderColor
                        }}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="revisions">Global Available Revisions (Optional)</label>
                    <input 
                        id="revisions"
                        type="text" 
                        value={revisions} 
                        onChange={(e) => setRevisions(e.target.value)} 
                        placeholder="e.g. A0, A1, B0, B1"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="silicon_corners">Silicon Corners (Optional)</label>
                    <input 
                        id="silicon_corners"
                        type="text" 
                        value={siliconCorners} 
                        onChange={(e) => setSiliconCorners(e.target.value)} 
                        placeholder="e.g. TT, FF, SS"
                    />
                </div>
                <div className="form-group">
                    <label>PCB Flavors & Revisions</label>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-4px', marginBottom: '8px' }}>
                        Define specific flavors (e.g., Demo, Validation) and their allowed revisions.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', backgroundColor: 'var(--bg-element)' }}>
                        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                            {formfactors.map((ff, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveTab(idx)}
                                    style={{
                                        padding: '6px 16px',
                                        borderRadius: '4px',
                                        background: activeTab === idx ? 'var(--accent)' : 'var(--bg-panel)',
                                        color: activeTab === idx ? '#fff' : 'var(--text-muted)',
                                        border: '1px solid',
                                        borderColor: activeTab === idx ? 'var(--accent)' : 'var(--border-color)',
                                        cursor: 'pointer',
                                        fontWeight: activeTab === idx ? 600 : 400,
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {ff.name || `Flavor ${idx + 1}`}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() => {
                                    setFormfactors([...formfactors, { name: '', revisions: '', boms: '' }]);
                                    setActiveTab(formfactors.length);
                                }}
                                style={{
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    background: 'var(--bg-panel)',
                                    color: 'var(--text-muted)',
                                    border: '1px dashed var(--border-color)',
                                    cursor: 'pointer',
                                    fontWeight: 600
                                }}
                                title="Add PCB Flavor"
                            >
                                +
                            </button>
                        </div>
                        
                        {formfactors.length > 0 && formfactors[activeTab] && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Flavor Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Demo" 
                                            value={formfactors[activeTab].name} 
                                            onChange={e => {
                                                const newFf = [...formfactors];
                                                newFf[activeTab].name = e.target.value;
                                                setFormfactors(newFf);
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1.5 }}>
                                        <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>PCB Revisions</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 1.0, 1.1" 
                                            value={formfactors[activeTab].revisions} 
                                            onChange={e => {
                                                const newFf = [...formfactors];
                                                newFf[activeTab].revisions = e.target.value;
                                                setFormfactors(newFf);
                                            }}
                                        />
                                    </div>
                                    <div style={{ flex: 1.5 }}>
                                        <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>BOM Options</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. BOM1, BOM2" 
                                            value={formfactors[activeTab].boms || ''} 
                                            onChange={e => {
                                                const newFf = [...formfactors];
                                                newFf[activeTab].boms = e.target.value;
                                                setFormfactors(newFf);
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            const newFf = formfactors.filter((_, i) => i !== activeTab);
                                            setFormfactors(newFf);
                                            setActiveTab(Math.max(0, activeTab - 1));
                                        }}
                                        style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '4px', cursor: 'pointer', color: '#ef4444', fontSize: '0.85rem' }}
                                    >
                                        Delete Flavor
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
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
