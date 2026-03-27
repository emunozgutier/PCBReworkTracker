import { useEffect } from 'react';
import { useReworkStore } from '../store/storeRework';
import { useStore } from '../store/useStore';
import { API_BASE } from '../api';
import { Plus } from 'lucide-react';

interface PcbCardBodyProps {
    pcb: any;
}

export function PcbCardBody({ pcb }: PcbCardBodyProps) {
    const { reworks, fetchReworks } = useReworkStore();
    const { addItem } = useStore();

    useEffect(() => {
        if (reworks.length === 0) fetchReworks();
    }, [reworks.length, fetchReworks]);

    const pcbReworks = reworks.filter((r: any) => r.pcb_id === pcb.id);

    return (
        <div className="card-expanded-content">
            <button 
                onClick={(e) => { e.stopPropagation(); addItem('reworks_add', pcb.id); }}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '8px', 
                    background: 'rgba(99, 102, 241, 0.15)', 
                    color: '#818cf8', 
                    border: '1px solid rgba(99, 102, 241, 0.5)', 
                    padding: '10px 16px', 
                    borderRadius: '8px', 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    width: '100%',
                    marginBottom: '16px',
                    transition: 'all 0.2s ease'
                }}
            >
                <Plus size={18} /> Add Rework log for this PCB
            </button>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Recent Rework History</h4>
            {pcbReworks.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pcbReworks.slice(0, 5).map((rework: any, index: number) => (
                        <div key={index} style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent)' }}>
                                    {rework.rework_name || `Rework #${rework.id}`}
                                </span>
                                <span className={`status-pill ${rework.status?.toLowerCase().replace(' ', '-') || 'unknown'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                                    {rework.status}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text)', marginBottom: '6px' }}>
                                {rework.description}
                            </div>
                            {rework.image_path && (
                                <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {(() => {
                                        let paths = [];
                                        try { paths = JSON.parse(rework.image_path); } catch(e) { paths = [rework.image_path]; }
                                        return paths.map((p: string, i: number) => (
                                            <div key={i} style={{ cursor: 'pointer' }} onClick={() => window.open(`${API_BASE}${p}`, '_blank')}>
                                                <img 
                                                    src={`${API_BASE}${p}`} 
                                                    alt={`Rework attachment ${i+1}`} 
                                                    style={{ maxWidth: '100%', height: '120px', borderRadius: '6px', border: '1px solid var(--border)', objectFit: 'cover', background: 'rgba(0,0,0,0.2)' }} 
                                                />
                                            </div>
                                        ));
                                    })()}
                                </div>
                            )}
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
