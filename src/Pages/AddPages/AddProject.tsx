import { useState } from 'react';
import { ArrowLeft, Save, HelpCircle, Upload, FileText, Cpu, Layers } from 'lucide-react';
import { FormTabs } from '../../components/forms/FormTabs';
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
            <div className="project-page-container">
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

    const handleFileUpload = (file: File, updateRevField: (filename: string) => void) => {
        if (!selectedFiles.some(f => f.name === file.name)) {
            setSelectedFiles(prev => [...prev, file]);
        }
        updateRevField(file.name);
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
        const pkgName = prompt("Enter package name (e.g. 48 pin IC):");
        if (!pkgName || !pkgName.trim()) return;
        const newPkg: FormPackage = {
            name: pkgName.trim(),
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
        };
        setPackages([...packages, newPkg]);
        setActivePkgTab(packages.length);
        setActiveSiTab(0);
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleDeletePackage = () => {
        const newPkgs = packages.filter((_, i) => i !== activePkgTab);
        setPackages(newPkgs);
        setActivePkgTab(Math.max(0, activePkgTab - 1));
        setActiveSiTab(0);
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleAddSilicon = () => {
        if (!currentPkg) return;
        const siName = prompt("Enter silicon version (e.g. A0, B0):");
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
        if (!currentPkg) return;
        const updated = [...packages];
        updated[activePkgTab].silicon_versions = updated[activePkgTab].silicon_versions.filter((_, i) => i !== activeSiTab);
        setPackages(updated);
        setActiveSiTab(Math.max(0, activeSiTab - 1));
        setActiveFfTab(0);
        setActiveRevTab(0);
    };

    const handleAddFormFactor = () => {
        if (!currentSi) return;
        const ffName = prompt("Enter form factor name (e.g. Demo, Validation, SVB, Chamber):");
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
        if (!currentSi) return;
        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors = updated[activePkgTab].silicon_versions[activeSiTab].formfactors.filter((_, i) => i !== activeFfTab);
        setPackages(updated);
        setActiveFfTab(Math.max(0, activeFfTab - 1));
        setActiveRevTab(0);
    };

    const handleAddRevision = () => {
        if (!currentFf) return;
        const revName = prompt("Enter revision name (e.g. 1.0, 2.0):");
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
        if (!currentFf) return;
        const updated = [...packages];
        updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions = updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions.filter((_, i) => i !== activeRevTab);
        setPackages(updated);
        setActiveRevTab(Math.max(0, activeRevTab - 1));
    };

    return (
        <div className="add-page-container">
            <header className="add-page-header">
                <button onClick={onBack} className="back-button">
                    <ArrowLeft size={20} />
                </button>
                <h2>Add New Project</h2>
            </header>

            {debugBypassPermissions && currentUserRole !== 'Super User' && (
                <div className="debug-preview-banner">
                    <span className="debug-preview-banner-text">
                        ⚡ Debug Preview Mode: UI permissions bypassed for page inspection.
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="add-form">
                <div className="form-group">
                    <label htmlFor="name">Project Name</label>
                    <input 
                        id="name"
                        type="text" 
                        value={name} 
                        onChange={handleNameChange} 
                        placeholder="e.g. Project Ares"
                        required 
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="project_key" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Project Key (3 Letters)
                        <span title="The 3-letter project key is for the links and storing data" style={{ cursor: 'help', display: 'flex' }}>
                            <HelpCircle size={14} color="var(--text-muted)" />
                        </span>
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
                        placeholder="e.g. ARS"
                        required 
                        style={{
                            borderColor: keyBorderColor,
                            color: keyTextColor
                        }}
                    />
                    {projectKey.length > 0 && projectKey.length < 3 && (
                        <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                            Project key must be exactly 3 letters.
                        </span>
                    )}
                    {projectKey.length === 3 && projects.some(p => p.project_key === projectKey) && (
                        <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                            Project key "{projectKey}" is already taken. Please choose another one.
                        </span>
                    )}
                    {autoKeyError && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>{autoKeyError}</span>}
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
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(e.g. 1.0, 2.0)</span>
                            </div>
                        </div>

                        <FormTabs
                            tabs={currentFf ? currentFf.revisions.map(r => r.name || 'Unnamed Revision') : []}
                            activeTab={activeRevTab}
                            onTabChange={setActiveRevTab}
                            onAddTab={handleAddRevision}
                            onDeleteActiveTab={handleDeleteRevision}
                            canDeleteActiveTab={currentFf ? currentFf.revisions.length > 1 : false}
                        >
                            {currentRev && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 280px) 1fr', gap: '16px', alignItems: 'start' }}>
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
                                            <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block', color: 'var(--text-muted)' }}>BOM Flavors</label>
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

                                    {/* Documents Row (Schematic, Board File, BOM CSV, Datasheet) */}
                                    <div>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'block', color: 'var(--accent)' }}>
                                            Revision Documents
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                                            {/* 1. Schematic (.pdf) */}
                                            <div style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                                    <FileText size={14} color="#ef4444" /> Schematic (.pdf)
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <select
                                                        value={currentRev.schematic || ''}
                                                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text)' }}
                                                        onChange={e => {
                                                            const updated = [...packages];
                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].schematic = e.target.value || null;
                                                            setPackages(updated);
                                                        }}
                                                    >
                                                        <option value="">-- None --</option>
                                                        {selectedFiles.map(f => (
                                                            <option key={f.name} value={f.name}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf" 
                                                        id={`sch-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
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
                                                        htmlFor={`sch-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ cursor: 'pointer', padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
                                                        title="Upload schematic PDF"
                                                    >
                                                        <Upload size={14} />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* 2. Board File (.brd) */}
                                            <div style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                                    <FileText size={14} color="#3b82f6" /> Board File (.brd)
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <select
                                                        value={currentRev.board_file || ''}
                                                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text)' }}
                                                        onChange={e => {
                                                            const updated = [...packages];
                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].board_file = e.target.value || null;
                                                            setPackages(updated);
                                                        }}
                                                    >
                                                        <option value="">-- None --</option>
                                                        {selectedFiles.map(f => (
                                                            <option key={f.name} value={f.name}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                    <input 
                                                        type="file" 
                                                        accept=".brd" 
                                                        id={`brd-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
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
                                                        htmlFor={`brd-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ cursor: 'pointer', padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
                                                        title="Upload board file"
                                                    >
                                                        <Upload size={14} />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* 3. BOM CSV (.csv) */}
                                            <div style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                                    <FileText size={14} color="#10b981" /> BOM File (.csv)
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <select
                                                        value={currentRev.bom_csv || ''}
                                                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text)' }}
                                                        onChange={e => {
                                                            const updated = [...packages];
                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].bom_csv = e.target.value || null;
                                                            setPackages(updated);
                                                        }}
                                                    >
                                                        <option value="">-- None --</option>
                                                        {selectedFiles.map(f => (
                                                            <option key={f.name} value={f.name}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                    <input 
                                                        type="file" 
                                                        accept=".csv" 
                                                        id={`bom-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
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
                                                        htmlFor={`bom-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ cursor: 'pointer', padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
                                                        title="Upload BOM CSV"
                                                    >
                                                        <Upload size={14} />
                                                    </label>
                                                </div>
                                            </div>

                                            {/* 4. Datasheet (.pdf) */}
                                            <div style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                                                    <FileText size={14} color="#f59e0b" /> Datasheet (.pdf)
                                                </span>
                                                <div style={{ display: 'flex', gap: '6px' }}>
                                                    <select
                                                        value={currentRev.datasheet || ''}
                                                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text)' }}
                                                        onChange={e => {
                                                            const updated = [...packages];
                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].datasheet = e.target.value || null;
                                                            setPackages(updated);
                                                        }}
                                                    >
                                                        <option value="">-- None --</option>
                                                        {selectedFiles.map(f => (
                                                            <option key={f.name} value={f.name}>{f.name}</option>
                                                        ))}
                                                    </select>
                                                    <input 
                                                        type="file" 
                                                        accept=".pdf" 
                                                        id={`ds-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
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
                                                        htmlFor={`ds-upload-${activePkgTab}-${activeSiTab}-${activeFfTab}-${activeRevTab}`}
                                                        style={{ cursor: 'pointer', padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem' }}
                                                        title="Upload datasheet PDF"
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

                {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee2e2', borderRadius: '4px' }}>{error}</div>}
                <button type="submit" className="submit-button" disabled={loading}>
                    <Save size={18} />
                    <span>{loading ? 'Saving...' : 'Save Project'}</span>
                </button>
            </form>
        </div>
    );
}
