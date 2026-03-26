import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, X } from 'lucide-react';
import { useStore } from '../store/useStore';

export function NetworkQRCode() {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [isVisible, setIsVisible] = useState(false);
    const { activeTab } = useStore();
    
    // These constants are defined in vite.config.ts
    // Use fallbacks for development if constants are not yet defined
    const localIp = typeof __LOCAL_IP__ !== 'undefined' ? __LOCAL_IP__ : window.location.hostname;
    const port = typeof __PORT__ !== 'undefined' ? __PORT__ : window.location.port;
    const url = `http://${localIp}:${port}/${activeTab}`;

    useEffect(() => {
        const generateQR = async () => {
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    margin: 2,
                    width: 120,
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

    if (!isVisible) {
        return (
            <button 
                className="qr-toggle-button" 
                onClick={() => setIsVisible(true)}
                title="Show Network QR Code"
            >
                <QrCode size={24} />
            </button>
        );
    }

    return (
        <div className="network-qr-container">
            <button 
                className="qr-close-button" 
                onClick={() => setIsVisible(false)}
                title="Hide QR Code"
            >
                <X size={16} />
            </button>
            <div className="qr-wrapper">
                {qrDataUrl && <img src={qrDataUrl} alt="Network QR Code" width="120" height="120" />}
            </div>
            <div className="qr-info">
                <p className="qr-label">Scan to view on mobile</p>
                <code className="qr-url" style={{ display: 'block', whiteSpace: 'nowrap' }}>
                    <div>http://{localIp}:{port}</div>
                    <div style={{ color: '#818cf8', fontWeight: 'bold' }}>/{activeTab}</div>
                </code>
            </div>
        </div>
    );
}
