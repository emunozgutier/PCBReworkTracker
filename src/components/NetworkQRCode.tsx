import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export function NetworkQRCode() {
    const [svg, setSvg] = useState<string>('');
    
    // These constants are defined in vite.config.ts
    const localIp = typeof __LOCAL_IP__ !== 'undefined' ? __LOCAL_IP__ : window.location.hostname;
    const port = typeof __PORT__ !== 'undefined' ? __PORT__ : window.location.port;
    const url = `http://${localIp}:${port}`;

    useEffect(() => {
        QRCode.toString(url, {
            type: 'svg',
            margin: 0,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        }, (err, string) => {
            if (err) {
                console.error('Failed to generate QR code:', err);
                return;
            }
            setSvg(string);
        });
    }, [url]);

    return (
        <div className="network-qr-container">
            <div className="qr-wrapper" dangerouslySetInnerHTML={{ __html: svg }} />
            <div className="qr-info">
                <p className="qr-label">Scan to view on mobile</p>
                <code className="qr-url">{url}</code>
            </div>
        </div>
    );
}
