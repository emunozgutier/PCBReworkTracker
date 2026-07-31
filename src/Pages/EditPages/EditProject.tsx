import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2, HelpCircle, Upload } from 'lucide-react';
import { FormTabs } from '../../components/forms/FormTabs';
import { MultipleInputs } from '../../components/forms/MultipleInputs';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import { usePcbStore } from '../../store/clientDataBase/usePcbStore';
import { RemoveProject } from '../RemovePage/RemoveProject';

import { useAppState } from '../../store/useAppState';

interface EditProjectProps {
    id: string | number;
    onBack: () => void;
    onSuccess: () => void;
}

export function EditProject({ id, onBack, onSuccess }: EditProjectProps) {
    const { currentUserRole } = useAppState();

    if (currentUserRole !== 'Super User') {
        return (
            <div className="add-page-container">
                <header className="add-page-header">
                    <button onClick={onBack} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Access Denied</h2>
                </header>
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>Only Super Users have permission to edit projects.</p>
                </div>
            </div>
        );
    }

    interface EditProjectRevision {
        name: string;
        boms: string;
        schematic?: string | null;
    }
    interface EditProjectFlavor {
        name: string;
        revisions: EditProjectRevision[];
    }

    const [name, setName] = useState('');
    const [revisions, setRevisions] = useState('');
    const [siliconCorners, setSiliconCorners] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [numberFormat, setNumberFormat] = useState<'hex' | 'decimal'>('decimal');
    const [flavors, setFlavors] = useState<EditProjectFlavor[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [activeTab, setActiveTab] = useState(0);
    const [activeRevTab, setActiveRevTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isRemoveOpen, setIsRemoveOpen] = useState(false);
    
    const { projects, updateProject, deleteProject, loading: saving, fetchProjects, fetchSchematics, projectSchematics } = useProjectStore();
    const { pcbs, fetchPcbs } = usePcbStore();



    useEffect(() => {
        if (projects.length === 0) {
            fetchProjects();
        }
    }, [projects.length, fetchProjects]);

    useEffect(() => {
        if (id) {
            fetchSchematics(id);
        }
    }, [id, fetchSchematics]);

    useEffect(() => {
        if (pcbs.length === 0) {
            fetchPcbs();
        }
    }, [pcbs.length, fetchPcbs]);

    const projectPcbs = pcbs.filter(p => p.project === name);
    const pcbCount = projectPcbs.length;

    const getProductUsageCount = (val: string) => {
        if (!val) return 0;
        return projectPcbs.filter(p => p.product && p.product.split(' ').includes(val)).length;
    };



    const getFlavorBomUsageCount = (flavorName: string, val: string) => {
        if (!val) return 0;
        return projectPcbs.filter(p => {
            if (flavorName && p.product && !p.product.startsWith(flavorName)) return false;
            return p.bom === val;
        }).length;
    };

    const filterCountsObj = (valStr: string | undefined | null, counter: (v: string) => number) => {
        if (!valStr) return {};
        return valStr.split(',').reduce((acc, item) => {
            const trimmed = item.trim();
            if (trimmed) acc[trimmed] = counter(trimmed);
            return acc;
        }, {} as Record<string, number>);
    };

    useEffect(() => {
        const existingProject = projects.find(p => p.id.toString() === id.toString());
        if (existingProject) {
            setName(existingProject.name);
            setRevisions(Array.isArray(existingProject.revisions) ? existingProject.revisions.join(', ') : (existingProject.revisions || ''));
            setSiliconCorners(existingProject.silicon_corners || '');
            setProjectKey(existingProject.project_key || '');
            setNumberFormat((existingProject.number_format as 'hex' | 'decimal') || 'decimal');
            if (existingProject.flavors && existingProject.flavors.length > 0) {
                setFlavors(existingProject.flavors.map((f: any) => {
                    const revisionsMapped = f.revisionDetails 
                        ? f.revisionDetails.map((r: any) => ({ name: r.name, boms: r.boms.join(', '), schematic: r.schematic || null }))
                        : f.revisions.map((r: string) => ({ name: r, boms: f.boms ? f.boms.join(', ') : '', schematic: null }));
                    return {
                        name: f.name,
                        revisions: revisionsMapped
                    };
                }));
            } else {
                setFlavors([{ name: '', revisions: [{ name: 'A0', boms: '', schematic: null }] }]);
            }
            setLoading(false);
        }
    }, [id, projects]);


    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const payloadPcbFlavors = flavors.filter(f => f.name.trim() !== '').map(f => {
            const allBoms = Array.from(new Set(f.revisions.flatMap(r => r.boms.split(',').map(b => b.trim()).filter(Boolean))));
            return {
                name: f.name.trim(),
                revisions: f.revisions.map(r => ({
                    name: r.name.trim(),
                    boms: r.boms.split(',').map(b => b.trim()).filter(Boolean),
                    schematic: r.schematic || null
                })),
                boms: allBoms
            };
        });
        const success = await updateProject(id, { 
            name, description: '', revisions, project_key: projectKey, 
            flavors: payloadPcbFlavors, silicon_corners: siliconCorners, number_format: numberFormat 
        }, selectedFiles);
        if (success) {
            onSuccess();
        }
    };

    const handleDelete = () => {
        setIsRemoveOpen(true);
    };

    const handleConfirmedDelete = async () => {
        const success = await deleteProject(id);
        if (success) {
            onSuccess();
        }
    };

    if (loading) return <div className="loading">Loading Project...</div>;

    const activeFlavorName = flavors[activeTab]?.name;
    const activeFlavorInUse = activeFlavorName ? projectPcbs.some(p => p.product && p.product.startsWith(activeFlavorName)) : false;

    const activeRevName = flavors[activeTab]?.revisions[activeRevTab]?.name;
    const activeRevInUse = activeFlavorName && activeRevName 
        ? projectPcbs.some(p => p.product && p.product.startsWith(activeFlavorName) && p.board_rev === activeRevName) 
        : false;

    const loadedSchematics = projectSchematics[id.toString()] || [];

    return (
        <div className="add-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0 }}>Edit Project</h2>
                    <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--bg-element)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        {pcbCount} {pcbCount === 1 ? 'PCB' : 'PCBs'}
                    </span>
                </div>
                <button 
                    onClick={handleDelete} 
                    className="delete-icon-button" 
                    title="Delete Project"
                >
                    <Trash2 size={20} color="#ef4444" />
                </button>
            </header>

            <form onSubmit={handleUpdate} className="add-form">
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 1.5 }}>
                        <label>Project Name</label>
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-panel)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500, border: '1px solid var(--border)' }}>
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
                        <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-panel)', borderRadius: '4px', color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500, textTransform: 'uppercase', border: '1px solid var(--border)' }}>
                            {projectKey}
                        </div>
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="revisions">Global Available Revisions (Optional)</label>
                    <MultipleInputs
                        value={revisions}
                        onChange={setRevisions}
                        placeholder="e.g. A0, A1, B0, B1"
                        usageCounts={filterCountsObj(revisions, getProductUsageCount)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="silicon_corners">Silicon Corners (Optional)</label>
                    <MultipleInputs
                        value={siliconCorners}
                        onChange={setSiliconCorners}
                        placeholder="e.g. TT, FF, SS"
                        usageCounts={filterCountsObj(siliconCorners, getProductUsageCount)}
                    />
                </div>
                <div className="form-group">
                    <label>Board Number Format</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'normal' }}>
                            <input 
                                type="radio" 
                                name="numberFormat" 
                                value="hex" 
                                checked={numberFormat === 'hex'} 
                                onChange={() => setNumberFormat('hex')} 
                            />
                            Hex (0x)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'normal' }}>
                            <input 
                                type="radio" 
                                name="numberFormat" 
                                value="decimal" 
                                checked={numberFormat === 'decimal'} 
                                onChange={() => setNumberFormat('decimal')} 
                            />
                            Decimal
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label>PCB Flavors & Revisions</label>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '-4px', marginBottom: '8px' }}>
                        Define specific flavors (e.g., Demo, Validation) and their allowed revisions.
                    </p>
                    <FormTabs
                        tabs={flavors.map(ff => ff.name)}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onAddTab={() => {
                            setFlavors([...flavors, { name: '', revisions: [{ name: '1.0', boms: '', schematic: null }] }]);
                            setActiveTab(flavors.length);
                            setActiveRevTab(0);
                        }}
                        canDeleteActiveTab={!activeFlavorInUse}
                        onDeleteActiveTab={() => {
                            if (activeFlavorInUse) {
                                alert(`Cannot delete flavor "${activeFlavorName}" because it is currently assigned to one or more PCBs.`);
                                return;
                            }
                            const newFf = flavors.filter((_, i) => i !== activeTab);
                            setFlavors(newFf);
                            setActiveTab(Math.max(0, activeTab - 1));
                            setActiveRevTab(0);
                        }}
                    >
                        {flavors[activeTab] && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Flavor Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Demo" 
                                        value={flavors[activeTab].name} 
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--text)', transition: 'border-color 0.2s ease' }}
                                        onChange={e => {
                                            const newFf = [...flavors];
                                            newFf[activeTab].name = e.target.value;
                                            setFlavors(newFf);
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'block' }}>PCB Revisions & Configuration</label>
                                    <FormTabs
                                        tabs={flavors[activeTab].revisions.map(r => r.name)}
                                        activeTab={activeRevTab}
                                        onTabChange={setActiveRevTab}
                                        fallbackPrefix="Revision"
                                        deleteLabel="Delete This Revision"
                                        deleteDisabledTitle="Revision is currently in use by a PCB or at least one is required."
                                        onAddTab={() => {
                                            const name = prompt("Enter revision name:");
                                            if (!name) return;
                                            const trimmed = name.trim();
                                            if (!trimmed) return;
                                            if (flavors[activeTab].revisions.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
                                                alert("Revision name already exists.");
                                                return;
                                            }
                                            const newRevs = [...flavors[activeTab].revisions, { name: trimmed, boms: '', schematic: null }];
                                            const newFf = [...flavors];
                                            newFf[activeTab].revisions = newRevs;
                                            setFlavors(newFf);
                                            setActiveRevTab(newRevs.length - 1);
                                        }}
                                        onRenameActiveTab={() => {
                                            const currentName = flavors[activeTab].revisions[activeRevTab].name;
                                            const name = prompt("Enter new revision name:", currentName);
                                            if (!name) return;
                                            const trimmed = name.trim();
                                            if (!trimmed || trimmed === currentName) return;
                                            if (flavors[activeTab].revisions.some(r => r.name.toLowerCase() === trimmed.toLowerCase())) {
                                                alert("Revision name already exists.");
                                                return;
                                            }
                                            const newFf = [...flavors];
                                            newFf[activeTab].revisions[activeRevTab].name = trimmed;
                                            setFlavors(newFf);
                                        }}
                                        renameLabel="Rename Revision"
                                        canDeleteActiveTab={flavors[activeTab].revisions.length > 1 && !activeRevInUse}
                                        onDeleteActiveTab={() => {
                                            if (activeRevInUse) {
                                                alert(`Cannot delete revision "${activeRevName}" because it is currently assigned to one or more PCBs.`);
                                                return;
                                            }
                                            const newRevs = flavors[activeTab].revisions.filter((_, i) => i !== activeRevTab);
                                            const newFf = [...flavors];
                                            newFf[activeTab].revisions = newRevs;
                                            setFlavors(newFf);
                                            setActiveRevTab(Math.max(0, activeRevTab - 1));
                                        }}
                                    >
                                        {flavors[activeTab].revisions[activeRevTab] && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>BOM Options</label>
                                                    <MultipleInputs
                                                        value={flavors[activeTab].revisions[activeRevTab].boms}
                                                        onChange={(val) => {
                                                            const newFf = [...flavors];
                                                            newFf[activeTab].revisions[activeRevTab].boms = val;
                                                            setFlavors(newFf);
                                                        }}
                                                        placeholder="e.g. BOM1, BOM2"
                                                        usageCounts={filterCountsObj(flavors[activeTab].revisions[activeRevTab].boms, (val) => getFlavorBomUsageCount(flavors[activeTab].name, val))}
                                                    />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Schematic PDF</label>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <select
                                                            value={flavors[activeTab].revisions[activeRevTab].schematic || ''}
                                                            style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--text)' }}
                                                            onChange={e => {
                                                                const newFf = [...flavors];
                                                                newFf[activeTab].revisions[activeRevTab].schematic = e.target.value;
                                                                setFlavors(newFf);
                                                            }}
                                                        >
                                                            <option value="">-- No Schematic --</option>
                                                            {loadedSchematics.map(s => (
                                                                <option key={s.id} value={s.filename}>{s.filename}</option>
                                                            ))}
                                                            {selectedFiles.map(f => (
                                                                <option key={f.name} value={f.name}>{f.name} (New Upload)</option>
                                                            ))}
                                                        </select>
                                                        
                                                        <input 
                                                            type="file"
                                                            accept=".pdf"
                                                            style={{ display: 'none' }}
                                                            id={`rev-schematic-file-${activeTab}-${activeRevTab}`}
                                                            onChange={(e) => {
                                                                if (e.target.files && e.target.files[0]) {
                                                                    const file = e.target.files[0];
                                                                    if (!selectedFiles.some(f => f.name === file.name)) {
                                                                        setSelectedFiles([...selectedFiles, file]);
                                                                    }
                                                                    const newFf = [...flavors];
                                                                    newFf[activeTab].revisions[activeRevTab].schematic = file.name;
                                                                    setFlavors(newFf);
                                                                }
                                                            }}
                                                        />
                                                        <label 
                                                            htmlFor={`rev-schematic-file-${activeTab}-${activeRevTab}`}
                                                            className="action-btn-hover"
                                                            style={{
                                                                padding: '8px 12px',
                                                                background: 'rgba(255, 255, 255, 0.02)',
                                                                border: '1px dashed var(--border)',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 500,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                color: 'var(--text-muted)'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.borderColor = 'var(--accent)';
                                                                e.currentTarget.style.color = 'var(--text)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.borderColor = 'var(--border)';
                                                                e.currentTarget.style.color = 'var(--text-muted)';
                                                            }}
                                                        >
                                                            <Upload size={14} />
                                                            Upload New
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </FormTabs>
                                </div>
                            </div>
                        )}
                    </FormTabs>
                </div>

                <button type="submit" className="submit-button" disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Update Project'}</span>
                </button>
            </form>

            <RemoveProject 
                isOpen={isRemoveOpen}
                onClose={() => setIsRemoveOpen(false)}
                onConfirm={handleConfirmedDelete}
                project={{ id, name, pcb_count: pcbCount }}
            />
        </div>
    );
}
