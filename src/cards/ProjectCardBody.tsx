import { useState } from 'react';
import { ExternalLink, Edit2 } from 'lucide-react';
import { usePcbStore } from '../store/storePcb';
import { useStore } from '../store/useStore';
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
                <button 
                    onClick={(e) => { e.stopPropagation(); editItem('projects_edit', project.id); }}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                >
                    <Edit2 size={16} /> Edit Project
                </button>
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProjects([project.id.toString()]);
                        setActiveTab('pcbs');
                    }}
                    style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        background: 'transparent',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                    className={`view-pcbs-btn ${isBlinking ? 'blink-button' : ''}`}
                >
                    <ExternalLink size={16} /> View PCBs Info
                </button>
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

