import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2, HelpCircle, Upload, FileText, Cpu, Layers } from 'lucide-react';
import { FormTabs } from '../../components/forms/FormTabs';
import { MultipleInputs } from '../../components/forms/MultipleInputs';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import type { Package } from '../../store/clientDataBase/useProjectStore';
import { usePcbStore } from '../../store/clientDataBase/usePcbStore';
import { RemoveProject } from '../RemovePage/RemoveProject';
import { useAppState } from '../../store/useAppState';
import { usePermissionsStore } from '../../store/clientDataBase/usePermissionsStore';

interface EditProjectProps {
    id: string | number;
    onBack: () => void;
    onSuccess: () => void;
}

interface FormRevision {
    name: string;
    boms: string;
    schematic?: string | null;
    board_file?: string | null;
    bom_csv?: string | null;
    datasheet?: string | null;
}

interface FormBoardFormFactor {
    name: string;
    revisions: FormRevision[];
}

interface FormSiliconVersion {
    name: string;
    silicon_corners: string;
    formfactors: FormBoardFormFactor[];
}

interface FormPackage {
    name: string;
    silicon_versions: FormSiliconVersion[];
}

export function EditProject({ id, onBack, onSuccess }: EditProjectProps) {
    const { currentUserRole } = useAppState();
    const { permissions } = usePermissionsStore();

    const canEditProject = currentUserRole === 'Super User' ||
        (currentUserRole === 'User' && permissions['Projects__Edit__user'] === true) ||
        (currentUserRole === 'Guest' && permissions['Projects__Edit__guest'] === true);

    if (!canEditProject) {
        return (
            <div className="project-page-container">
                <header className="add-page-header">
                    <button onClick={onBack} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Access Denied</h2>
                </header>
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>You do not have permission to edit projects.</p>
                </div>
            </div>
        );
    }

    const [name, setName] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [numberFormat, setNumberFormat] = useState<'hex' | 'decimal'>('decimal');
    const [packages, setPackages] = useState<FormPackage[]>([]);
    
    const [activePkgTab, setActivePkgTab] = useState(0);
    const [activeSiTab, setActiveSiTab] = useState(0);
    const [activeFfTab, setActiveFfTab] = useState(0);
    const [activeRevTab, setActiveRevTab] = useState(0);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRemoveOpen, setIsRemoveOpen] = useState(false);
    
    const { projects, updateProject, deleteProject, loading: saving, fetchProjects, fetchDocs } = useProjectStore();
    const { pcbs, fetchPcbs } = usePcbStore();

    useEffect(() => {
        if (projects.length === 0) {
            fetchProjects();
        }
    }, [projects.length, fetchProjects]);

    useEffect(() => {
        if (id) {
            fetchDocs(id);
        }
    }, [id, fetchDocs]);

    useEffect(() => {
        if (pcbs.length === 0) {
            fetchPcbs();
        }
    }, [pcbs.length, fetchPcbs]);

    const projectPcbs = pcbs.filter(p => p.project === name);
    const pcbCount = projectPcbs.length;

    useEffect(() => {
        const existingProject = projects.find(p => p.id.toString() === id.toString());
        if (existingProject) {
            setName(existingProject.name);
            setProjectKey(existingProject.project_key || '');
            setNumberFormat((existingProject.number_format as 'hex' | 'decimal') || 'decimal');
            
            if (existingProject.packages && existingProject.packages.length > 0) {
                const mappedPackages: FormPackage[] = existingProject.packages.map((pkg: Package) => ({
                    name: pkg.name,
                    silicon_versions: (pkg.silicon_versions || []).map(sv => ({
                        name: sv.name,
                        silicon_corners: Array.isArray(sv.silicon_corners) ? sv.silicon_corners.join(', ') : (sv.silicon_corners || ''),
                        formfactors: (sv.formfactors || []).map(ff => ({
                            name: ff.name,
                            revisions: (ff.revisionDetails || []).map(r => ({
                                name: r.name,
                                boms: Array.isArray(r.boms) ? r.boms.join(', ') : (r.boms || ''),
                                schematic: r.schematic || r.doc || null,
                                board_file: r.board_file || null,
                                bom_csv: r.bom_csv || null,
                                datasheet: r.datasheet || null
                            }))
                        }))
                    }))
                }));
                setPackages(mappedPackages);
            } else {
                // Fallback to initial package structure
                setPackages([
                    {
                        name: 'Default Package',
                        silicon_versions: [
                            {
                                name: 'A0',
                                silicon_corners: 'TT',
                                formfactors: [
                                    {
                                        name: 'Demo',
                                        revisions: [
                                            { name: '1.0', boms: 'BOM1', schematic: null, board_file: null, bom_csv: null, datasheet: null }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]);
            }
            setLoading(false);
        }
    }, [id, projects]);

    const currentPkg = packages[activePkgTab] || packages[0];
    const currentSi = currentPkg?.silicon_versions[activeSiTab] || currentPkg?.silicon_versions[0];
    const currentFf = currentSi?.formfactors[activeFfTab] || currentSi?.formfactors[0];
    const currentRev = currentFf?.revisions[activeRevTab] || currentFf?.revisions[0];

    const handleFileUpload = (file: File, updateRevField: (filename: string) => void) => {
        if (!selectedFiles.some(f => f.name === file.name)) {
            setSelectedFiles(prev => [...prev, file]);
        }
        updateRevField(file.name);
    };

    const handleAddPackage = () => {
        const newPkgNum = packages.length + 1;
        setPackages([
            ...packages,
            {
                name: `Package ${newPkgNum}`,
                silicon_versions: [
                    {
                        name: 'A0',
                        silicon_corners: 'TT, FF, SS',
                        formfactors: [
                            {
                                name: 'Demo',
                                revisions: [
                                    {
                                        name: '1.0',
                                        boms: 'BOM1, BOM2',
                                        schematic: null,
                                        board_file: null,
                                        bom_csv: null,
                                        datasheet: null
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]);
        setActivePkgTab(packages.length);
        setActiveSiTab(0);
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleDeletePackage = () => {
        if (packages.length <= 1) return;
        const updated = packages.filter((_, idx) => idx !== activePkgTab);
        setPackages(updated);
        setActivePkgTab(Math.max(0, activePkgTab - 1));
        setActiveSiTab(0);
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleAddSilicon = () => {
        if (!currentPkg) return;
        const newSiNum = currentPkg.silicon_versions.length;
        const letters = ['A', 'B', 'C', 'D', 'E'];
        const siName = `${letters[newSiNum % letters.length] || 'X'}0`;
        const updated = [...packages];
        updated[activePkgTab].silicon_versions.push({
            name: siName,
            silicon_corners: 'TT, FF, SS',
            formfactors: [
                {
                    name: 'Demo',
                    revisions: [
                        {
                            name: '1.0',
                            boms: 'BOM1, BOM2',
                            schematic: null,
                            board_file: null,
                            bom_csv: null,
                            datasheet: null
                        }
                    ]
                }
            ]
        });
        setPackages(updated);
        setActiveSiTab(currentPkg.silicon_versions.length - 1);
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleDeleteSilicon = () => {
        if (!currentPkg || currentPkg.silicon_versions.length <= 1) return;
        const updated = [...packages];
        updated[activePkgTab].silicon_versions = currentPkg.silicon_versions.filter((_, idx) => idx !== activeSiTab);
        setPackages(updated);
        setActiveSiTab(Math.max(0, activeSiTab - 1));
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleAddFormFactor = () => {
        if (!currentSi) return;
        const newFfNum = currentSi.formfactors.length + 1;
        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors.push({
            name: `FormFactor ${newFfNum}`,
            revisions: [
                {
                    name: '1.0',
                    boms: 'BOM1, BOM2',
                    schematic: null,
                    board_file: null,
                    bom_csv: null,
                    datasheet: null
                }
            ]
        });
        setPackages(updated);
        setActiveFfTab(currentSi.formfactors.length - 1);
        setActiveRevTab(0);
    };

    const handleDeleteFormFactor = () => {
        if (!currentSi || currentSi.formfactors.length <= 1) return;
        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors = currentSi.formfactors.filter((_, idx) => idx !== activeFfTab);
        setPackages(updated);
        setActiveFfTab(Math.max(0, activeFfTab - 1));
        setActiveRevTab(0);
    };

    const handleAddRevision = () => {
        if (!currentFf) return;
        const newRevNum = currentFf.revisions.length + 1;
        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions.push({
            name: `${newRevNum}.0`,
            boms: 'BOM1, BOM2',
            schematic: null,
            board_file: null,
            bom_csv: null,
            datasheet: null
        });
        setPackages(updated);
        setActiveRevTab(currentFf.revisions.length - 1);
    };

    const handleDeleteRevision = () => {
        if (!currentFf || currentFf.revisions.length <= 1) return;
        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions = currentFf.revisions.filter((_, idx) => idx !== activeRevTab);
        setPackages(updated);
        setActiveRevTab(Math.max(0, activeRevTab - 1));
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const payloadPackages = packages.map(pkg => ({
            name: pkg.name.trim() || 'Default Package',
            silicon_versions: pkg.silicon_versions.map(sv => ({
                name: sv.name.trim() || 'A0',
                silicon_corners: sv.silicon_corners.split(',').map(s => s.trim()).filter(Boolean),
                formfactors: sv.formfactors.map(ff => ({
                    name: ff.name.trim() || 'Default',
                    revisions: ff.revisions.map(r => r.name.trim() || '1.0'),
                    revisionDetails: ff.revisions.map(r => ({
                        name: r.name.trim() || '1.0',
                        boms: r.boms.split(',').map(b => b.trim()).filter(Boolean),
                        schematic: r.schematic || null,
                        board_file: r.board_file || null,
                        bom_csv: r.bom_csv || null,
                        datasheet: r.datasheet || null,
                        doc: r.schematic || null
                    }))
                }))
            }))
        }));

        const success = await updateProject(id, {
            name,
            project_key: projectKey,
            number_format: numberFormat,
            packages: payloadPackages as any
        }, selectedFiles);

        if (success) {
            onSuccess();
        }
    };

    const handleDelete = async () => {
        const success = await deleteProject(id);
        if (success) {
            setIsRemoveOpen(false);
            onSuccess();
        }
    };

    if (loading) return <div className="loading">Loading project...</div>;

    const fileOptions = Array.from(new Set([
        ...selectedFiles.map(f => f.name),
        ...(currentRev?.schematic ? [currentRev.schematic] : []),
        ...(currentRev?.board_file ? [currentRev.board_file] : []),
        ...(currentRev?.bom_csv ? [currentRev.bom_csv] : []),
        ...(currentRev?.datasheet ? [currentRev.datasheet] : []),
    ])).filter(Boolean);

    return (
        <div className="project-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Edit Project</h2>
                <button 
                    type="button" 
                    onClick={() => setIsRemoveOpen(true)} 
                    className="delete-icon-button"
                    title="Delete Project"
                    style={{ marginLeft: 'auto' }}
                >
                    <Trash2 size={20} />
                </button>
            </header>

            <form onSubmit={handleUpdate} className="add-form">
                <div className="form-group">
                    <label htmlFor="name">Project Name</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="project_key" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Project Key (3 Letters)
                        <span title="The 3-letter project key cannot be easily changed once assigned" style={{ cursor: 'help', display: 'flex' }}>
                            <HelpCircle size={14} color="var(--text-muted)" />
                        </span>
                    </label>
                    <input 
                        id="project_key"
                        type="text" 
                        maxLength={3}
                        value={projectKey} 
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed', textTransform: 'uppercase' }}
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

                {/* --- HARDWARE HIERARCHY SECTION (FULL WIDTH - NO NESTED INDENTATION) --- */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    backgroundColor: 'rgba(255, 255, 255, 0.015)'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <Layers size={20} color="var(--accent)" />
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
                                Hardware Hierarchy Configuration
                            </h3>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Configure packages, silicon versions, board form factors, and revisions. Each section maintains full width.
                        </p>
                    </div>

                    {/* Breadcrumb Path Bar */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ color: 'var(--text-muted)' }}>Configuring Branch:</span>
                        <span style={{ color: '#818cf8', fontWeight: 600 }}>📦 {currentPkg?.name || 'Package'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>›</span>
                        <span style={{ color: '#c084fc', fontWeight: 600 }}>⚡ {currentSi?.name || 'Silicon'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>›</span>
                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>🖥️ {currentFf?.name || 'Board'}</span>
                        <span style={{ color: 'var(--text-muted)' }}>›</span>
                        <span style={{ color: '#34d399', fontWeight: 600 }}>📋 {currentRev?.name || 'Revision'}</span>
                    </div>

                    {/* LEVEL 1: PACKAGES */}
                    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>1</span>
                                <label style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Packages</label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(e.g. 40 pin, 48 pin IC, BGA-128)</span>
                            </div>
                        </div>

                        <FormTabs
                            tabs={packages.map(p => p.name || 'Unnamed Package')}
                            activeTab={activePkgTab}
                            onTabChange={(idx) => {
                                setActivePkgTab(idx);
                                setActiveSiTab(0);
                                setActiveFfTab(0);
                                setActiveRevTab(0);
                            }}
                            onAddTab={handleAddPackage}
                            onDeleteActiveTab={handleDeletePackage}
                            canDeleteActiveTab={packages.length > 1}
                        >
                            {currentPkg && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '220px' }}>
                                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-muted)' }}>Package Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 40 pin QFN" 
                                            value={currentPkg.name} 
                                            style={{ width: '100%', padding: '0.55rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text)' }}
                                            onChange={e => {
                                                const updated = [...packages];
                                                updated[activePkgTab].name = e.target.value;
                                                setPackages(updated);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </FormTabs>
                    </div>

                    {/* LEVEL 2: SILICON VERSIONS */}
                    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>2</span>
                                <Cpu size={16} color="#a855f7" />
                                <label style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
                                    Silicon Versions for <span style={{ color: '#818cf8' }}>"{currentPkg?.name || 'Package'}"</span>
                                </label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(e.g. A0, B0)</span>
                            </div>
                        </div>

                        <FormTabs
                            tabs={currentPkg ? currentPkg.silicon_versions.map(sv => sv.name || 'Unnamed Version') : []}
                            activeTab={activeSiTab}
                            onTabChange={(idx) => {
                                setActiveSiTab(idx);
                                setActiveFfTab(0);
                                setActiveRevTab(0);
                            }}
                            onAddTab={handleAddSilicon}
                            onDeleteActiveTab={handleDeleteSilicon}
                            canDeleteActiveTab={currentPkg ? currentPkg.silicon_versions.length > 1 : false}
                        >
                            {currentSi && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 280px) 1fr', gap: '16px', alignItems: 'start' }}>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-muted)' }}>Silicon Version</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. A0" 
                                            value={currentSi.name} 
                                            style={{ width: '100%', padding: '0.55rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text)' }}
                                            onChange={e => {
                                                const updated = [...packages];
                                                updated[activePkgTab].silicon_versions[activeSiTab].name = e.target.value;
                                                setPackages(updated);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-muted)' }}>Silicon Corners</label>
                                        <MultipleInputs
                                            value={currentSi.silicon_corners}
                                            onChange={(val) => {
                                                const updated = [...packages];
                                                updated[activePkgTab].silicon_versions[activeSiTab].silicon_corners = val;
                                                setPackages(updated);
                                            }}
                                            placeholder="e.g. TT, FF, SS"
                                        />
                                    </div>
                                </div>
                            )}
                        </FormTabs>
                    </div>

                    {/* LEVEL 3: BOARD FORM FACTORS */}
                    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>3</span>
                                <label style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
                                    Board Form Factors for <span style={{ color: '#c084fc' }}>"{currentSi?.name || 'Silicon'}"</span>
                                </label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(e.g. Demo, Validation, SVB)</span>
                            </div>
                        </div>

                        <FormTabs
                            tabs={currentSi ? currentSi.formfactors.map(ff => ff.name || 'Unnamed FormFactor') : []}
                            activeTab={activeFfTab}
                            onTabChange={(idx) => {
                                setActiveFfTab(idx);
                                setActiveRevTab(0);
                            }}
                            onAddTab={handleAddFormFactor}
                            onDeleteActiveTab={handleDeleteFormFactor}
                            canDeleteActiveTab={currentSi ? currentSi.formfactors.length > 1 : false}
                        >
                            {currentFf && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '220px' }}>
                                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-muted)' }}>Board FormFactor Name</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. Demo, Validation" 
                                            value={currentFf.name} 
                                            style={{ width: '100%', padding: '0.55rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text)' }}
                                            onChange={e => {
                                                const updated = [...packages];
                                                updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].name = e.target.value;
                                                setPackages(updated);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </FormTabs>
                    </div>

                    {/* LEVEL 4: REVISIONS & DOCUMENTS */}
                    <div style={{ border: '1px solid var(--border)', borderRadius: '10px', padding: '16px', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>4</span>
                                <label style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>
                                    Revisions & Documents for <span style={{ color: '#60a5fa' }}>"{currentFf?.name || 'Board'}"</span>
                                </label>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(e.g. 1.0, 2.0, proto)</span>
                            </div>
                        </div>

                        <FormTabs
                            tabs={currentFf ? currentFf.revisions.map(r => r.name || 'Unnamed Rev') : []}
                            activeTab={activeRevTab}
                            onTabChange={(idx) => setActiveRevTab(idx)}
                            onAddTab={handleAddRevision}
                            onDeleteActiveTab={handleDeleteRevision}
                            canDeleteActiveTab={currentFf ? currentFf.revisions.length > 1 : false}
                        >
                            {currentRev && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 260px) 1fr', gap: '16px', alignItems: 'start' }}>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-muted)' }}>Revision Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. 1.0" 
                                                value={currentRev.name} 
                                                style={{ width: '100%', padding: '0.55rem', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'rgba(0, 0, 0, 0.25)', color: 'var(--text)' }}
                                                onChange={e => {
                                                    const updated = [...packages];
                                                    updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].name = e.target.value;
                                                    setPackages(updated);
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-muted)' }}>BOMs (comma separated)</label>
                                            <MultipleInputs
                                                value={currentRev.boms}
                                                onChange={(val) => {
                                                    const updated = [...packages];
                                                    updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].boms = val;
                                                    setPackages(updated);
                                                }}
                                                placeholder="e.g. BOM1, BOM2"
                                            />
                                        </div>
                                    </div>

                                    {/* Associated Documents Grid */}
                                    <div style={{ marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '12px', color: 'var(--text)' }}>
                                            Revision Documents (PDFs, Schematics, Layouts)
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                                            {/* Schematic */}
                                            <div style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.18)' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                                    <FileText size={14} color="#6366f1" /> Schematic (.pdf)
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <select
                                                        value={currentRev.schematic || ''}
                                                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text)' }}
                                                        onChange={e => {
                                                            const updated = [...packages];
                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].schematic = e.target.value || null;
                                                            setPackages(updated);
                                                        }}
                                                    >
                                                        <option value="">-- None --</option>
                                                        {fileOptions.map(name => (
                                                            <option key={name} value={name}>{name}</option>
                                                        ))}
                                                    </select>
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf" 
                                                        id={`sch-edit-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ display: 'none' }}
                                                        onChange={e => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleFileUpload(e.target.files[0], (fn) => {
                                                                    const updated = [...packages];
                                                                    updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].schematic = fn;
                                                                    setPackages(updated);
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <label 
                                                        htmlFor={`sch-edit-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', backgroundColor: 'var(--surface-hover)' }}
                                                        title="Upload file"
                                                    >
                                                        <Upload size={14} />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Board File */}
                                            <div style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.18)' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                                    <FileText size={14} color="#3b82f6" /> Board File (.brd)
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <select
                                                        value={currentRev.board_file || ''}
                                                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text)' }}
                                                        onChange={e => {
                                                            const updated = [...packages];
                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].board_file = e.target.value || null;
                                                            setPackages(updated);
                                                        }}
                                                    >
                                                        <option value="">-- None --</option>
                                                        {fileOptions.map(name => (
                                                            <option key={name} value={name}>{name}</option>
                                                        ))}
                                                    </select>
                                                    <input 
                                                        type="file" 
                                                        accept=".brd" 
                                                        id={`brd-edit-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ display: 'none' }}
                                                        onChange={e => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleFileUpload(e.target.files[0], (fn) => {
                                                                    const updated = [...packages];
                                                                    updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].board_file = fn;
                                                                    setPackages(updated);
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <label 
                                                        htmlFor={`brd-edit-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', backgroundColor: 'var(--surface-hover)' }}
                                                        title="Upload file"
                                                    >
                                                        <Upload size={14} />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* BOM CSV */}
                                            <div style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.18)' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                                    <FileText size={14} color="#10b981" /> BOM CSV (.csv)
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <select
                                                        value={currentRev.bom_csv || ''}
                                                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text)' }}
                                                        onChange={e => {
                                                            const updated = [...packages];
                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].bom_csv = e.target.value || null;
                                                            setPackages(updated);
                                                        }}
                                                    >
                                                        <option value="">-- None --</option>
                                                        {fileOptions.map(name => (
                                                            <option key={name} value={name}>{name}</option>
                                                        ))}
                                                    </select>
                                                    <input 
                                                        type="file" 
                                                        accept=".csv" 
                                                        id={`bom-edit-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ display: 'none' }}
                                                        onChange={e => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleFileUpload(e.target.files[0], (fn) => {
                                                                    const updated = [...packages];
                                                                    updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].bom_csv = fn;
                                                                    setPackages(updated);
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <label 
                                                        htmlFor={`bom-edit-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', backgroundColor: 'var(--surface-hover)' }}
                                                        title="Upload file"
                                                    >
                                                        <Upload size={14} />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Datasheet */}
                                            <div style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.18)' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                                    <FileText size={14} color="#f59e0b" /> Datasheet (.pdf)
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <select
                                                        value={currentRev.datasheet || ''}
                                                        style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text)' }}
                                                        onChange={e => {
                                                            const updated = [...packages];
                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].datasheet = e.target.value || null;
                                                            setPackages(updated);
                                                        }}
                                                    >
                                                        <option value="">-- None --</option>
                                                        {fileOptions.map(name => (
                                                            <option key={name} value={name}>{name}</option>
                                                        ))}
                                                    </select>
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf" 
                                                        id={`ds-edit-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ display: 'none' }}
                                                        onChange={e => {
                                                            if (e.target.files && e.target.files[0]) {
                                                                handleFileUpload(e.target.files[0], (fn) => {
                                                                    const updated = [...packages];
                                                                    updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].datasheet = fn;
                                                                    setPackages(updated);
                                                                });
                                                            }
                                                        }}
                                                    />
                                                    <label 
                                                        htmlFor={`ds-edit-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', backgroundColor: 'var(--surface-hover)' }}
                                                        title="Upload file"
                                                    >
                                                        <Upload size={14} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </FormTabs>
                    </div>
                </div>

                <button type="submit" className="submit-button" disabled={saving}>
                    <Save size={18} />
                    <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
                </button>
            </form>

            <RemoveProject
                isOpen={isRemoveOpen}
                project={projects.find(p => p.id.toString() === id.toString()) || { id, name, pcb_count: pcbCount }}
                onConfirm={handleDelete}
                onClose={() => setIsRemoveOpen(false)}
            />
        </div>
    );
}
