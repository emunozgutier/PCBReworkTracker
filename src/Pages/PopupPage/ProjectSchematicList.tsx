import { useEffect, useState } from 'react';
import { Popup } from '../../components/Popup';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import { FileText, Eye, Download, Loader2, Upload, Trash2 } from 'lucide-react';
import { API_BASE } from '../../store/serverDataBase/apiBridge';
import { ProjectSchematicView } from './ProjectSchematicView';
import { useAppState } from '../../store/useAppState';
import { usePermissionsStore } from '../../store/clientDataBase/usePermissionsStore';

interface ProjectSchematicListProps {
    isOpen: boolean;
    onClose: () => void;
    project: {
        id: number;
        name: string;
    };
}

export function ProjectSchematicList({ isOpen, onClose, project }: ProjectSchematicListProps) {
    const { projectSchematics, fetchSchematics, uploadSchematics, deleteSchematic } = useProjectStore();
    const { currentUserRole } = useAppState();
    const permissions = usePermissionsStore(state => state.permissions);
    const roleKey = currentUserRole === 'Super User' ? 'superUser' : currentUserRole === 'User' ? 'user' : 'guest';
    
    const canAddSchematics = !!permissions[`Schematics__Add__${roleKey}`];
    const canDeleteSchematics = !!permissions[`Schematics__Delete__${roleKey}`];
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [viewingSchematic, setViewingSchematic] = useState<any>(null);

    useEffect(() => {
        if (isOpen && project?.id) {
            setLoading(true);
            fetchSchematics(project.id).finally(() => {
                setLoading(false);
            });
        }
    }, [isOpen, project?.id, fetchSchematics]);

    if (!isOpen || !project) return null;

    const list = projectSchematics[project.id.toString()] || [];

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setUploading(true);
            const filesArray = Array.from(e.target.files);
            const success = await uploadSchematics(project.id, filesArray);
            setUploading(false);
            if (!success) {
                alert("Failed to upload schematic PDF files.");
            }
        }
    };

    const handleDelete = async (schematicId: number, filename: string) => {
        if (confirm(`Are you sure you want to delete the schematic "${filename}"?`)) {
            const success = await deleteSchematic(project.id, schematicId);
            if (!success) {
                alert("Failed to delete schematic.");
            }
        }
    };

    const titleElement = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={22} color="var(--accent)" />
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)' }}>
                {project.name} Schematics
            </h2>
        </div>
    );

    return (
        <>
            <Popup isOpen={isOpen} onClose={onClose} title={titleElement} maxWidth="600px">
                <div style={{ minHeight: '150px', display: 'flex', flexDirection: 'column' }}>
                    {loading ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Loading Schematics...</span>
                        </div>
                    ) : list.length === 0 ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                            <FileText size={36} strokeWidth={1.5} style={{ marginBottom: '8px', opacity: 0.5 }} />
                            <p style={{ margin: 0, fontSize: '0.95rem' }}>No schematic PDF files attached to this project.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                            {list.map((item: any) => {
                                const fullUrl = item.path.startsWith('http') ? item.path : `${API_BASE.replace('/api', '')}${item.path}`;
                                return (
                                    <div 
                                        key={item.id} 
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'space-between', 
                                            padding: '12px 16px', 
                                            background: 'rgba(255, 255, 255, 0.02)', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '8px',
                                            transition: 'background 0.2s ease',
                                            gap: '12px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                                            <div style={{ 
                                                width: '40px', 
                                                height: '40px', 
                                                borderRadius: '8px', 
                                                background: 'rgba(239, 68, 68, 0.1)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                flexShrink: 0
                                            }}>
                                                <FileText size={20} color="#ef4444" />
                                            </div>
                                            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                                <span 
                                                    style={{ 
                                                        fontSize: '0.95rem', 
                                                        fontWeight: 550, 
                                                        color: 'var(--text)', 
                                                        whiteSpace: 'nowrap', 
                                                        overflow: 'hidden', 
                                                        textOverflow: 'ellipsis' 
                                                    }}
                                                    title={item.filename}
                                                >
                                                    {item.filename}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    Uploaded: {new Date(item.uploaded_at).toLocaleDateString()} at {new Date(item.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <button
                                                onClick={() => setViewingSchematic(item)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '8px 12px',
                                                    background: 'rgba(99, 102, 241, 0.1)',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)',
                                                    borderRadius: '6px',
                                                    color: 'var(--accent)',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                                                }}
                                            >
                                                <Eye size={14} />
                                                <span>View</span>
                                            </button>
                                            <a
                                                href={fullUrl}
                                                download={item.filename}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '6px',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                                    e.currentTarget.style.color = 'var(--text)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                                    e.currentTarget.style.color = 'var(--text-muted)';
                                                }}
                                                title="Download PDF"
                                            >
                                                <Download size={14} />
                                            </a>
                                            {canDeleteSchematics && (
                                                <button
                                                    onClick={() => handleDelete(item.id, item.filename)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        width: '32px',
                                                        height: '32px',
                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                        border: '1px solid rgba(239, 68, 68, 0.3)',
                                                        borderRadius: '6px',
                                                        color: '#ef4444',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                    }}
                                                    title="Delete Schematic"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {canAddSchematics && (
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                            <input 
                                type="file" 
                                multiple 
                                accept=".pdf" 
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                id="list-schematics-upload"
                                disabled={uploading}
                            />
                            <label 
                                htmlFor="list-schematics-upload"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    padding: '12px 16px',
                                    background: 'rgba(99, 102, 241, 0.05)',
                                    border: '1px dashed rgba(99, 102, 241, 0.4)',
                                    borderRadius: '8px',
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    color: 'var(--accent)',
                                    transition: 'all 0.2s',
                                    fontWeight: 600,
                                    fontSize: '0.9rem'
                                }}
                                onMouseEnter={(e) => {
                                    if (!uploading) {
                                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                                        e.currentTarget.style.borderColor = 'var(--accent)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!uploading) {
                                        e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)';
                                        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
                                    }
                                }}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={16} />
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} />
                                        <span>Upload Schematic PDFs</span>
                                    </>
                                )}
                            </label>
                        </div>
                    )}
                </div>
            </Popup>

            <ProjectSchematicView
                isOpen={viewingSchematic !== null}
                onClose={() => setViewingSchematic(null)}
                schematic={viewingSchematic}
            />
        </>
    );
}
