import { useState } from 'react';
import { ProjectCardHeader } from './ProjectCardHeader';
import { ProjectCardBody } from './ProjectCardBody';

interface ProjectCardProps {
    project: {
        id: number;
        name: string;
        description: string;
        pcb_count: number;
        pcbs: string[];
        revisions: string[];
        project_key: string;
    };
    onEdit: (id: number) => void;
}

export function ProjectCard({ project, onEdit }: ProjectCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={`item-card project-card ${isExpanded ? 'active' : ''}`}>
            <ProjectCardHeader 
                project={project} 
                isExpanded={isExpanded} 
                onToggle={() => setIsExpanded(!isExpanded)} 
                onEdit={onEdit} 
            />
            {isExpanded && <ProjectCardBody project={project} />}
        </div>
    );
}
