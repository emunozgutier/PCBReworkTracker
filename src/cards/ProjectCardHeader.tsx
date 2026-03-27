import { ChevronDown, ChevronUp, Edit2 } from 'lucide-react';

interface ProjectCardHeaderProps {
    project: {
        id: number;
        name: string;
        pcb_count: number;
        revisions: string[];
        formfactors?: any[];
        project_key: string;
    };
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: (id: number) => void;
}

export function ProjectCardHeader({ project, isExpanded, onToggle, onEdit }: ProjectCardHeaderProps) {
    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
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
                <span className="board-num" style={{ margin: 0 }}>{project.project_key} - {project.name}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1rem', color: 'inherit', fontFamily: 'inherit' }}>
                    <span>{project.formfactors?.length || 0} Flavors</span>
                    <span>{project.revisions?.length || 0} Revs</span>
                    <span>{project.pcb_count} PCBs</span>
                </div>
                <div className="expand-indicator" style={{ display: 'flex' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>
        </div>
    );
}
