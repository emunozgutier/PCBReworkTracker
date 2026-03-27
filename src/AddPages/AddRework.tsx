import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { API_BASE } from '../api';
import { useReworkStore } from '../store/storeRework';
import { useStore } from '../store/useStore';
import { useOwnerStore } from '../store/storeOwner';

interface AddReworkProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddRework({ onBack, onSuccess }: AddReworkProps) {
    const { selectedId } = useStore();
    const [pcbs, setPcbs] = useState<any[]>([]);
    const [selectedPcb, setSelectedPcb] = useState('');
    const [description, setDescription] = useState('');
    const [ownerId, setOwnerId] = useState('-1');
    const [images, setImages] = useState<File[]>([]);
    const { addRework, loading } = useReworkStore();
    const { owners, fetchOwners } = useOwnerStore();

    useEffect(() => {
        fetchOwners();
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
        
        const formData = new FormData();
        formData.append('pcb_id', selectedPcb || '');
        formData.append('description', description);
        formData.append('owner_id', ownerId);
        images.forEach(img => {
            formData.append('images', img);
        });

        const success = await addRework(formData);
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
                    <label htmlFor="owner">Assigned Owner</label>
                    <select id="owner" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}>
                        <option value="-1">-- Unassigned --</option>
                        {owners.map(o => <option key={o.id} value={o.id.toString()}>{o.name}</option>)}
                    </select>
                </div>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '8px' }}>Attach Photo Evidence (Up to 3)</label>
                    
                    {images.length > 0 && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                            {images.map((img, i) => (
                                <div key={i} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--accent)' }}>
                                    <img 
                                        src={URL.createObjectURL(img)} 
                                        alt={`Preview ${i}`} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); setImages(images.filter((_, idx) => idx !== i)); }}
                                        style={{ 
                                            position: 'absolute', top: 4, right: 4, 
                                            background: 'rgba(239, 68, 68, 0.9)', color: 'white', 
                                            border: 'none', borderRadius: '50%', width: '22px', height: '22px', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            cursor: 'pointer', fontSize: '14px', fontWeight: 700 
                                        }}
                                    >
                                        &times;
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {images.length < 3 && (
                        <label 
                            htmlFor="image" 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: 'var(--accent)',
                                border: '2px dashed var(--accent)',
                                padding: '20px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '1.05rem',
                                textAlign: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                <circle cx="12" cy="13" r="3"></circle>
                            </svg>
                            {images.length > 0 ? 'Add Another Photo' : 'Open Camera & Take Photo'}
                        </label>
                    )}
                    
                    <input 
                        type="file" 
                        id="image" 
                        accept="image/*" 
                        capture="environment"
                        onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setImages([...images, e.target.files[0]]);
                                e.target.value = ''; // reset file input safely
                            }
                        }} 
                        style={{ display: 'none' }}
                    />
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Rework'}</span>
                </button>
            </form>
        </div>
    );
}
