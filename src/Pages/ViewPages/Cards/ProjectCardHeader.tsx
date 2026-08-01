import { ChevronDown, ChevronUp } from 'lucide-react';
import { InfoPill } from '../../../components/InfoPill';

interface ProjectCardHeaderProps {
    project: {
        id: number;
        name: string;
        pcb_count: number;
        doc_count?: number;
        revisions: string[];
        flavors?: any[];
        project_key: string;
    };
    isExpanded: boolean;
    onToggle: () => void;
}

export function ProjectCardHeader({ project, isExpanded, onToggle }: ProjectCardHeaderProps) {
    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
            style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 16px', gap: '12px' }}
        >
            <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <span className="board-num" style={{ margin: 0, whiteSpace: 'nowrap' }}>{project.project_key} - {project.name}</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <InfoPill text={`${project.pcb_count} PCBs`} color="var(--text-muted)" />
                    <InfoPill text={`${project.doc_count || 0} Docs`} color="var(--text-muted)" />
                </div>
            </div>

            <div className="expand-indicator" style={{ display: 'flex', position: 'static', transform: 'none', flexShrink: 0, marginTop: '2px' }}>
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
        </div>
    );
}
