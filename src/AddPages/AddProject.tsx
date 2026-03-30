import { useState } from 'react';
import { ArrowLeft, Save, HelpCircle } from 'lucide-react';
import { FormTabs } from '../forms/FormTabs';import { useProjectStore } from '../store/storeProject';

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
                    <FormTabs
                        tabs={formfactors.map(ff => ff.name)}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onAddTab={() => {
                            setFormfactors([...formfactors, { name: '', revisions: '', boms: '' }]);
                            setActiveTab(formfactors.length);
                        }}
                        onDeleteActiveTab={() => {
                            const newFf = formfactors.filter((_, i) => i !== activeTab);
                            setFormfactors(newFf);
                            setActiveTab(Math.max(0, activeTab - 1));
                        }}
                    >
                        {formfactors[activeTab] && (
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Flavor Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Demo" 
                                        value={formfactors[activeTab].name} 
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg-element)', color: 'var(--text-color)' }}
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
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg-element)', color: 'var(--text-color)' }}
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
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'var(--bg-element)', color: 'var(--text-color)' }}
                                        onChange={e => {
                                            const newFf = [...formfactors];
                                            newFf[activeTab].boms = e.target.value;
                                            setFormfactors(newFf);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </FormTabs>
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
