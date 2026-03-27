import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { API_BASE } from '../api';
import { useReworkStore } from '../store/storeRework';
import { useStore } from '../store/useStore';

interface AddReworkProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddRework({ onBack, onSuccess }: AddReworkProps) {
    const { selectedId } = useStore();
    const [pcbs, setPcbs] = useState<any[]>([]);
    const [selectedPcb, setSelectedPcb] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('Completed');
    const { addRework, loading } = useReworkStore();

    useEffect(() => {
        fetch(`${API_BASE}/pcbs`)
            .then(res => res.json())
            .then(data => {
                setPcbs(data);
                if (selectedId) {
                    setSelectedPcb(selectedId.toString());
                } else if (data.length > 0) {
                    setSelectedPcb(data[0].id.toString());
                }
            })
            .catch(err => console.error('Failed to fetch PCBs:', err));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await addRework({
            pcb_id: selectedPcb ? parseInt(selectedPcb) : null,
            description,
            status
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
                <h2>Add Rework Record</h2>
            </header>

            <form onSubmit={handleSubmit} className="add-form">
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
                        placeholder="Detail the repairs or modifications..."
                        rows={4}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="status">Resulting Status</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Failed">Failed</option>
                    </select>
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Rework'}</span>
                </button>
            </form>
        </div>
    );
}
