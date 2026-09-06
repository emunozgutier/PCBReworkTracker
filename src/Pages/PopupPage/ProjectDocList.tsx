import { UploadedDocsModal } from './UploadedDocsModal';

interface ProjectDocListProps {
    isOpen: boolean;
    onClose: () => void;
    project: {
        id: number;
        name: string;
        project_key?: string;
    };
}

export function ProjectDocList({ isOpen, onClose, project }: ProjectDocListProps) {
    return (
        <UploadedDocsModal 
            isOpen={isOpen} 
            onClose={onClose} 
            project={project} 
        />
    );
}
