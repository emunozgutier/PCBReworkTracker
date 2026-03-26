interface ProjectCardBodyProps {
    project: {
        description: string;
        pcbs: string[];
        revisions: string[];
    };
}

export function ProjectCardBody({ project }: ProjectCardBodyProps) {
    return (
        <div className="card-expanded-content">
            {project.description && (
                <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>{project.description}</p>
            )}
            <div style={{ marginBottom: '16px' }}>
                <h4>Available Revisions</h4>
                {project.revisions && project.revisions.length > 0 ? (
                    <div className="pcb-mini-list">
                        {project.revisions.map((rev, index) => (
                            <span key={index} className="pcb-pill" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>{rev}</span>
                        ))}
                    </div>
                ) : (
                    <p className="no-data">No specific revisions defined.</p>
                )}
            </div>

            <h4>Associated PCBs</h4>
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
    );
}
