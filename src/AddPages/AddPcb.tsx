import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { API_BASE } from '../api';
import { usePcbStore } from '../store/storePcb';

interface AddPCBProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddPCB({ onBack, onSuccess }: AddPCBProps) {
    const [boardNumber, setBoardNumber] = useState('');
    const [status] = useState('In Progress');
    const [pcbRev, setPcbRev] = useState('');
    const [noPartYet, setNoPartYet] = useState(false);
    const [selectedRevision, setSelectedRevision] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedOwner, setSelectedOwner] = useState('');
    
    const [projects, setProjects] = useState<any[]>([]);
    const [owners, setOwners] = useState<any[]>([]);
    const { addPcb, loading } = usePcbStore();

    const selectedProjData = projects.find(p => p.id.toString() === selectedProject);
    const availableRevisions = selectedProjData?.revisions || [];
    const selectedProjectKey = selectedProjData?.project_key || 'XXX';

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase().slice(0, 4);
        setBoardNumber(val);
    };

    useEffect(() => {
        // Fetch projects and owners for dropdowns
        Promise.all([
            fetch(`${API_BASE}/projects`).then(res => res.json()),
            fetch(`${API_BASE}/owners`).then(res => res.json())
        ]).then(([projData, ownerData]) => {
            setProjects(projData);
            setOwners(ownerData);
            if (projData.length > 0) {
                const firstProj = projData[0];
                setSelectedProject(firstProj.id.toString());
                if (firstProj.revisions && firstProj.revisions.length > 0) {
                    setSelectedRevision(firstProj.revisions[0]);
                }
            }
            if (ownerData.length > 0) setSelectedOwner(ownerData[0].id.toString());
        }).catch(err => console.error('Failed to pre-fetch data:', err));
    }, []);

    const handleProjectChange = (id: string) => {
        setSelectedProject(id);
        const project = projects.find(p => p.id.toString() === id);
        if (project && project.revisions && project.revisions.length > 0) {
            setSelectedRevision(project.revisions[0]);
        } else {
            setSelectedRevision('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const finalPcbRev = noPartYet ? "No part yet" : pcbRev;
        const combinedProduct = selectedRevision ? `${finalPcbRev} ${selectedRevision}`.trim() : finalPcbRev;
        const finalBoardName = `${selectedProjectKey}-${boardNumber.toUpperCase()}`;
        
        const success = await addPcb({
            board_number: finalBoardName,
            status,
            product_name_and_rev: combinedProduct,
            project_id: selectedProject ? parseInt(selectedProject) : null,
            owner_id: selectedOwner ? parseInt(selectedOwner) : null
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
                <h2>Add New PCB Board</h2>
            </header>

            <form onSubmit={handleSubmit} className="add-form">
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
                                placeholder="e.g. 1.2"
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
                        <label htmlFor="revision">Project Rev</label>
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
                </div>
                <button type="submit" className="submit-button" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save PCB Board'}</span>
                </button>
            </form>
        </div>
    );
}
