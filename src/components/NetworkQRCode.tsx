import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function NetworkQRCode() {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    
    // These constants are defined in vite.config.ts
    // Use fallbacks for development if constants are not yet defined
    const localIp = typeof __LOCAL_IP__ !== 'undefined' ? __LOCAL_IP__ : window.location.hostname;
    const port = typeof __PORT__ !== 'undefined' ? __PORT__ : window.location.port;
    const url = `http://${localIp}:${port}`;

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

    return (
        <div className="network-qr-container">
            <div className="qr-wrapper">
                {qrDataUrl && <img src={qrDataUrl} alt="Network QR Code" width="120" height="120" />}
            </div>
            <div className="qr-info">
                <p className="qr-label">Scan to view on mobile</p>
                <code className="qr-url">{url}</code>
            </div>
        </div>
    );
}
