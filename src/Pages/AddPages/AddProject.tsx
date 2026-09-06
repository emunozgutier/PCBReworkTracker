import React, { useState } from 'react';
import { 
    ArrowLeft, Save, HelpCircle, Upload, FileText, Cpu, Layers, 
    Box, Trash2, Plus, CheckCircle2, AlertCircle, CircuitBoard, Hash, Binary, Sparkles,
    Paperclip, X, FileCheck
} from 'lucide-react';
import { MultipleInputs } from '../../components/forms/MultipleInputs';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import { useAppState } from '../../store/useAppState';
import { usePermissionsStore } from '../../store/clientDataBase/usePermissionsStore';

interface AddProjectProps {
    onBack: () => void;
    onSuccess: () => void;
}

function generateUniqueKey(name: string, existingKeys: string[]): string {
    const letters = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (letters.length < 3) return '';

    // Strategy 1: First 3 letters
    const candidate1 = letters.substring(0, 3);
    if (!existingKeys.includes(candidate1)) return candidate1;

    // Strategy 2: First 3 consonants
    const consonants = letters.replace(/[AEIOU]/g, '');
    if (consonants.length >= 3) {
        const candidate2 = consonants.substring(0, 3);
        if (!existingKeys.includes(candidate2)) return candidate2;
    }

    return '';
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

export function AddProject({ onBack, onSuccess }: AddProjectProps) {
    const { currentUserRole, debugBypassPermissions } = useAppState();
    const { permissions } = usePermissionsStore();

    const canAddProject = debugBypassPermissions || currentUserRole === 'Super User' ||
        (currentUserRole === 'User' && permissions['Projects__Add__user'] === true) ||
        (currentUserRole === 'Guest' && permissions['Projects__Add__guest'] === true);

    if (!canAddProject) {
        return (
            <div className="project-form-container">
                <header className="add-page-header">
                    <button onClick={onBack} className="back-button">
                        <ArrowLeft size={20} />
                    </button>
                    <h2>Access Denied</h2>
                </header>
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>You do not have permission to add new projects.</p>
                </div>
            </div>
        );
    }

    const [name, setName] = useState('');
    const [projectKey, setProjectKey] = useState('');
    const [numberFormat, setNumberFormat] = useState<'hex' | 'decimal'>('decimal');
    
    // Hierarchical Packages state
    const [packages, setPackages] = useState<FormPackage[]>([
        {
            name: '40 pin',
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

    const [activePkgTab, setActivePkgTab] = useState(0);
    const [activeSiTab, setActiveSiTab] = useState(0);
    const [activeFfTab, setActiveFfTab] = useState(0);
    const [activeRevTab, setActiveRevTab] = useState(0);

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isKeyManuallyEdited, setIsKeyManuallyEdited] = useState(false);
    const [autoKeyError, setAutoKeyError] = useState('');
    
    const { addProject, loading, projects, error } = useProjectStore();

    let keyBorderColor = undefined;
    let keyTextColor = undefined;
    if (projectKey.length === 3) {
        const isDuplicate = projects.some(p => p.project_key === projectKey);
        if (isDuplicate) {
            keyBorderColor = '#ef4444';
            keyTextColor = '#ef4444';
        } else {
            keyBorderColor = '#22c55e';
            keyTextColor = '#22c55e';
        }
    } else if (projectKey.length > 0 && projectKey.length < 3) {
        keyBorderColor = '#ef4444';
        keyTextColor = '#ef4444';
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setName(newName);

        if (!isKeyManuallyEdited) {
            const existingKeys = projects.map(p => p.project_key);
            const autoKey = generateUniqueKey(newName, existingKeys);
            
            if (autoKey) {
                setProjectKey(autoKey);
                setAutoKeyError('');
            } else if (newName.replace(/[^a-zA-Z]/g, '').length >= 3) {
                setAutoKeyError('Could not auto-generate a unique 3-letter key. Please enter one manually.');
                setProjectKey('');
            } else {
                setAutoKeyError('');
                if (newName === '') setProjectKey('');
            }
        }
    };

    const handleFileUpload = (file: File, updateRevField?: (filename: string) => void) => {
        if (file.size > 25 * 1024 * 1024) {
            alert(`File "${file.name}" exceeds the 25MB maximum size limit.`);
            return;
        }
        setSelectedFiles(prev => {
            const exists = prev.some(f => f.name === file.name);
            return exists ? prev : [...prev, file];
        });
        if (updateRevField) {
            updateRevField(file.name);
        }
    };

    const handleRemoveFile = (filename: string) => {
        setSelectedFiles(prev => prev.filter(f => f.name !== filename));
        setPackages(prev => prev.map(pkg => ({
            ...pkg,
            silicon_versions: pkg.silicon_versions.map(sv => ({
                ...sv,
                formfactors: sv.formfactors.map(ff => ({
                    ...ff,
                    revisions: ff.revisions.map(r => ({
                        ...r,
                        schematic: r.schematic === filename ? null : r.schematic,
                        board_file: r.board_file === filename ? null : r.board_file,
                        bom_csv: r.bom_csv === filename ? null : r.bom_csv,
                        datasheet: r.datasheet === filename ? null : r.datasheet,
                    }))
                }))
            }))
        })));
    };

    const handleMultipleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const fileList = Array.from(files);
        fileList.forEach(file => {
            handleFileUpload(file);
            const ext = file.name.toLowerCase().split('.').pop() || '';
            const curRev = packages[activePkgTab]?.silicon_versions[activeSiTab]?.formfactors[activeFfTab]?.revisions[activeRevTab];
            if (curRev) {
                const updated = [...packages];
                const revRef = updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab];
                if (ext === 'pdf' && !revRef.schematic) {
                    revRef.schematic = file.name;
                } else if (ext === 'brd' && !revRef.board_file) {
                    revRef.board_file = file.name;
                } else if ((ext === 'csv' || ext === 'xlsx' || ext === 'xls') && !revRef.bom_csv) {
                    revRef.bom_csv = file.name;
                } else if (ext === 'pdf' && revRef.schematic && !revRef.datasheet) {
                    revRef.datasheet = file.name;
                }
                setPackages(updated);
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Assemble payload packages
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

        const success = await addProject({ 
            name, 
            project_key: projectKey, 
            number_format: numberFormat,
            packages: payloadPackages as any
        }, selectedFiles);

        if (success) {
            onSuccess();
        }
    };

    const currentPkg = packages[activePkgTab];
    const currentSi = currentPkg?.silicon_versions[activeSiTab];
    const currentFf = currentSi?.formfactors[activeFfTab];
    const currentRev = currentFf?.revisions[activeRevTab];

    const handleAddPackage = () => {
        const pkgName = prompt("Enter package name (e.g. 48 pin IC, BGA-128):", "48 pin IC");
        if (!pkgName || !pkgName.trim()) return;
        const newPkg: FormPackage = {
            name: pkgName.trim(),
            silicon_versions: [
                {
                    name: 'A0',
                    silicon_corners: 'TT, FF, SS',
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
        };
        setPackages([...packages, newPkg]);
        setActivePkgTab(packages.length);
        setActiveSiTab(0);
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleDeletePackage = () => {
        if (packages.length <= 1) return;
        const confirmDelete = window.confirm(`Are you sure you want to delete package "${currentPkg?.name || 'this package'}" and all its contents?`);
        if (!confirmDelete) return;

        const newPkgs = packages.filter((_, i) => i !== activePkgTab);
        setPackages(newPkgs);
        setActivePkgTab(Math.max(0, activePkgTab - 1));
        setActiveSiTab(0);
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleAddSilicon = () => {
        if (!currentPkg) return;
        const siName = prompt("Enter silicon version name (e.g. B0, C0):", "B0");
        if (!siName || !siName.trim()) return;
        const newSi: FormSiliconVersion = {
            name: siName.trim(),
            silicon_corners: 'TT, FF, SS',
            formfactors: [
                {
                    name: 'Demo',
                    revisions: [
                        { name: '1.0', boms: 'BOM1', schematic: null, board_file: null, bom_csv: null, datasheet: null }
                    ]
                }
            ]
        };
        const updated = [...packages];
        updated[activePkgTab].silicon_versions.push(newSi);
        setPackages(updated);
        setActiveSiTab(updated[activePkgTab].silicon_versions.length - 1);
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleDeleteSilicon = () => {
        if (!currentPkg || currentPkg.silicon_versions.length <= 1) return;
        const confirmDelete = window.confirm(`Delete silicon version "${currentSi?.name || 'this version'}"?`);
        if (!confirmDelete) return;

        const updated = [...packages];
        updated[activePkgTab].silicon_versions = updated[activePkgTab].silicon_versions.filter((_, i) => i !== activeSiTab);
        setPackages(updated);
        setActiveSiTab(Math.max(0, activeSiTab - 1));
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleAddFormFactor = () => {
        if (!currentSi) return;
        const ffName = prompt("Enter PCB flavor name (e.g. Validation, SVB, Chamber):", "Validation");
        if (!ffName || !ffName.trim()) return;
        const newFf: FormBoardFormFactor = {
            name: ffName.trim(),
            revisions: [
                { name: '1.0', boms: 'Default', schematic: null, board_file: null, bom_csv: null, datasheet: null }
            ]
        };
        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors.push(newFf);
        setPackages(updated);
        setActiveFfTab(updated[activePkgTab].silicon_versions[activeSiTab].formfactors.length - 1);
        setActiveRevTab(0);
    };

    const handleDeleteFormFactor = () => {
        if (!currentSi || currentSi.formfactors.length <= 1) return;
        const confirmDelete = window.confirm(`Delete PCB flavor "${currentFf?.name || 'this flavor'}"?`);
        if (!confirmDelete) return;

        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors = updated[activePkgTab].silicon_versions[activeSiTab].formfactors.filter((_, i) => i !== activeFfTab);
        setPackages(updated);
        setActiveFfTab(Math.max(0, activeFfTab - 1));
        setActiveRevTab(0);
    };

    const handleAddRevision = () => {
        if (!currentFf) return;
        const revName = prompt("Enter PCB version name (e.g. 2.0, 1.1):", "2.0");
        if (!revName || !revName.trim()) return;
        const newRev: FormRevision = {
            name: revName.trim(),
            boms: 'Default',
            schematic: null,
            board_file: null,
            bom_csv: null,
            datasheet: null
        };
        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions.push(newRev);
        setPackages(updated);
        setActiveRevTab(updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions.length - 1);
    };

    const handleDeleteRevision = () => {
        if (!currentFf || currentFf.revisions.length <= 1) return;
        const confirmDelete = window.confirm(`Delete PCB revision "${currentRev?.name || 'this revision'}"?`);
        if (!confirmDelete) return;

        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions = updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions.filter((_, i) => i !== activeRevTab);
        setPackages(updated);
        setActiveRevTab(Math.max(0, activeRevTab - 1));
    };

    // Calculate totals for summary bar
    const totalPackages = packages.length;
    const totalSi = packages.reduce((acc, p) => acc + p.silicon_versions.length, 0);
    const totalFf = packages.reduce((acc, p) => acc + p.silicon_versions.reduce((acc2, s) => acc2 + s.formfactors.length, 0), 0);
    const totalRev = packages.reduce((acc, p) => acc + p.silicon_versions.reduce((acc2, s) => acc2 + s.formfactors.reduce((acc3, f) => acc3 + f.revisions.length, 0), 0), 0);

    return (
        <div className="project-form-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button" title="Go Back">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>Add New Project</h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Configure project metadata and 4-tier hardware architecture
                    </p>
                </div>
            </header>

            {debugBypassPermissions && currentUserRole !== 'Super User' && (
                <div className="debug-preview-banner" style={{ marginBottom: '20px' }}>
                    <span className="debug-preview-banner-text">
                        ⚡ Debug Preview Mode: UI permissions bypassed for inspection.
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="add-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. PROJECT OVERVIEW CARD */}
                <div className="project-meta-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color="var(--accent)" />
                        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
                            Project Details
                        </h3>
                    </div>

                    <div className="project-meta-grid">
                        {/* Project Name */}
                        <div className="form-group" style={{ margin: 0 }}>
                            <label htmlFor="name" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block', textAlign: 'left' }}>
                                Project Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input 
                                id="name"
                                type="text" 
                                value={name} 
                                onChange={handleNameChange} 
                                placeholder="e.g. Project Apollo"
                                required 
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        {/* Project Key */}
                        <div className="form-group" style={{ margin: 0 }}>
                            <label htmlFor="project_key" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', textAlign: 'left' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    Project Key (3 Letters) <span style={{ color: '#ef4444' }}>*</span>
                                    <span title="The 3-letter project key is used in URLs and identifiers" style={{ cursor: 'help' }}>
                                        <HelpCircle size={14} color="var(--text-muted)" />
                                    </span>
                                </span>
                                {projectKey.length === 3 && !projects.some(p => p.project_key === projectKey) && (
                                    <span style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <CheckCircle2 size={12} /> Available
                                    </span>
                                )}
                            </label>
                            <input 
                                id="project_key"
                                type="text" 
                                maxLength={3}
                                value={projectKey} 
                                onChange={(e) => {
                                    setProjectKey(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase());
                                    setIsKeyManuallyEdited(true);
                                    setAutoKeyError('');
                                }} 
                                placeholder="e.g. APL"
                                required 
                                style={{
                                    borderColor: keyBorderColor,
                                    color: keyTextColor || '#f1f5f9',
                                    fontWeight: 700,
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                    width: '100%',
                                    boxSizing: 'border-box'
                                }}
                            />
                            {projectKey.length > 0 && projectKey.length < 3 && (
                                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertCircle size={12} /> Must be exactly 3 letters.
                                </span>
                            )}
                            {projectKey.length === 3 && projects.some(p => p.project_key === projectKey) && (
                                <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <AlertCircle size={12} /> Key "{projectKey}" is already in use.
                                </span>
                            )}
                            {autoKeyError && <span style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>{autoKeyError}</span>}
                        </div>

                        {/* Board Number Format */}
                        <div className="form-group" style={{ margin: 0 }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                                Board Number Format
                            </label>
                            <div className="segmented-pill-group">
                                <button
                                    type="button"
                                    className={`segmented-pill-btn ${numberFormat === 'hex' ? 'active' : ''}`}
                                    onClick={() => setNumberFormat('hex')}
                                >
                                    <Binary size={15} />
                                    <span>Hex (0x)</span>
                                </button>
                                <button
                                    type="button"
                                    className={`segmented-pill-btn ${numberFormat === 'decimal' ? 'active' : ''}`}
                                    onClick={() => setNumberFormat('decimal')}
                                >
                                    <Hash size={15} />
                                    <span>Decimal</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. DYNAMIC ARCHITECTURE BREADCRUMB */}
                <div className="active-hierarchy-bar">
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        Active Hardware Path:
                    </span>
                    <div 
                        className="breadcrumb-step" 
                        style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}
                        title="Tier 1: Package"
                    >
                        <Box size={14} /> {currentPkg?.name || 'Package'}
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>›</span>
                    <div 
                        className="breadcrumb-step" 
                        style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}
                        title="Tier 2: Silicon Version"
                    >
                        <Cpu size={14} /> {currentSi?.name || 'Si Version'}
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>›</span>
                    <div 
                        className="breadcrumb-step" 
                        style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', border: '1px solid rgba(14, 165, 233, 0.3)' }}
                        title="Tier 3: PCB Flavor"
                    >
                        <Layers size={14} /> {currentFf?.name || 'PCB Flavor'}
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>›</span>
                    <div 
                        className="breadcrumb-step" 
                        style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                        title="Tier 4: PCB Version"
                    >
                        <FileText size={14} /> Rev {currentRev?.name || '1.0'}
                    </div>
                </div>

                {/* 3. FOUR-TIER NESTED TABS ARCHITECTURE */}
                {/* ============================================================== */}
                {/* TIER 1: PINS / PACKAGE TAB                                      */}
                {/* ============================================================== */}
                <div className="nested-tier nested-tier-1">
                    <div className="nested-tier-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="tier-badge tier-badge-1">(1) Pins / Package</span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                Top-level IC packaging & pin counts
                            </span>
                        </div>
                        {packages.length > 1 && (
                            <button
                                type="button"
                                onClick={handleDeletePackage}
                                title="Delete this package"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '5px 12px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '6px',
                                    color: '#ef4444',
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <Trash2 size={13} />
                                <span>Delete Package</span>
                            </button>
                        )}
                    </div>

                    {/* Tier 1 Tabs Bar */}
                    <div className="nested-tabs-nav">
                        {packages.map((pkg, idx) => (
                            <button
                                key={idx}
                                type="button"
                                className={`nested-tab-chip ${activePkgTab === idx ? 'active-t1' : ''}`}
                                onClick={() => {
                                    setActivePkgTab(idx);
                                    setActiveSiTab(0);
                                    setActiveFfTab(0);
                                    setActiveRevTab(0);
                                }}
                            >
                                <Box size={14} />
                                <span>{pkg.name || `Package ${idx + 1}`}</span>
                            </button>
                        ))}
                        <button
                            type="button"
                            className="nested-add-tab-btn"
                            onClick={handleAddPackage}
                            title="Add a new package tab"
                        >
                            <Plus size={14} />
                            <span>Add Package</span>
                        </button>
                    </div>

                    {/* Tier 1 Body */}
                    <div className="nested-tier-body">
                        {currentPkg && (
                            <>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '220px' }}>
                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>
                                            Package Name
                                        </label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. 40 pin QFN, BGA-128, 48 pin IC" 
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

                                {/* ============================================================== */}
                                {/* TIER 2: SILICON VERSION (NESTED IN ACTIVE PACKAGE)              */}
                                {/* ============================================================== */}
                                <div className="nested-tier nested-tier-2">
                                    <div className="nested-tier-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className="tier-badge tier-badge-2">(2) Si ver.</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                Silicon revisions for <strong style={{ color: '#818cf8' }}>{currentPkg.name || 'Package'}</strong>
                                            </span>
                                        </div>
                                        {currentPkg.silicon_versions.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={handleDeleteSilicon}
                                                title="Delete this silicon version"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '5px 12px',
                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                    borderRadius: '6px',
                                                    color: '#ef4444',
                                                    fontSize: '0.78rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Trash2 size={13} />
                                                <span>Delete Si Ver</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Tier 2 Tabs Bar */}
                                    <div className="nested-tabs-nav">
                                        {currentPkg.silicon_versions.map((sv, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                className={`nested-tab-chip ${activeSiTab === idx ? 'active-t2' : ''}`}
                                                onClick={() => {
                                                    setActiveSiTab(idx);
                                                    setActiveFfTab(0);
                                                    setActiveRevTab(0);
                                                }}
                                            >
                                                <Cpu size={14} />
                                                <span>{sv.name || `Si Ver ${idx + 1}`}</span>
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            className="nested-add-tab-btn"
                                            onClick={handleAddSilicon}
                                            title="Add silicon version tab"
                                        >
                                            <Plus size={14} />
                                            <span>Add Si Ver</span>
                                        </button>
                                    </div>

                                    {/* Tier 2 Body */}
                                    <div className="nested-tier-body">
                                        {currentSi && (
                                            <>
                                                <div className="responsive-tier-grid">
                                                    <div>
                                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>
                                                            Silicon Version Name
                                                        </label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. A0, B0" 
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
                                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>
                                                            Silicon Corners
                                                        </label>
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

                                                {/* ============================================================== */}
                                                {/* TIER 3: PCB FLAVOR (NESTED IN ACTIVE SILICON VERSION)          */}
                                                {/* ============================================================== */}
                                                <div className="nested-tier nested-tier-3">
                                                    <div className="nested-tier-header">
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <span className="tier-badge tier-badge-3">(3) PCB Flavor</span>
                                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                Board form factors for <strong style={{ color: '#c084fc' }}>{currentSi.name || 'Silicon'}</strong>
                                                            </span>
                                                        </div>
                                                        {currentSi.formfactors.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={handleDeleteFormFactor}
                                                                title="Delete this PCB flavor"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '6px',
                                                                    padding: '5px 12px',
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                    borderRadius: '6px',
                                                                    color: '#ef4444',
                                                                    fontSize: '0.78rem',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                <Trash2 size={13} />
                                                                <span>Delete PCB Flavor</span>
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Tier 3 Tabs Bar */}
                                                    <div className="nested-tabs-nav">
                                                        {currentSi.formfactors.map((ff, idx) => (
                                                            <button
                                                                key={idx}
                                                                type="button"
                                                                className={`nested-tab-chip ${activeFfTab === idx ? 'active-t3' : ''}`}
                                                                onClick={() => {
                                                                    setActiveFfTab(idx);
                                                                    setActiveRevTab(0);
                                                                }}
                                                            >
                                                                <Layers size={14} />
                                                                <span>{ff.name || `Flavor ${idx + 1}`}</span>
                                                            </button>
                                                        ))}
                                                        <button
                                                            type="button"
                                                            className="nested-add-tab-btn"
                                                            onClick={handleAddFormFactor}
                                                            title="Add PCB flavor tab"
                                                        >
                                                            <Plus size={14} />
                                                            <span>Add PCB Flavor</span>
                                                        </button>
                                                    </div>

                                                    {/* Tier 3 Body */}
                                                    <div className="nested-tier-body">
                                                        {currentFf && (
                                                            <>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                                                                    <div style={{ flex: 1, minWidth: '220px' }}>
                                                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>
                                                                            Board Form Factor / Flavor Name
                                                                        </label>
                                                                        <input 
                                                                            type="text" 
                                                                            placeholder="e.g. Demo, Validation, SVB, Chamber" 
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

                                                                {/* ============================================================== */}
                                                                {/* TIER 4: PCB VER (NESTED IN ACTIVE PCB FLAVOR)                 */}
                                                                {/* ============================================================== */}
                                                                <div className="nested-tier nested-tier-4">
                                                                    <div className="nested-tier-header">
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                            <span className="tier-badge tier-badge-4">(4) PCB ver</span>
                                                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                                Revisions & CAD files for <strong style={{ color: '#38bdf8' }}>{currentFf.name || 'PCB Flavor'}</strong>
                                                                            </span>
                                                                        </div>
                                                                        {currentFf.revisions.length > 1 && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={handleDeleteRevision}
                                                                                title="Delete this revision"
                                                                                style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '6px',
                                                                                    padding: '5px 12px',
                                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                                    borderRadius: '6px',
                                                                                    color: '#ef4444',
                                                                                    fontSize: '0.78rem',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                <Trash2 size={13} />
                                                                                <span>Delete PCB Ver</span>
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {/* Tier 4 Tabs Bar */}
                                                                    <div className="nested-tabs-nav">
                                                                        {currentFf.revisions.map((r, idx) => (
                                                                            <button
                                                                                key={idx}
                                                                                type="button"
                                                                                className={`nested-tab-chip ${activeRevTab === idx ? 'active-t4' : ''}`}
                                                                                onClick={() => setActiveRevTab(idx)}
                                                                            >
                                                                                <FileText size={14} />
                                                                                <span>Rev {r.name || `${idx + 1}.0`}</span>
                                                                            </button>
                                                                        ))}
                                                                        <button
                                                                            type="button"
                                                                            className="nested-add-tab-btn"
                                                                            onClick={handleAddRevision}
                                                                            title="Add PCB version tab"
                                                                        >
                                                                            <Plus size={14} />
                                                                            <span>Add PCB Ver</span>
                                                                        </button>
                                                                    </div>

                                                                    {/* Tier 4 Body */}
                                                                    <div className="nested-tier-body">
                                                                        {currentRev && (
                                                                            <>
                                                                                <div className="responsive-tier-grid">
                                                                                    <div>
                                                                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>
                                                                                            PCB Revision Name
                                                                                        </label>
                                                                                        <input 
                                                                                            type="text" 
                                                                                            placeholder="e.g. 1.0, 2.0" 
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
                                                                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--text-muted)' }}>
                                                                                            BOM Flavors
                                                                                        </label>
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

                                                                                {/* Revision Documents Grid */}
                                                                                <div style={{ marginTop: '8px' }}>
                                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                                                        <FileText size={15} color="var(--accent)" />
                                                                                        <label style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0, color: 'var(--text)' }}>
                                                                                            Revision Documents & CAD Files
                                                                                        </label>
                                                                                    </div>

                                                                                    <div className="doc-slot-grid">
                                                                                        {/* 1. Schematic (.pdf) */}
                                                                                        <div className="doc-slot-card">
                                                                                            <div className="doc-slot-title">
                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}>
                                                                                                    <FileText size={15} /> Schematic
                                                                                                </span>
                                                                                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                                                                                                    .PDF
                                                                                                </span>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                                                <select
                                                                                                    value={currentRev.schematic || ''}
                                                                                                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', color: 'var(--text)' }}
                                                                                                    onChange={e => {
                                                                                                        const updated = [...packages];
                                                                                                        updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].schematic = e.target.value || null;
                                                                                                        setPackages(updated);
                                                                                                    }}
                                                                                                >
                                                                                                    <option value="">-- Select uploaded file --</option>
                                                                                                    {selectedFiles.map(f => (
                                                                                                        <option key={f.name} value={f.name}>{f.name}</option>
                                                                                                    ))}
                                                                                                </select>
                                                                                                {currentRev.schematic && (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className="doc-clear-btn"
                                                                                                        onClick={() => {
                                                                                                            const updated = [...packages];
                                                                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].schematic = null;
                                                                                                            setPackages(updated);
                                                                                                        }}
                                                                                                        title="Detach schematic"
                                                                                                    >
                                                                                                        <X size={12} />
                                                                                                    </button>
                                                                                                )}
                                                                                                <input 
                                                                                                    type="file" 
                                                                                                    accept=".pdf" 
                                                                                                    id={`sch-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    style={{ display: 'none' }}
                                                                                                    onClick={e => { (e.target as HTMLInputElement).value = ''; }}
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
                                                                                                    htmlFor={`sch-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    className="doc-browse-btn"
                                                                                                    title="Upload Schematic PDF"
                                                                                                >
                                                                                                    <Upload size={13} />
                                                                                                    <span>Browse</span>
                                                                                                </label>
                                                                                            </div>
                                                                                            <span style={{ fontSize: '0.72rem', color: currentRev.schematic ? '#4ade80' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                                {currentRev.schematic ? `✓ ${currentRev.schematic}` : 'No schematic attached'}
                                                                                            </span>
                                                                                        </div>

                                                                                        {/* 2. Board File (.brd) */}
                                                                                        <div className="doc-slot-card">
                                                                                            <div className="doc-slot-title">
                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#60a5fa' }}>
                                                                                                    <CircuitBoard size={15} /> Board File
                                                                                                </span>
                                                                                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                                                                                                    .BRD
                                                                                                </span>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                                                <select
                                                                                                    value={currentRev.board_file || ''}
                                                                                                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', color: 'var(--text)' }}
                                                                                                    onChange={e => {
                                                                                                        const updated = [...packages];
                                                                                                        updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].board_file = e.target.value || null;
                                                                                                        setPackages(updated);
                                                                                                    }}
                                                                                                >
                                                                                                    <option value="">-- Select uploaded file --</option>
                                                                                                    {selectedFiles.map(f => (
                                                                                                        <option key={f.name} value={f.name}>{f.name}</option>
                                                                                                    ))}
                                                                                                </select>
                                                                                                {currentRev.board_file && (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className="doc-clear-btn"
                                                                                                        onClick={() => {
                                                                                                            const updated = [...packages];
                                                                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].board_file = null;
                                                                                                            setPackages(updated);
                                                                                                        }}
                                                                                                        title="Detach board file"
                                                                                                    >
                                                                                                        <X size={12} />
                                                                                                    </button>
                                                                                                )}
                                                                                                <input 
                                                                                                    type="file" 
                                                                                                    accept=".brd" 
                                                                                                    id={`brd-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    style={{ display: 'none' }}
                                                                                                    onClick={e => { (e.target as HTMLInputElement).value = ''; }}
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
                                                                                                    htmlFor={`brd-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    className="doc-browse-btn"
                                                                                                    title="Upload Board (.brd) File"
                                                                                                >
                                                                                                    <Upload size={13} />
                                                                                                    <span>Browse</span>
                                                                                                </label>
                                                                                            </div>
                                                                                            <span style={{ fontSize: '0.72rem', color: currentRev.board_file ? '#4ade80' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                                {currentRev.board_file ? `✓ ${currentRev.board_file}` : 'No board file attached'}
                                                                                            </span>
                                                                                        </div>

                                                                                        {/* 3. BOM CSV (.csv, .xlsx, .xls, .txt) */}
                                                                                        <div className="doc-slot-card">
                                                                                            <div className="doc-slot-title">
                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399' }}>
                                                                                                    <FileText size={15} /> BOM CSV / Excel
                                                                                                </span>
                                                                                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                                                                                    .CSV / .XLSX
                                                                                                </span>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                                                <select
                                                                                                    value={currentRev.bom_csv || ''}
                                                                                                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', color: 'var(--text)' }}
                                                                                                    onChange={e => {
                                                                                                        const updated = [...packages];
                                                                                                        updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].bom_csv = e.target.value || null;
                                                                                                        setPackages(updated);
                                                                                                    }}
                                                                                                >
                                                                                                    <option value="">-- Select uploaded file --</option>
                                                                                                    {selectedFiles.map(f => (
                                                                                                        <option key={f.name} value={f.name}>{f.name}</option>
                                                                                                    ))}
                                                                                                </select>
                                                                                                {currentRev.bom_csv && (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className="doc-clear-btn"
                                                                                                        onClick={() => {
                                                                                                            const updated = [...packages];
                                                                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].bom_csv = null;
                                                                                                            setPackages(updated);
                                                                                                        }}
                                                                                                        title="Detach BOM file"
                                                                                                    >
                                                                                                        <X size={12} />
                                                                                                    </button>
                                                                                                )}
                                                                                                <input 
                                                                                                    type="file" 
                                                                                                    accept=".csv,.xlsx,.xls,.txt" 
                                                                                                    id={`bom-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    style={{ display: 'none' }}
                                                                                                    onClick={e => { (e.target as HTMLInputElement).value = ''; }}
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
                                                                                                    htmlFor={`bom-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    className="doc-browse-btn"
                                                                                                    title="Upload BOM CSV or Excel File"
                                                                                                >
                                                                                                    <Upload size={13} />
                                                                                                    <span>Browse</span>
                                                                                                </label>
                                                                                            </div>
                                                                                            <span style={{ fontSize: '0.72rem', color: currentRev.bom_csv ? '#4ade80' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                                {currentRev.bom_csv ? `✓ ${currentRev.bom_csv}` : 'No BOM attached'}
                                                                                            </span>
                                                                                        </div>

                                                                                        {/* 4. Datasheet (.pdf, .txt) */}
                                                                                        <div className="doc-slot-card">
                                                                                            <div className="doc-slot-title">
                                                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24' }}>
                                                                                                    <FileText size={15} /> Datasheet
                                                                                                </span>
                                                                                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                                                                                    .PDF
                                                                                                </span>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                                                <select
                                                                                                    value={currentRev.datasheet || ''}
                                                                                                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.78rem', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(0,0,0,0.3)', color: 'var(--text)' }}
                                                                                                    onChange={e => {
                                                                                                        const updated = [...packages];
                                                                                                        updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].datasheet = e.target.value || null;
                                                                                                        setPackages(updated);
                                                                                                    }}
                                                                                                >
                                                                                                    <option value="">-- Select uploaded file --</option>
                                                                                                    {selectedFiles.map(f => (
                                                                                                        <option key={f.name} value={f.name}>{f.name}</option>
                                                                                                    ))}
                                                                                                </select>
                                                                                                {currentRev.datasheet && (
                                                                                                    <button
                                                                                                        type="button"
                                                                                                        className="doc-clear-btn"
                                                                                                        onClick={() => {
                                                                                                            const updated = [...packages];
                                                                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].datasheet = null;
                                                                                                            setPackages(updated);
                                                                                                        }}
                                                                                                        title="Detach datasheet"
                                                                                                    >
                                                                                                        <X size={12} />
                                                                                                    </button>
                                                                                                )}
                                                                                                <input 
                                                                                                    type="file" 
                                                                                                    accept=".pdf,.txt" 
                                                                                                    id={`ds-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    style={{ display: 'none' }}
                                                                                                    onClick={e => { (e.target as HTMLInputElement).value = ''; }}
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
                                                                                                    htmlFor={`ds-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    className="doc-browse-btn"
                                                                                                    title="Upload Datasheet PDF"
                                                                                                >
                                                                                                    <Upload size={13} />
                                                                                                    <span>Browse</span>
                                                                                                </label>
                                                                                            </div>
                                                                                            <span style={{ fontSize: '0.72rem', color: currentRev.datasheet ? '#4ade80' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                                {currentRev.datasheet ? `✓ ${currentRev.datasheet}` : 'No datasheet attached'}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Staged Files & Documents Hub */}
                                                                                    <div className="staged-files-card">
                                                                                        <div className="staged-files-header">
                                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                                                <Paperclip size={15} color="var(--accent)" />
                                                                                                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>
                                                                                                    Staged Project Files ({selectedFiles.length})
                                                                                                </span>
                                                                                            </div>
                                                                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                                                <input 
                                                                                                    type="file" 
                                                                                                    multiple
                                                                                                    accept=".pdf,.brd,.csv,.xlsx,.xls,.txt,.png,.jpg,.jpeg" 
                                                                                                    id={`bulk-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    style={{ display: 'none' }}
                                                                                                    onClick={e => { (e.target as HTMLInputElement).value = ''; }}
                                                                                                    onChange={e => handleMultipleFiles(e.target.files)}
                                                                                                />
                                                                                                <label 
                                                                                                    htmlFor={`bulk-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                                                                    className="doc-browse-btn"
                                                                                                    title="Select multiple project documents or CAD files"
                                                                                                >
                                                                                                    <Plus size={13} />
                                                                                                    <span>Add Documents / CAD Files</span>
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>
                                                                                        
                                                                                        {selectedFiles.length > 0 ? (
                                                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                                                {selectedFiles.map(f => {
                                                                                                    const sizeKb = Math.round(f.size / 1024);
                                                                                                    return (
                                                                                                        <div key={f.name} className="staged-file-chip">
                                                                                                            <FileCheck size={14} color="#34d399" />
                                                                                                            <span style={{ fontWeight: 600, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                                                {f.name}
                                                                                                            </span>
                                                                                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                                                                                ({sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`})
                                                                                                            </span>
                                                                                                            <button
                                                                                                                type="button"
                                                                                                                className="staged-file-remove"
                                                                                                                onClick={() => handleRemoveFile(f.name)}
                                                                                                                title={`Remove ${f.name}`}
                                                                                                            >
                                                                                                                <X size={12} />
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                                                                No files staged yet. Use <strong>Browse</strong> in the revision slots above or click <strong>Add Documents / CAD Files</strong> to attach schematics, board files, or BOMs.
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="error-message" style={{ color: '#ef4444', padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                {/* 4. FOOTER WITH HARDWARE SUMMARY AND SAVE */}
                <div className="form-sticky-bar">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Hierarchy Summary:</span>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', fontSize: '0.8rem', fontWeight: 600 }}>
                            {totalPackages} Package{totalPackages > 1 ? 's' : ''}
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.8rem', fontWeight: 600 }}>
                            {totalSi} Si Ver{totalSi > 1 ? 's' : ''}
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
                            {totalFf} PCB Flavor{totalFf > 1 ? 's' : ''}
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
                            {totalRev} PCB Ver{totalRev > 1 ? 's' : ''}
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button
                            type="button"
                            onClick={onBack}
                            style={{
                                padding: '10px 18px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                background: 'transparent',
                                color: 'var(--text)',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 600
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="submit-button" 
                            disabled={loading || projectKey.length !== 3 || projects.some(p => p.project_key === projectKey) || !name.trim()}
                            style={{ margin: 0, padding: '10px 24px' }}
                        >
                            <Save size={18} />
                            <span>{loading ? 'Saving Project...' : 'Save Project'}</span>
                        </button>
                    </div>
                </div>

            </form>
        </div>
    );
}

