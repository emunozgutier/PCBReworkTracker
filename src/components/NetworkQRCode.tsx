import QRCode from "react-qr-code";

export function NetworkQRCode() {
    // These constants are defined in vite.config.ts
    const localIp = typeof __LOCAL_IP__ !== 'undefined' ? __LOCAL_IP__ : window.location.hostname;
    const port = typeof __PORT__ !== 'undefined' ? __PORT__ : window.location.port;
    const url = `http://${localIp}:${port}`;

    return (
        <div className="network-qr-container">
            <div className="qr-wrapper">
                <QRCode 
                    value={url} 
                    size={120}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                />
            </div>
            <div className="qr-info">
                <p className="qr-label">Scan to view on mobile</p>
                <code className="qr-url">{url}</code>
            </div>
        </div>
    );
}
