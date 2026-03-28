import { ExternalLink } from 'lucide-react';
import { usePcbStore } from '../store/storePcb';
import { useStore } from '../store/useStore';
import { PcbCardHeader } from './PcbCardHeader';

interface ProjectCardBodyProps {
    project: {
        id: number;
        name: string;
        description: string;
        pcb_count: number;
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
            {/* Project Summary Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '8px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Silicon Versions</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {project.revisions?.length > 0 ? project.revisions.map((rev, i) => (
                            <span key={i} className="pcb-pill" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>{rev}</span>
                        )) : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None defined</span>}
                    </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '120px' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>PCB Flavors</span>
                     <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {project.formfactors && project.formfactors.length > 0 ? project.formfactors.map((ff, i) => (
                            <span key={i} className="pcb-pill" style={{ padding: '2px 8px' }}>{ff.name}</span>
                        )) : <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>None assigned</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '80px', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Count</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)', lineHeight: '1', marginTop: '2px' }}>{project.pcb_count}</span>
                </div>
            </div>

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
                        <div key={index} style={{ border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-element)' }}>
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

