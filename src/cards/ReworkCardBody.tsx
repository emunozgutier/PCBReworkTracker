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
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Attached Photo</span>
                            <div style={{ cursor: 'zoom-in' }} onClick={() => window.open(`${API_BASE}${rework.image_path}`, '_blank')}>
                                <img 
                                    src={`${API_BASE}${rework.image_path}`} 
                                    alt="Rework attachment" 
                                    style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', border: '1px solid var(--border)', objectFit: 'contain', background: 'rgba(0,0,0,0.2)' }} 
                                />
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
