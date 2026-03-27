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
        <div className="card-expanded-content">
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Silicon Versions</h4>
                {project.revisions && project.revisions.length > 0 ? (
                    <div className="pcb-mini-list">
                        {project.revisions.map((rev, index) => (
                            <span key={index} className="pcb-pill" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>{rev}</span>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No silicon versions defined.</p>
                )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0', opacity: 0.5 }} />

            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>PCB Flavors</h4>
                {project.formfactors && project.formfactors.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {project.formfactors.map((ff, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontWeight: 600, minWidth: '80px', color: 'var(--text)' }}>{ff.name}</span>
                                <div className="pcb-mini-list" style={{ marginTop: 0 }}>
                                    {ff.revisions.map((rev, rIdx) => (
                                        <span key={rIdx} className="pcb-pill" style={{ opacity: 0.8 }}>{rev}</span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No PCB flavors defined.</p>
                )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '16px 0', opacity: 0.5 }} />

            <div>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Associated PCBs</h4>
                {project.pcbs.length > 0 ? (
                    <div className="pcb-mini-list">
                        {project.pcbs.map((pcb, index) => (
                            <span key={index} className="pcb-pill">{pcb}</span>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No PCBs assigned yet.</p>
                )}
            </div>
        </div>
    );
}
