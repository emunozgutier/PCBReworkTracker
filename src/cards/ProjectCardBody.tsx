import { ExternalLink } from 'lucide-react';
import { usePcbStore } from '../store/storePcb';
import { useStore } from '../store/useStore';
import { PcbCardHeader } from './PcbCardHeader';

interface ProjectCardBodyProps {
    project: {
        id: number;
        name: string;
        description: string;
        pcbs: string[];
        revisions: string[];
        formfactors?: { name: string; revisions: string[] }[];
    };
}

export function ProjectCardBody({ project }: ProjectCardBodyProps) {
    const { pcbs: allPcbs, setSelectedProjects } = usePcbStore();
    const { setActiveTab, editItem } = useStore();
    
    // Get actual PCB objects for this project
    const projectPcbs = allPcbs.filter(p => p.project === project.name);

    return (
        <div className="card-expanded-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button 
                onClick={() => {
                    setSelectedProjects([project.id.toString()]);
                    setActiveTab('pcbs');
                }}
                style={{
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
                    transition: 'all 0.2s',
                    marginBottom: '12px'
                }}
                className="view-pcbs-btn"
            >
                <span>View Detailed PCBs Info</span>
                <ExternalLink size={16} />
            </button>

            {projectPcbs.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {projectPcbs.map((pcb, index) => (
                        <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-element)' }}>
                            <PcbCardHeader 
                                pcb={pcb} 
                                isExpanded={false}
                                onToggle={() => {}}
                                onEdit={(id) => editItem('pcbs_edit', id)}
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

