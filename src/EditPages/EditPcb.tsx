import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

import { API_BASE } from '../apiBridge';
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
    const [bom, setBom] = useState('');
    const [noPartYet, setNoPartYet] = useState(false);
    const [selectedRevision, setSelectedRevision] = useState('');
    const [selectedFormfactor, setSelectedFormfactor] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [selectedOwner, setSelectedOwner] = useState('');
    const [siliconVersion, setSiliconVersion] = useState('');
    
    const [projects, setProjects] = useState<any[]>([]);
    const [owners, setOwners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { updatePcb, deletePcb } = usePcbStore();
    const [saving, setSaving] = useState(false);

    const selectedProjData = projects.find(p => p.id.toString() === selectedProject);
    const availableFormfactors = selectedProjData?.formfactors || [];
    const availableSiliconVersions = selectedProjData?.silicon_corners ? selectedProjData.silicon_corners.split(',').map((s: string) => s.trim()).filter(Boolean) : [];
    
    let availableRevisions: string[] = [];
    if (selectedFormfactor) {
        const ff = availableFormfactors.find((f: any) => f.name === selectedFormfactor);
        availableRevisions = ff ? ff.revisions : [];
    } else {
        availableRevisions = selectedProjData?.revisions || [];
    }
    const selectedProjectKey = selectedProjData?.project_key || 'XXX';

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
                setBom(pcb.bom || '');
                
                // Try to split product_name_and_rev
                const project = projData.find((p: any) => p.id === pcb.project_id);
                let rawProduct = pcb.product_name_and_rev || '';
                let foundRev = '';
                let foundFormfactor = '';
                let foundSilicon = '';
                
                if (project) {
                    // Extract Silicon Corner if present at the end
                    if (project.silicon_corners) {
                        const corners = project.silicon_corners.split(',').map((s: string) => s.trim()).filter(Boolean);
                        for (const corner of corners) {
                            if (rawProduct.endsWith(` ${corner}`) || rawProduct === corner) {
                                foundSilicon = corner;
                                rawProduct = rawProduct.slice(0, rawProduct.length - corner.length).trim();
                                break;
                            }
                        }
                    }

                    if (project.formfactors && project.formfactors.length > 0) {
                        for (const ff of project.formfactors) {
                            if (rawProduct.startsWith(ff.name)) {
                                foundFormfactor = ff.name;
                                rawProduct = rawProduct.slice(ff.name.length).trim();
                                for (const rev of ff.revisions) {
                                    if (rawProduct.endsWith(` ${rev}`) || rawProduct === rev) {
                                        foundRev = rev;
                                        rawProduct = rawProduct.slice(0, rawProduct.length - rev.length).trim();
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    if (!foundFormfactor && project.revisions) {
                        for (const rev of project.revisions) {
                            if (rawProduct.endsWith(` ${rev}`) || rawProduct === rev) {
                                foundRev = rev;
                                rawProduct = rawProduct.slice(0, rawProduct.length - rev.length).trim();
                                break;
                            }
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
                setSiliconVersion(foundSilicon);
                setSelectedFormfactor(foundFormfactor);
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
        
        if (project && project.silicon_corners) {
            const corners = project.silicon_corners.split(',').map((s: string) => s.trim()).filter(Boolean);
            setSiliconVersion(corners.length > 0 ? corners[0] : '');
        } else {
            setSiliconVersion('');
        }

        if (project && project.formfactors && project.formfactors.length > 0) {
            setSelectedFormfactor(project.formfactors[0].name);
            setSelectedRevision(project.formfactors[0].revisions[0] || '');
        } else if (project && project.revisions && project.revisions.length > 0) {
            setSelectedFormfactor('');
            setSelectedRevision(project.revisions[0]);
        } else {
            setSelectedFormfactor('');
            setSelectedRevision('');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const finalPcbRev = noPartYet ? "No part yet" : pcbRev;
        const revPart = selectedRevision ? selectedRevision : '';
        const ffPart = selectedFormfactor ? selectedFormfactor : '';
        const combinedProduct = [ffPart, finalPcbRev, revPart, siliconVersion].filter(Boolean).join(' ').trim();
        const finalBoardName = `${selectedProjectKey}-${boardNumber.toUpperCase()}`;
        
        const success = await updatePcb(id, {
            board_number: finalBoardName,
            status,
            product_name_and_rev: combinedProduct,
            bom: bom.trim(),
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
                {/* Row 1: Project & Silicon Version */}
                <div className="form-row">
                    <div className="form-group flex-1">
                        <label htmlFor="project">Project *</label>
                        <select 
                            id="project" 
                            value={selectedProject} 
                            onChange={(e) => handleProjectChange(e.target.value)}
                        >
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group flex-1">
                        <label htmlFor="silicon_version">Silicon Version</label>
                        <select 
                            id="silicon_version"
                            value={siliconVersion}
                            onChange={(e) => setSiliconVersion(e.target.value)}
                        >
                            <option value="">N/A</option>
                            {availableSiliconVersions.map((v: string) => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group flex-1">
                        <label htmlFor="pcb_rev">PCB Rev Number</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <input 
                                id="pcb_rev"
                                type="number" 
                                step="any"
                                value={pcbRev} 
                                onChange={(e) => setPcbRev(e.target.value)} 
                                disabled={noPartYet}
                                required={!noPartYet}
                                style={{ flex: 1, minWidth: '80px' }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal', fontSize: '0.9rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
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
                </div>

                {/* Row 2: Flavor, Revision, BOM */}
                <div className="form-row">
                    <div className="form-group flex-1">
                        <label htmlFor="formfactor">PCB Flavor</label>
                        <select 
                            id="formfactor"
                            value={selectedFormfactor}
                            onChange={(e) => {
                                setSelectedFormfactor(e.target.value);
                                const ff = availableFormfactors.find((f: any) => f.name === e.target.value);
                                setSelectedRevision(ff && ff.revisions.length > 0 ? ff.revisions[0] : '');
                            }}
                        >
                            <option value="">N/A</option>
                            {availableFormfactors.map((ff: any) => (
                                <option key={ff.name} value={ff.name}>{ff.name}</option>
                            ))}
                        </select>
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
                    <div className="form-group flex-1">
                        <label htmlFor="bom">BOM (Optional)</label>
                        <input 
                            id="bom"
                            type="text" 
                            value={bom} 
                            onChange={(e) => setBom(e.target.value)} 
                            placeholder="e.g. BOM1"
                        />
                    </div>
                </div>

                {/* Row 3: Auto assigned PCB name + Owner + Status */}
                <div className="form-row">
                    <div className="form-group flex-1">
                        <label htmlFor="board_number">Assigned PCB Name</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                                {selectedProjectKey}-
                            </span>
                            <input 
                                id="board_number"
                                type="text" 
                                value={boardNumber} 
                                disabled={true}
                                style={{ width: '120px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
                            />
                        </div>
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

                <button type="submit" className="submit-button" disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Update PCB Board'}</span>
                </button>
            </form>
        </div>
    );
}
