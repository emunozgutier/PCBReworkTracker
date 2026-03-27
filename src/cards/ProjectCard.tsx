import { ProjectCardHeader } from './ProjectCardHeader';
import { ProjectCardBody } from './ProjectCardBody';
import { useStore } from '../store/useStore';

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
    const { expandedProject, setExpandedProject } = useStore();
    const isExpanded = expandedProject === project.name;

    const handleToggle = () => {
        if (isExpanded) {
            setExpandedProject(null);
        } else {
            setExpandedProject(project.name);
        }
    };

    return (
        <div className={`item-card project-card ${isExpanded ? 'active' : ''}`}>
            <ProjectCardHeader 
                project={project} 
                isExpanded={isExpanded} 
                onToggle={handleToggle} 
                onEdit={onEdit} 
            />
            {isExpanded && <ProjectCardBody project={project} />}
        </div>
    );
}
