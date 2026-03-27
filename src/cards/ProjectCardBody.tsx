interface ProjectCardBodyProps {
    project: {
        description: string;
        pcbs: string[];
        revisions: string[];
        formfactors?: { name: string; revisions: string[] }[];
    };
}

export function ProjectCardBody({ project }: ProjectCardBodyProps) {
    return (
        <div className="card-expanded-content" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Silicon Versions Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', minWidth: '120px' }}>Silicon Versions</span>
                {project.revisions && project.revisions.length > 0 ? (
                    <div className="pcb-mini-list" style={{ marginTop: 0, gap: '6px' }}>
                        {project.revisions.map((rev, index) => (
                            <span key={index} className="pcb-pill" style={{ borderColor: 'var(--accent)', color: 'var(--accent)', padding: '2px 8px' }}>{rev}</span>
                        ))}
                    </div>
                ) : (
                    <span className="no-data" style={{ margin: 0, fontSize: '0.85rem' }}>None defined.</span>
                )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0, opacity: 0.3 }} />

            {/* PCB Flavors Row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', minWidth: '120px', paddingTop: '4px' }}>PCB Flavors</span>
                {project.formfactors && project.formfactors.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                        {project.formfactors.map((ff, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: 600, minWidth: '100px', width: '100px', flexShrink: 0, color: 'var(--text)', fontSize: '0.9rem' }}>{ff.name}</span>
                                <div className="pcb-mini-list" style={{ marginTop: 0, gap: '6px', flex: 1 }}>
                                    {ff.revisions.map((rev, rIdx) => (
                                        <span key={rIdx} className="pcb-pill" style={{ opacity: 0.8, padding: '2px 8px' }}>{rev}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <span className="no-data" style={{ margin: 0, fontSize: '0.85rem', paddingTop: '4px' }}>None defined.</span>
                )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0, opacity: 0.3 }} />

            {/* Associated PCBs Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', minWidth: '120px' }}>Associated PCBs</span>
                {project.pcbs.length > 0 ? (
                    <div className="pcb-mini-list" style={{ marginTop: 0, gap: '6px' }}>
                        {project.pcbs.map((pcb, index) => (
                            <span key={index} className="pcb-pill" style={{ padding: '2px 8px' }}>{pcb}</span>
                        ))}
                    </div>
                ) : (
                    <span className="no-data" style={{ margin: 0, fontSize: '0.85rem' }}>None assigned.</span>
                )}
            </div>
        </div>
    );
}
