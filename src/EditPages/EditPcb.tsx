import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

import { API_BASE } from '../api';
import { usePcbStore } from '../store/storePcb';

interface EditPCBProps {
    id: string | number;
    onBack: () => void;
    onSuccess: () => void;
}

export function EditPCB({ id, onBack, onSuccess }: EditPCBProps) {
    const [boardNumber, setBoardNumber] = useState('');
    const [status, setStatus] = useState('In Progress');
    const [pcbRev, setPcbRev] = useState('');
    const [noPartYet, setNoPartYet] = useState(false);
    const [selectedRevision, setSelectedRevision] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedOwner, setSelectedOwner] = useState('');
    
    const [projects, setProjects] = useState<any[]>([]);
    const [owners, setOwners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { updatePcb, deletePcb } = usePcbStore();
    const [saving, setSaving] = useState(false);

    const selectedProjData = projects.find(p => p.id.toString() === selectedProject);
    const availableRevisions = selectedProjData?.revisions || [];
    const selectedProjectKey = selectedProjData?.project_key || 'XXX';

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 4);
        setBoardNumber(val);
    };

    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE}/projects`).then(res => res.json()),
            fetch(`${API_BASE}/owners`).then(res => res.json()),
            fetch(`${API_BASE}/pcbs/${id}`).then(res => res.json())
        ]).then(([projData, ownerData, pcb]) => {
            setProjects(projData);
            setOwners(ownerData);
            if (pcb) {
                const parts = pcb.board_number.split('-');
                const hexPart = parts.length > 1 ? parts.slice(1).join('-') : pcb.board_number;
                setBoardNumber(hexPart);
                setStatus(pcb.status);
                
                // Try to split product_name_and_rev
                const project = projData.find((p: any) => p.id === pcb.project_id);
                let rawProduct = pcb.product_name_and_rev || '';
                let foundRev = '';
                
                if (project && project.revisions) {
                    for (const rev of project.revisions) {
                        if (rawProduct.endsWith(rev)) {
                            foundRev = rev;
                            rawProduct = rawProduct.slice(0, -rev.length).trim();
                            break;
                        }
                    }
                }
                
                if (rawProduct === "No part yet") {
                    setNoPartYet(true);
                    setPcbRev('');
                } else {
                    setNoPartYet(false);
                    setPcbRev(rawProduct);
                }
                setSelectedRevision(foundRev);
                setSelectedProject(pcb.project_id.toString());
                setSelectedOwner(pcb.owner_id ? pcb.owner_id.toString() : '');
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [id]);

    const handleProjectChange = (id: string) => {
        setSelectedProject(id);
        const project = projects.find(p => p.id.toString() === id);
        if (project && project.revisions && project.revisions.length > 0) {
            setSelectedRevision(project.revisions[0]);
        } else {
            setSelectedRevision('');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const finalPcbRev = noPartYet ? "No part yet" : pcbRev;
        const combinedProduct = selectedRevision ? `${finalPcbRev} ${selectedRevision}`.trim() : finalPcbRev;
        const finalBoardName = `${selectedProjectKey}-${boardNumber.toUpperCase()}`;
        
        const success = await updatePcb(id, {
            board_number: finalBoardName,
            status,
            product_name_and_rev: combinedProduct,
            project_id: selectedProject ? parseInt(selectedProject) : null,
            owner_id: selectedOwner ? parseInt(selectedOwner) : null
        });
        if (success) onSuccess();
        setSaving(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this PCB?')) return;
        setSaving(true);
        const success = await deletePcb(id);
        if (success) onSuccess();
        setSaving(false);
    };

    if (loading) return <div className="loading">Loading PCB...</div>;

    return (
        <div className="add-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Edit PCB Board</h2>
                <button onClick={handleDelete} className="delete-icon-button" title="Delete PCB">
                    <Trash2 size={20} color="#ef4444" />
                </button>
            </header>

            <form onSubmit={handleUpdate} className="add-form">
                <div className="form-group">
                    <label htmlFor="board_number">Board Number (4-Digit Hex)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                            {selectedProjectKey}-
                        </span>
                        <input 
                            id="board_number"
                            type="text" 
                            maxLength={4}
                            value={boardNumber} 
                            onChange={handleHexChange} 
                            placeholder="e.g. 00A1"
                            style={{ textTransform: 'uppercase', width: '120px' }}
                            required 
                        />
                    </div>
                </div>
                
                <div className="form-row">
                    <div className="form-group flex-1">
                        <label htmlFor="pcb_rev">PCB Rev Number</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input 
                                id="pcb_rev"
                                type="number" 
                                step="any"
                                value={pcbRev} 
                                onChange={(e) => setPcbRev(e.target.value)} 
                                disabled={noPartYet}
                                required={!noPartYet}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input 
                                    type="checkbox" 
                                    checked={noPartYet} 
                                    onChange={(e) => {
                                        setNoPartYet(e.target.checked);
                                        if (e.target.checked) setPcbRev('');
                                    }} 
                                />
                                No part yet
                            </label>
                        </div>
                    </div>
                    <div className="form-group flex-1">
                        <label htmlFor="revision">Revision</label>
                        <select 
                            id="revision"
                            value={selectedRevision}
                            onChange={(e) => setSelectedRevision(e.target.value)}
                        >
                            <option value="">N/A</option>
                            {availableRevisions.map((rev: string) => (
                                <option key={rev} value={rev}>{rev}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group flex-1">
                        <label htmlFor="project">Project</label>
                        <select 
                            id="project" 
                            value={selectedProject} 
                            onChange={(e) => handleProjectChange(e.target.value)}
                        >
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group flex-1">
                        <label htmlFor="status">Status</label>
                        <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Scrapped">Scrapped</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="owner">Owner</label>
                    <select 
                        id="owner" 
                        value={selectedOwner} 
                        onChange={(e) => setSelectedOwner(e.target.value)}
                    >
                        <option value="">Unassigned</option>
                        {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </select>
                </div>
                <button type="submit" className="submit-button" disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Update PCB Board'}</span>
                </button>
            </form>
        </div>
    );
}
