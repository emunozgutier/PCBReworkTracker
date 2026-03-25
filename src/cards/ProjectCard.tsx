import { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, CircuitBoard } from 'lucide-react';

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
            <div className="card-actions-overlay">
                <button className="edit-button" onClick={() => onEdit(project.id)}>
                    <Edit2 size={16} />
                </button>
            </div>

            <div className="card-header-main" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="card-title">
                    <span className="board-num">{project.name}</span>
                    <span className="pcb-count-tag">
                        <CircuitBoard size={14} />
                        {project.pcb_count} PCBs
                    </span>
                </div>
                <div className="card-details">
                    <p>{project.description}</p>
                </div>
                <div className="expand-indicator">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>

            {isExpanded && (
                <div className="card-expanded-content">
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
