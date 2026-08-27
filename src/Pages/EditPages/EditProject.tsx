import { useEffect, useState } from 'react';
import { ArrowLeft, Save, Trash2, HelpCircle, Upload, FileText, Cpu, Layers } from 'lucide-react';
import { FormTabs } from '../../components/forms/FormTabs';
import { MultipleInputs } from '../../components/forms/MultipleInputs';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import type { Package } from '../../store/clientDataBase/useProjectStore';
import { usePcbStore } from '../../store/clientDataBase/usePcbStore';
import { RemoveProject } from '../RemovePage/RemoveProject';
import { useAppState } from '../../store/useAppState';

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

    const handleFileUpload = (file: File, updateRevField: (filename: string) => void) => {
        if (!selectedFiles.some(f => f.name === file.name)) {
            setSelectedFiles(prev => [...prev, file]);
        }
        updateRevField(file.name);
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

    const currentPkg = packages[activePkgTab];
    const currentSi = currentPkg?.silicon_versions[activeSiTab];
    const currentFf = currentSi?.formfactors[activeFfTab];
    const currentRev = currentFf?.revisions[activeRevTab];

    return (
        <div className="add-page-container">
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

                {/* --- HIERARCHY LEVEL 1: PACKAGES --- */}
                <div className="form-group" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Layers size={18} color="var(--accent)" />
                        <label style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>Packages</label>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                        Configure packages for this project (e.g. 40 pin, 48 pin IC, BGA-128).
                    </p>

                    <FormTabs
                        tabs={packages.map(p => p.name || 'Unnamed Package')}
                        activeTab={activePkgTab}
                        onTabChange={(idx) => {
                            setActivePkgTab(idx);
                            setActiveSiTab(0);
                            setActiveFfTab(0);
                            setActiveRevTab(0);
                        }}
                        onAddTab={() => {
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
                        }}
                        onDeleteActiveTab={() => {
                            const newPkgs = packages.filter((_, i) => i !== activePkgTab);
                            setPackages(newPkgs);
                            setActivePkgTab(Math.max(0, activePkgTab - 1));
                            setActiveSiTab(0);
                            setActiveFfTab(0);
                            setActiveRevTab(0);
                        }}
                        canDeleteActiveTab={packages.length > 1}
                    >
                        {currentPkg && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Package Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 40 pin QFN" 
                                        value={currentPkg.name} 
                                        style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--text)' }}
                                        onChange={e => {
                                            const updated = [...packages];
                                            updated[activePkgTab].name = e.target.value;
                                            setPackages(updated);
                                        }}
                                    />
                                </div>

                                {/* --- HIERARCHY LEVEL 2: SILICON VERSIONS --- */}
                                <div style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '14px', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <Cpu size={16} color="var(--accent)" />
                                        <label style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>Silicon Versions for {currentPkg.name || 'Package'}</label>
                                    </div>

                                    <FormTabs
                                        tabs={currentPkg.silicon_versions.map(sv => sv.name || 'Unnamed Version')}
                                        activeTab={activeSiTab}
                                        onTabChange={(idx) => {
                                            setActiveSiTab(idx);
                                            setActiveFfTab(0);
                                            setActiveRevTab(0);
                                        }}
                                        onAddTab={() => {
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
                                        }}
                                        onDeleteActiveTab={() => {
                                            const updated = [...packages];
                                            updated[activePkgTab].silicon_versions = updated[activePkgTab].silicon_versions.filter((_, i) => i !== activeSiTab);
                                            setPackages(updated);
                                            setActiveSiTab(Math.max(0, activeSiTab - 1));
                                            setActiveFfTab(0);
                                            setActiveRevTab(0);
                                        }}
                                        canDeleteActiveTab={currentPkg.silicon_versions.length > 1}
                                    >
                                        {currentSi && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                                                    <div>
                                                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Silicon Version</label>
                                                        <input 
                                                            type="text" 
                                                            placeholder="e.g. A0" 
                                                            value={currentSi.name} 
                                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--text)' }}
                                                            onChange={e => {
                                                                const updated = [...packages];
                                                                updated[activePkgTab].silicon_versions[activeSiTab].name = e.target.value;
                                                                setPackages(updated);
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>Silicon Corners</label>
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

                                                {/* --- HIERARCHY LEVEL 3: BOARD FORMFACTORS --- */}
                                                <div style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'block' }}>Board FormFactors</label>
                                                    
                                                    <FormTabs
                                                        tabs={currentSi.formfactors.map(ff => ff.name || 'Unnamed FormFactor')}
                                                        activeTab={activeFfTab}
                                                        onTabChange={(idx) => {
                                                            setActiveFfTab(idx);
                                                            setActiveRevTab(0);
                                                        }}
                                                        onAddTab={() => {
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
                                                        }}
                                                        onDeleteActiveTab={() => {
                                                            const updated = [...packages];
                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors = updated[activePkgTab].silicon_versions[activeSiTab].formfactors.filter((_, i) => i !== activeFfTab);
                                                            setPackages(updated);
                                                            setActiveFfTab(Math.max(0, activeFfTab - 1));
                                                            setActiveRevTab(0);
                                                        }}
                                                        canDeleteActiveTab={currentSi.formfactors.length > 1}
                                                    >
                                                        {currentFf && (
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                                <div>
                                                                    <label style={{ fontSize: '0.8rem', marginBottom: '4px', display: 'block' }}>FormFactor Name</label>
                                                                    <input 
                                                                        type="text" 
                                                                        placeholder="e.g. Demo, Validation" 
                                                                        value={currentFf.name} 
                                                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--text)' }}
                                                                        onChange={e => {
                                                                            const updated = [...packages];
                                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].name = e.target.value;
                                                                            setPackages(updated);
                                                                        }}
                                                                    />
                                                                </div>

                                                                {/* --- HIERARCHY LEVEL 4: REVISIONS, BOMS & DOCUMENTS --- */}
                                                                <div style={{ border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '12px', backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
                                                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', display: 'block' }}>Revisions, BOMs & Documents</label>
                                                                    
                                                                    <FormTabs
                                                                        tabs={currentFf.revisions.map(r => r.name || 'Unnamed Revision')}
                                                                        activeTab={activeRevTab}
                                                                        onTabChange={setActiveRevTab}
                                                                        onAddTab={() => {
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
                                                                        }}
                                                                        onDeleteActiveTab={() => {
                                                                            const updated = [...packages];
                                                                            updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions = updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions.filter((_, i) => i !== activeRevTab);
                                                                            setPackages(updated);
                                                                            setActiveRevTab(Math.max(0, activeRevTab - 1));
                                                                        }}
                                                                        canDeleteActiveTab={currentFf.revisions.length > 1}
                                                                    >
                                                                        {currentRev && (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                                                                                    <div>
                                                                                        <label style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>Revision Name</label>
                                                                                        <input 
                                                                                            type="text" 
                                                                                            placeholder="e.g. 1.0" 
                                                                                            value={currentRev.name} 
                                                                                            style={{ width: '100%', padding: '0.45rem', border: '1px solid var(--border)', borderRadius: '4px', backgroundColor: 'rgba(0, 0, 0, 0.2)', color: 'var(--text)' }}
                                                                                            onChange={e => {
                                                                                                const updated = [...packages];
                                                                                                updated[activePkgTab].silicon_versions[activeSiTab].formfactors[activeFfTab].revisions[activeRevTab].name = e.target.value;
                                                                                                setPackages(updated);
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <label style={{ fontSize: '0.75rem', marginBottom: '4px', display: 'block' }}>BOM Flavors</label>
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
                                                                                    <label style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', display: 'block', color: 'var(--accent)' }}>
                                                                                        Revision Documents (PDF Schematic, BRD Board, BOM CSV, PDF Datasheet)
                                                                                    </label>
                                                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                                                                                        {/* 1. Schematic (.pdf) */}
                                                                                        <div style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'rgba(0,0,0,0.1)' }}>
                                                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                                                                <FileText size={12} /> Schematic (.pdf)
                                                                                            </span>
                                                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                                                <select
                                                                                                    value={currentRev.schematic || ''}
                                                                                                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text)' }}
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
                                                                                                    style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}
                                                                                                >
                                                                                                    <Upload size={12} />
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* 2. Board File (.brd) */}
                                                                                        <div style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'rgba(0,0,0,0.1)' }}>
                                                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                                                                <FileText size={12} /> Board File (.brd)
                                                                                            </span>
                                                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                                                <select
                                                                                                    value={currentRev.board_file || ''}
                                                                                                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text)' }}
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
                                                                                                    style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}
                                                                                                >
                                                                                                    <Upload size={12} />
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* 3. BOM CSV (.csv) */}
                                                                                        <div style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'rgba(0,0,0,0.1)' }}>
                                                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                                                                <FileText size={12} /> BOM File (.csv)
                                                                                            </span>
                                                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                                                <select
                                                                                                    value={currentRev.bom_csv || ''}
                                                                                                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text)' }}
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
                                                                                                    style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}
                                                                                                >
                                                                                                    <Upload size={12} />
                                                                                                </label>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* 4. Datasheet (.pdf) */}
                                                                                        <div style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '4px', background: 'rgba(0,0,0,0.1)' }}>
                                                                                            <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                                                                <FileText size={12} /> Datasheet (.pdf)
                                                                                            </span>
                                                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                                                <select
                                                                                                    value={currentRev.datasheet || ''}
                                                                                                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem', border: '1px solid var(--border)', borderRadius: '4px', background: 'transparent', color: 'var(--text)' }}
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
                                                                                                    style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem' }}
                                                                                                >
                                                                                                    <Upload size={12} />
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
                                                        )}
                                                    </FormTabs>
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
