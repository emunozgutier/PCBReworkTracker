import { useEffect } from 'react';
import { useReworkStore } from '../store/storeRework';

interface PcbCardBodyProps {
    pcb: any;
}

export function PcbCardBody({ pcb }: PcbCardBodyProps) {
    const { reworks, fetchReworks } = useReworkStore();

    useEffect(() => {
        if (reworks.length === 0) fetchReworks();
    }, [reworks.length, fetchReworks]);

    const pcbReworks = reworks.filter((r: any) => r.pcb_board_number === pcb.board_number);

    return (
        <div className="card-expanded-content">
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Recent Rework History</h4>
            {pcbReworks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pcbReworks.slice(0, 5).map((rework: any, index: number) => (
                        <div key={index} style={{ padding: '8px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rework.description}</span>
                                <span className={`status-pill ${rework.status?.toLowerCase().replace(' ', '-') || 'unknown'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                    {rework.status}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {new Date(rework.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))}
                    {pcbReworks.length > 5 && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--accent)', textAlign: 'center', margin: '4px 0 0 0', cursor: 'pointer', padding: '4px' }}>
                            + {pcbReworks.length - 5} older reworks...
                        </p>
                    )}
                </div>
            ) : (
                <p className="no-data" style={{ color: 'var(--text-muted)', fontStyle: 'italic', margin: 0, fontSize: '0.9rem' }}>No rework history logged for this board.</p>
            )}
        </div>
    );
}
