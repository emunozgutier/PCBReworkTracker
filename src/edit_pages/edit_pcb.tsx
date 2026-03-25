import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

import { API_BASE } from '../api';

interface EditPCBProps {
    id: string | number;
    onBack: () => void;
    onSuccess: () => void;
}

export function EditPCB({ id, onBack, onSuccess }: EditPCBProps) {
    const [boardNumber, setBoardNumber] = useState('');
    const [status, setStatus] = useState('In Progress');
    const [productName, setProductName] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedOwner, setSelectedOwner] = useState('');
    
    const [projects, setProjects] = useState<any[]>([]);
    const [owners, setOwners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE}/projects`).then(res => res.json()),
            fetch(`${API_BASE}/owners`).then(res => res.json()),
            fetch(`${API_BASE}/pcbs/${id}`).then(res => res.json())
        ]).then(([projData, ownerData, pcb]) => {
            setProjects(projData);
            setOwners(ownerData);
            if (pcb) {
                setBoardNumber(pcb.board_number);
                setStatus(pcb.status);
                setProductName(pcb.product_name_and_rev || '');
                setSelectedProject(pcb.project_id.toString());
                setSelectedOwner(pcb.owner_id ? pcb.owner_id.toString() : '');
            }
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [id]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/pcbs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    board_number: boardNumber, 
                    status, 
                    product_name_and_rev: productName,
                    project_id: parseInt(selectedProject),
                    owner_id: selectedOwner ? parseInt(selectedOwner) : null
                })
            });
            if (res.ok) onSuccess();
            else alert('Failed to update PCB');
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this PCB?')) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/pcbs/${id}`, { method: 'DELETE' });
            if (res.ok) onSuccess();
            else alert('Failed to delete PCB');
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
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
                    <label htmlFor="board_number">Board Number</label>
                    <input 
                        id="board_number"
                        type="text" 
                        value={boardNumber} 
                        onChange={(e) => setBoardNumber(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="product_name">Product Name & Rev</label>
                    <input 
                        id="product_name"
                        type="text" 
                        value={productName} 
                        onChange={(e) => setProductName(e.target.value)} 
                    />
                </div>
                <div className="form-row">
                    <div className="form-group flex-1">
                        <label htmlFor="project">Project</label>
                        <select 
                            id="project" 
                            value={selectedProject} 
                            onChange={(e) => setSelectedProject(e.target.value)}
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
