import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { COLORS } from '../../../store/useStyles';
import { useAppState } from '../../../store/useAppState';
import { Popup } from '../../../components/Popup';

export function NetworkQRCode() {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [qrInfo, setQrInfo] = useState<{ version: number, size: number } | null>(null);
    const { qrModalBoard, setQrModalBoard } = useAppState();
    
    const availableHosts = typeof __LOCAL_IPS__ !== 'undefined' ? __LOCAL_IPS__ : [window.location.hostname];
    const defaultHost = availableHosts.includes('192.168.56.1') ? '192.168.56.1' : availableHosts[0];
    const [selectedHost, setSelectedHost] = useState(() => {
        return localStorage.getItem('qr_selected_host') || defaultHost;
    });

    const handleHostChange = (host: string) => {
        setSelectedHost(host);
        localStorage.setItem('qr_selected_host', host);
    };

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
            const port = typeof __PORT__ !== 'undefined' ? __PORT__ : window.location.port;
            const portSuffix = port ? `:${port}` : '';
            displayDomain = `http://${selectedHost}${portSuffix}`;
            displayPath = `/pcbs/${encodeURIComponent(qrModalBoard)}/view`;
            url = displayDomain + displayPath;
        }
    }

    useEffect(() => {
        if (!url) return;
        const generateQR = async () => {
            try {
                const info = QRCode.create(url, { errorCorrectionLevel: 'L' });
                setQrInfo({ version: info.version, size: info.modules.size });

                const dataUrl = await QRCode.toDataURL(url, {
                    margin: 2,
                    width: 400, // Generate high resolution
                    errorCorrectionLevel: 'L', // Lowest error correction for simplest look
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
        <Popup 
            isOpen={!!qrModalBoard} 
            onClose={() => setQrModalBoard(null)} 
            title="PCB Board Identity"
            maxWidth="380px"
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <div style={{ width: '100%', marginBottom: '16px' }}>
                    <label htmlFor="qr-host-select" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: 600 }}>Target Base IP/Host:</label>
                    <select
                        id="qr-host-select"
                        value={selectedHost}
                        onChange={(e) => handleHostChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            color: 'var(--text)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {availableHosts.map(host => (
                            <option key={host} value={host} style={{ background: '#1e293b' }}>
                                {host === 'localhost' ? 'localhost (Local PC)' : host === '192.168.56.1' ? '192.168.56.1 (PC IP Address)' : host}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div style={{ 
                    backgroundColor: '#fff', 
                    padding: '16px', 
                    borderRadius: '12px',
                    marginBottom: '20px'
                }}>
                    {qrDataUrl && <img 
                        src={qrDataUrl} 
                        alt="PCB QR Code" 
                        title={qrInfo ? `QR Version: ${qrInfo.version} (${qrInfo.size}x${qrInfo.size} modules)` : undefined}
                        style={{ display: 'block', width: '250px', height: '250px' }} 
                    />}
                </div>
                
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>{qrModalBoard}</div>
                    <a 
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                            display: 'block', 
                            fontSize: '0.8rem', 
                            color: 'var(--text-muted)', 
                            background: 'rgba(0,0,0,0.2)', 
                            padding: '12px 8px',
                            borderRadius: '8px',
                            lineHeight: '1.4',
                            textDecoration: 'none',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                    >
                        <div style={{ wordBreak: 'break-all' }}>{displayDomain}</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '2px', textDecoration: 'underline text-underline-offset-2' }}>{displayPath}</div>
                        <div style={{ marginTop: '6px', fontSize: '0.7rem', color: COLORS.purple, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Click to Open PCB Page
                        </div>
                    </a>
                </div>
            </div>
        </Popup>
    );
}

