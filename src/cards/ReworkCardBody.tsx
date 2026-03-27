import { API_BASE } from '../api';

interface ReworkCardBodyProps {
    rework: any;
}

export function ReworkCardBody({ rework }: ReworkCardBodyProps) {
    return (
        <div className="card-expanded-content">
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Rework Details</h4>
            
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Description</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: 'var(--text)', whiteSpace: 'pre-wrap' }}>
                            {rework.description}
                        </p>
                    </div>

                    {rework.image_path && (
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Attached Photos</span>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {(() => {
                                    let paths = [];
                                    try { paths = JSON.parse(rework.image_path); } catch(e) { paths = [rework.image_path]; }
                                    return paths.map((p: string, i: number) => (
                                        <div key={i} style={{ cursor: 'zoom-in' }} onClick={() => window.open(`${API_BASE}${p}`, '_blank')}>
                                            <img 
                                                src={`${API_BASE}${p}`} 
                                                alt={`Rework attachment ${i+1}`} 
                                                style={{ maxWidth: '100%', height: '200px', borderRadius: '8px', border: '1px solid var(--border)', objectFit: 'cover', background: 'rgba(0,0,0,0.2)' }} 
                                            />
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Timestamp</span>
                            <div style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text)' }}>
                                {new Date(rework.timestamp).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Database ID</span>
                            <div style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text)' }}>
                                #{rework.id}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
