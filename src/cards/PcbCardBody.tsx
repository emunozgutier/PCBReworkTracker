import { useEffect } from 'react';
import { useReworkStore } from '../store/storeRework';
import { useStore } from '../store/useStore';
import { API_BASE } from '../api';
import { Plus, ExternalLink, QrCode as QrCodeIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { useState } from 'react';

interface PcbCardBodyProps {
    pcb: any;
}

export function PcbCardBody({ pcb }: PcbCardBodyProps) {
    const { reworks, fetchReworks, setSelectedBoards } = useReworkStore();
    const { addItem, setActiveTab } = useStore();
    const [showQR, setShowQR] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState('');

    useEffect(() => {
        if (reworks.length === 0) fetchReworks();
    }, [reworks.length, fetchReworks]);

    useEffect(() => {
        if (showQR && !qrDataUrl) {
            const generateQR = async () => {
                try {
                    const localIp = typeof __LOCAL_IP__ !== 'undefined' ? __LOCAL_IP__ : window.location.hostname;
                    const port = typeof __PORT__ !== 'undefined' ? __PORT__ : window.location.port;
                    const url = `http://${localIp}:${port}/board=${pcb.board_number}`;
                    const dataUrl = await QRCode.toDataURL(url, {
                        margin: 2,
                        width: 160,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                    setQrDataUrl(dataUrl);
                } catch (err) {
                    console.error('Failed to generate QR:', err);
                }
            };
            generateQR();
        }
    }, [showQR, pcb.board_number, qrDataUrl]);

    const pcbReworks = reworks.filter((r: any) => r.pcb_id === pcb.id);

    return (
        <div className="card-expanded-content">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <button 
                    onClick={(e) => { e.stopPropagation(); addItem('reworks_add', pcb.id); }}
                    style={{ 
                        flex: 1,
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
                        minWidth: '180px',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <Plus size={18} /> Add Rework log
                </button>
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedBoards([pcb.id.toString()]);
                        setActiveTab('reworks'); 
                    }}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '8px', 
                        background: 'transparent', 
                        color: 'var(--text)', 
                        border: '1px solid var(--border-color)', 
                        padding: '10px 16px', 
                        borderRadius: '8px', 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <ExternalLink size={18} /> View Reworks
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); setShowQR(!showQR); }}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '8px', 
                        background: showQR ? 'rgba(99, 102, 241, 0.1)' : 'transparent', 
                        color: showQR ? 'var(--accent)' : 'var(--text)', 
                        border: `1px solid ${showQR ? 'var(--accent)' : 'var(--border-color)'}`, 
                        padding: '10px 16px', 
                        borderRadius: '8px', 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <QrCodeIcon size={18} /> {showQR ? 'Hide QR' : 'QR Code'}
                </button>
            </div>
            
            {showQR && (
                <div style={{ 
                    marginBottom: '16px', 
                    padding: '16px', 
                    background: 'var(--bg-element)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Scan to identify this board</div>
                    {qrDataUrl ? (
                        <div style={{ background: '#fff', padding: '8px', borderRadius: '8px' }}>
                            <img src={qrDataUrl} alt={`QR Code for ${pcb.board_number}`} style={{ display: 'block' }} />
                        </div>
                    ) : (
                        <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Generating...</div>
                    )}
                </div>
            )}
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
