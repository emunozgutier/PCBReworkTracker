import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';

export function NetworkQRCode() {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const { qrModalBoard, setQrModalBoard } = useStore();
    
    let url = '';
    let displayDomain = '';
    let displayPath = '';

    if (qrModalBoard) {
        if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
            const base = import.meta.env.BASE_URL || '/';
            const cleanBase = base.endsWith('/') ? base : base + '/';
            displayDomain = window.location.origin;
            displayPath = `/${cleanBase}pcbs/${encodeURIComponent(qrModalBoard)}/view`.replace(/\/\//g, '/');
            url = displayDomain + displayPath;
        } else {
            const localIp = typeof __LOCAL_IP__ !== 'undefined' ? __LOCAL_IP__ : window.location.hostname;
            const port = typeof __PORT__ !== 'undefined' ? __PORT__ : window.location.port;
            const portSuffix = port ? `:${port}` : '';
            displayDomain = `http://${localIp}${portSuffix}`;
            displayPath = `/pcbs/${encodeURIComponent(qrModalBoard)}/view`;
            url = displayDomain + displayPath;
        }
    }

    useEffect(() => {
        if (!url) return;
        const generateQR = async () => {
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    margin: 2,
                    width: 250,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                setQrDataUrl(dataUrl);
            } catch (err) {
                console.error('Failed to generate QR code:', err);
            }
        };

        generateQR();
    }, [url]);

    if (!qrModalBoard) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '24px'
        }} onClick={() => setQrModalBoard(null)}>
            <div className="item-card" style={{
                cursor: 'default',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                maxWidth: '90%',
                width: '380px',
            }} onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => setQrModalBoard(null)}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'rgba(255,255,255,0.1)',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#fff';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    }}
                    title="Close"
                >
                    <X size={20} />
                </button>
                <h3 style={{ margin: '0 0 16px 0', color: 'var(--text)', fontSize: '1.25rem', fontWeight: 600 }}>PCB Board Identity</h3>
                <div style={{ 
                    backgroundColor: '#fff', 
                    padding: '16px', 
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    {qrDataUrl && <img src={qrDataUrl} alt="PCB QR Code" style={{ display: 'block', width: '250px', height: '250px' }} />}
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>{qrModalBoard}</div>
                    <code style={{ 
                        display: 'block', 
                        fontSize: '0.8rem', 
                        color: 'var(--text-muted)', 
                        background: 'rgba(0,0,0,0.2)', 
                        padding: '12px 8px',
                        borderRadius: '6px',
                        lineHeight: '1.4'
                    }}>
                        <div style={{ wordBreak: 'break-all' }}>{displayDomain}</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '2px' }}>{displayPath}</div>
                    </code>
                </div>
            </div>
        </div>
    );
}
