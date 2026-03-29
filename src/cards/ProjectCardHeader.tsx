import { ChevronDown, ChevronUp } from 'lucide-react';

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
}

export function ProjectCardHeader({ project, isExpanded, onToggle }: ProjectCardHeaderProps) {
    return (
        <div 
            className="card-header-main" 
            onClick={onToggle}
            style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px', gap: '12px' }}
        >
            {isExpanded && (
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.85rem', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.06)', 
                        border: '1px solid rgba(255, 255, 255, 0.12)', 
                        padding: '4px 12px', 
                        borderRadius: '16px',
                        color: 'var(--text-muted)'
                    }}>
                        {project.revisions?.length || 0} Revs
                    </span>
                    <span style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.06)', 
                        border: '1px solid rgba(255, 255, 255, 0.12)', 
                        padding: '4px 12px', 
                        borderRadius: '16px', 
                        display: 'flex', 
                        gap: '6px',
                        alignItems: 'center',
                        color: 'var(--text-muted)'
                    }}>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>PCBs</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>{project.formfactors?.length || 0} Flavors</span>
                        <span style={{ opacity: 0.3 }}>|</span>
                        <span>{project.pcb_count} Count</span>
                    </span>
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>

                    <span className="board-num" style={{ margin: 0 }}>{project.project_key} - {project.name}</span>
                </div>
                <div className="expand-indicator" style={{ display: 'flex', position: 'static', transform: 'none' }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>
        </div>
    );
}
