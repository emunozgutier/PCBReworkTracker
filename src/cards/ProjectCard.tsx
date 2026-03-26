import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';

interface ProjectCardProps {
    project: {
        id: number;
        name: string;
        description: string;
        pcb_count: number;
        pcbs: string[];
        revisions: string[];
    };
    onEdit: (id: number) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`item-card project-card ${isExpanded ? 'active' : ''}`}>
            <div 
                className="card-header-main" 
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <button 
                        className="edit-button" 
                        onClick={(e) => { e.stopPropagation(); onEdit(project.id); }}
                        style={{ background: 'none', border: 'none', padding: 0, margin: 0, display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'static' }}
                    >
                        <Edit2 size={16} />
                    </button>
                    <span className="board-num" style={{ margin: 0 }}>{project.name}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    {!isExpanded && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', color: 'inherit', fontFamily: 'inherit' }}>
                            <span>{project.revisions?.length || 0} Revs</span>
                            <span>{project.pcb_count} PCBs</span>
                        </div>
                    )}
                    <div className="expand-indicator" style={{ display: 'flex' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="card-expanded-content">
                    {project.description && (
                        <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>{project.description}</p>
                    )}
                    <div style={{ marginBottom: '16px' }}>
                        <h4>Available Revisions</h4>
                        {project.revisions && project.revisions.length > 0 ? (
                            <div className="pcb-mini-list">
                                {project.revisions.map((rev, index) => (
                                    <span key={index} className="pcb-pill" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>{rev}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="no-data">No specific revisions defined.</p>
                        )}
                    </div>

                    <h4>Associated PCBs</h4>
                    {project.pcbs.length > 0 ? (
                        <div className="pcb-mini-list">
                            {project.pcbs.map((pcb, index) => (
                                <span key={index} className="pcb-pill">{pcb}</span>
                            ))}
                        </div>
                    ) : (
                        <p className="no-data">No PCBs assigned yet.</p>
                    )}
                </div>
            )}
        </div>
    );
}
