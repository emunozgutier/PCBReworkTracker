import { useState } from 'react';
import { EditButton, ViewButton } from '../../forms/ActionButtons';
import { usePcbStore } from '../../store/storePcb';
import { useStore } from '../../store/useStore';
import { PcbCardHeader } from './PcbCardHeader';
import { ProjectCardSummary } from './ProjectCardSummary';

interface ProjectCardBodyProps {
    project: {
        id: number;
        name: string;
        description: string;
        pcb_count: number;
        pcbs: string[];
        revisions: string[];
        formfactors?: { name: string; revisions: string[] }[];
        silicon_corners?: string;
    };
}

export function ProjectCardBody({ project }: ProjectCardBodyProps) {
    const { pcbs: allPcbs, setSelectedProjects } = usePcbStore();
    const { setActiveTab, editItem } = useStore();
    
    // Get actual PCB objects for this project
    const projectPcbs = allPcbs.filter(p => p.project === project.name);

    const [isBlinking, setIsBlinking] = useState(false);

    const handlePcbClick = () => {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 2000); // blink for 2 seconds (time for 3 loops)
    };

    return (
        <div className="card-expanded-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <ProjectCardSummary project={project} />

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <EditButton 
                    onClick={(e) => { e.stopPropagation(); editItem('projects_edit', project.id); }}
                    label="Edit Project"
                />
                <ViewButton 
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjects([project.id.toString()]);
                        setActiveTab('pcbs');
                    }}
                    className={`view-pcbs-btn ${isBlinking ? 'blink-button' : ''}`}
                    label="View PCBs Info"
                />
            </div>

            {projectPcbs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {projectPcbs.map((pcb, index) => (
                        <div key={index} style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-element)' }}>
                            <PcbCardHeader 
                                pcb={pcb} 
                                isExpanded={false}
                                onToggle={() => handlePcbClick()}
                                hideActions={true}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-data" style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No PCBs assigned.</p>
            )}
        </div>
    );
}

