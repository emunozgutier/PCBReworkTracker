import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2, HelpCircle } from 'lucide-react';

import { API_BASE } from '../apiBridge';
import { useProjectStore } from '../store/storeProject';
import { usePcbStore } from '../store/storePcb';

interface EditProjectProps {
    id: string | number;
    onBack: () => void;
    onSuccess: () => void;
}

export function EditProject({ id, onBack, onSuccess }: EditProjectProps) {
    const [name, setName] = useState('');
    const [revisions, setRevisions] = useState('');
    const [siliconCorners, setSiliconCorners] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [formfactors, setFormfactors] = useState<{name: string, revisions: string, boms?: string}[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    
    const { projects, updateProject, deleteProject, loading: saving } = useProjectStore();
    const { pcbs, fetchPcbs } = usePcbStore();

    useEffect(() => {
        if (pcbs.length === 0) fetchPcbs();
    }, [pcbs.length, fetchPcbs]);

    const projectPcbs = pcbs.filter(p => p.project === name);
    const pcbCount = projectPcbs.length;

    useEffect(() => {
        // Find existing project from store directly if available, else fetch
        const existingProject = projects.find(p => p.id.toString() === id.toString());
        if (existingProject) {
            setName(existingProject.name);
            setRevisions(Array.isArray(existingProject.revisions) ? existingProject.revisions.join(', ') : (existingProject.revisions || ''));
            setSiliconCorners(existingProject.silicon_corners || '');
            setProjectKey(existingProject.project_key || '');
            if (existingProject.formfactors && existingProject.formfactors.length > 0) {
                setFormfactors(existingProject.formfactors.map((f: any) => ({ name: f.name, revisions: f.revisions.join(', '), boms: f.boms ? f.boms.join(', ') : '' })));
            } else {
                setFormfactors([{ name: '', revisions: '', boms: '' }]);
            }
            setLoading(false);
        } else {
            fetch(`${API_BASE}/projects`)
                .then(res => res.json())
                .then(data => {
                    const project = data.find((p: any) => p.id.toString() === id.toString());
                    if (project) {
                        setName(project.name);
                        setRevisions(Array.isArray(project.revisions) ? project.revisions.join(', ') : (project.revisions || ''));
                        setSiliconCorners(project.silicon_corners || '');
                        setProjectKey(project.project_key || '');
                        if (project.formfactors && project.formfactors.length > 0) {
                            setFormfactors(project.formfactors.map((f: any) => ({ name: f.name, revisions: f.revisions.join(', '), boms: f.boms ? f.boms.join(', ') : '' })));
                        } else {
                            setFormfactors([{ name: '', revisions: '', boms: '' }]);
                        }
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
        const payloadFormfactors = formfactors
            .filter(f => f.name.trim())
            .map(f => ({
                name: f.name.trim(),
                revisions: f.revisions.split(',').map(r => r.trim()).filter(Boolean),
                boms: f.boms ? f.boms.split(',').map(b => b.trim()).filter(Boolean) : []
            }));
        const success = await updateProject(id, { 
            name, description: '', revisions, project_key: projectKey, 
            formfactors: payloadFormfactors, silicon_corners: siliconCorners 
        });
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0 }}>Edit Project</h2>
                    <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-element)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                        {pcbCount} {pcbCount === 1 ? 'PCB' : 'PCBs'}
                    </span>
                </div>
                <button 
                    onClick={handleDelete} 
                    className="delete-icon-button" 
                    title={pcbCount > 0 ? `Cannot delete project with ${pcbCount} active ${pcbCount === 1 ? 'PCB' : 'PCBs'}` : "Delete Project"}
                    disabled={pcbCount > 0}
                    style={{ opacity: pcbCount > 0 ? 0.3 : 1, cursor: pcbCount > 0 ? 'not-allowed' : 'pointer' }}
                >
                    <Trash2 size={20} color="#ef4444" />
                </button>
            </header>

            <form onSubmit={handleUpdate} className="add-form">
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1.5 }}>
                        <label>Project Name</label>
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-panel)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500, border: '1px solid var(--border-color)' }}>
                            {name}
                        </div>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Project Key (3 Letters)
                            <span title="The 3-letter project key is for the links and storing data" style={{ cursor: 'help', display: 'flex' }}>
                                <HelpCircle size={14} color="var(--text-muted)" />
                            </span>
                        </label>
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-panel)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500, textTransform: 'uppercase', border: '1px solid var(--border-color)' }}>
                            {projectKey}
                        </div>
                    </div>
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
                <button type="submit" className="submit-button" disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Update Project'}</span>
                </button>
            </form>
        </div>
    );
}
