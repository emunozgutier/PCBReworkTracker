import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5002/api';

interface EditReworkProps {
    id: string | number;
    onBack: () => void;
    onSuccess: () => void;
}

export function EditRework({ id, onBack, onSuccess }: EditReworkProps) {
    const [pcbs, setPcbs] = useState<any[]>([]);
    const [selectedPcb, setSelectedPcb] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Completed');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch(`${API_BASE}/pcbs`).then(res => res.json()),
            fetch(`${API_BASE}/reworks/${id}`).then(res => res.json())
        ]).then(([pcbData, rework]) => {
            setPcbs(pcbData);
            if (rework) {
                setSelectedPcb(rework.pcb_id.toString());
                setDescription(rework.description);
                setStatus(rework.status);
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
            const res = await fetch(`${API_BASE}/reworks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pcb_id: parseInt(selectedPcb), description, status })
            });
            if (res.ok) onSuccess();
            else alert('Failed to update rework');
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this rework record?')) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/reworks/${id}`, { method: 'DELETE' });
            if (res.ok) onSuccess();
            else alert('Failed to delete rework');
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="loading">Loading Rework...</div>;

    return (
        <div className="add-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Edit Rework</h2>
                <button onClick={handleDelete} className="delete-icon-button" title="Delete Rework">
                    <Trash2 size={20} color="#ef4444" />
                </button>
            </header>

            <form onSubmit={handleUpdate} className="add-form">
                <div className="form-group">
                    <label htmlFor="pcb">Select PCB Board</label>
                    <select 
                        id="pcb" 
                        value={selectedPcb} 
                        onChange={(e) => setSelectedPcb(e.target.value)}
                        required
                    >
                        {pcbs.map(p => <option key={p.id} value={p.id}>{p.board_number}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="description">Rework Description</label>
                    <textarea 
                        id="description"
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)} 
                        rows={4}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
                <button type="submit" className="submit-button" disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Update Rework'}</span>
                </button>
            </form>
        </div>
    );
}
