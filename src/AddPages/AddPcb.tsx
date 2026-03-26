import { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

import { API_BASE } from '../api';

interface AddPCBProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function AddPCB({ onBack, onSuccess }: AddPCBProps) {
    const [boardNumber, setBoardNumber] = useState('');
    const [status, setStatus] = useState('In Progress');
    const [productName, setProductName] = useState('');
    const [selectedRevision, setSelectedRevision] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedOwner, setSelectedOwner] = useState('');
    
    const [projects, setProjects] = useState<any[]>([]);
    const [owners, setOwners] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const availableRevisions = projects.find(p => p.id.toString() === selectedProject)?.revisions || [];

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
        setLoading(true);
        const combinedProduct = selectedRevision ? `${productName} ${selectedRevision}`.trim() : productName;
        try {
            const res = await fetch(`${API_BASE}/pcbs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    board_number: boardNumber, 
                    status, 
                    product_name_and_rev: combinedProduct,
                    project_id: parseInt(selectedProject),
                    owner_id: parseInt(selectedOwner)
                })
            });
            if (res.ok) {
                onSuccess();
            } else {
                alert('Failed to add PCB');
            }
        } catch (err) {
            console.error(err);
            alert('Error connecting to server');
        } finally {
            setLoading(false);
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
                    <label htmlFor="board_number">Board Number</label>
                    <input 
                        id="board_number"
                        type="text" 
                        value={boardNumber} 
                        onChange={(e) => setBoardNumber(e.target.value)} 
                        placeholder="e.g. ARES-001"
                        required 
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group flex-1">
                        <label htmlFor="product_name">Product Name</label>
                        <input 
                            id="product_name"
                            type="text" 
                            value={productName} 
                            onChange={(e) => setProductName(e.target.value)} 
                            placeholder="e.g. ARES"
                        />
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
