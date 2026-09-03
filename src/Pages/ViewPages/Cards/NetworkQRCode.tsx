import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Copy, Check, ExternalLink, Zap, Layers, Info } from 'lucide-react';
import { COLORS } from '../../../store/useStyles';
import { useAppState } from '../../../store/useAppState';
import { usePcbStore } from '../../../store/clientDataBase/usePcbStore';
import { Popup } from '../../../components/Popup';
import { resolveQrUrl, getQrCapacity, getQrGridSize, encodeBase36ShortCode, type QrErrorCorrectionLevel } from '../../../components/UrlManager/qrHelper';

export function NetworkQRCode() {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');
    const [qrInfo, setQrInfo] = useState<{ version: number; size: number } | null>(null);
    const [copied, setCopied] = useState(false);

    const {
        qrModalBoard,
        setQrModalBoard,
        qrCodeUrlType,
        qrCodeBaseUrlType,
        qrCodeCustomBaseUrl,
        qrCodeErrorCorrection,
        qrCodeMode,
        setQrCodeUrlType
    } = useAppState();

    const pcbs = usePcbStore(state => state.pcbs);
    const matchingPcb = pcbs.find(p => p.board_number === qrModalBoard);
    const projectKey = (matchingPcb as any)?.project_key || matchingPcb?.project || (qrModalBoard?.includes('-') ? qrModalBoard.split('-')[0] : 'PCB');
    const shortCode = matchingPcb?.short_code && matchingPcb.short_code.length >= 5
        ? matchingPcb.short_code
        : encodeBase36ShortCode(projectKey, qrModalBoard || '');

    const activeLevel: QrErrorCorrectionLevel = qrCodeErrorCorrection || 'L';

    // Resolve URL with current settings
    const { url, domain, path, isCompressed, isCustomBase } = resolveQrUrl(
        qrModalBoard || '',
        shortCode,
        {
            urlType: qrCodeUrlType,
            baseUrlType: qrCodeBaseUrlType,
            customBaseUrl: qrCodeCustomBaseUrl,
            errorCorrectionLevel: activeLevel,
            qrCodeMode: qrCodeMode
        }
    );

    useEffect(() => {
        if (!url || !qrModalBoard) return;

        let isMounted = true;
        const generateQR = async () => {
            try {
                const info = QRCode.create(url, { errorCorrectionLevel: activeLevel });
                if (isMounted) {
                    setQrInfo({ version: info.version, size: info.modules.size });
                }

                const dataUrl = await QRCode.toDataURL(url, {
                    margin: 2,
                    width: 400, // High resolution
                    errorCorrectionLevel: activeLevel,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                if (isMounted) {
                    setQrDataUrl(dataUrl);
                }
            } catch (err) {
                console.error('Failed to generate QR code:', err);
            }
        };

        generateQR();

        return () => {
            isMounted = false;
        };
    }, [url, qrModalBoard, activeLevel]);

    if (!qrModalBoard) {
        return null;
    }

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const currentVersion = qrInfo?.version || 1;
    const currentGridSize = qrInfo?.size || getQrGridSize(currentVersion);
    const maxCapacity = getQrCapacity(currentVersion, activeLevel, qrCodeMode);
    const urlLength = url.length;

    return (
        <Popup
            isOpen={!!qrModalBoard}
            onClose={() => setQrModalBoard(null)}
            title="PCB Board Identity QR Code"
            maxWidth="420px"
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {/* Format toggle pills */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '3px',
                    borderRadius: '10px',
                    border: '1px solid var(--border)',
                    marginBottom: '16px',
                    width: '100%',
                    boxSizing: 'border-box'
                }}>
                    <button
                        type="button"
                        onClick={() => setQrCodeUrlType('full')}
                        style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: qrCodeUrlType === 'full' ? 700 : 500,
                            background: qrCodeUrlType === 'full' ? 'var(--accent)' : 'transparent',
                            color: qrCodeUrlType === 'full' ? '#ffffff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <Layers size={13} />
                        <span>Full URL</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setQrCodeUrlType('compressed')}
                        style={{
                            flex: 1,
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '0.78rem',
                            fontWeight: qrCodeUrlType === 'compressed' ? 700 : 500,
                            background: qrCodeUrlType === 'compressed' ? 'var(--accent)' : 'transparent',
                            color: qrCodeUrlType === 'compressed' ? '#ffffff' : 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        <Zap size={13} />
                        <span>Compressed</span>
                        {shortCode && (
                            <span style={{
                                fontSize: '0.7rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                background: qrCodeUrlType === 'compressed' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)',
                                fontFamily: 'var(--mono)'
                            }}>
                                {shortCode}
                            </span>
                        )}
                    </button>
                </div>

                {/* QR Code Canvas Frame */}
                <div style={{
                    backgroundColor: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                }}>
                    {qrDataUrl && (
                        <img
                            src={qrDataUrl}
                            alt={`QR Code for ${qrModalBoard}`}
                            title={`QR Version ${currentVersion} (${currentGridSize}x${currentGridSize}) · Level ${activeLevel}`}
                            style={{ display: 'block', width: '240px', height: '240px' }}
                        />
                    )}
                </div>

                {/* Information and link area */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--accent)' }}>
                            {qrModalBoard}
                        </div>
                        {isCompressed && shortCode && (
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                fontWeight: 700,
                                fontFamily: 'var(--mono)'
                            }}>
                                Code: {shortCode}
                            </span>
                        )}
                        {isCustomBase && (
                            <span style={{
                                fontSize: '0.7rem',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                background: 'rgba(245, 158, 11, 0.15)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                fontWeight: 600
                            }}>
                                Custom Domain
                            </span>
                        )}
                    </div>

                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'block',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                            background: 'rgba(0,0,0,0.25)',
                            padding: '10px 10px',
                            borderRadius: '8px',
                            lineHeight: '1.4',
                            textDecoration: 'none',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)';
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.25)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                        }}
                    >
                        <div style={{ wordBreak: 'break-all' }}>{domain}</div>
                        <div style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '2px' }}>
                            {path}
                        </div>
                        <div style={{
                            marginTop: '6px',
                            fontSize: '0.7rem',
                            color: COLORS.purple,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                        }}>
                            <span>Open PCB View</span>
                            <ExternalLink size={11} />
                        </div>
                    </a>

                    {/* Metadata pill & Copy Button */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '12px',
                        padding: '0 4px',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <button
                            type="button"
                            onClick={handleCopy}
                            style={{
                                background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                                border: `1px solid ${copied ? '#10b981' : 'var(--border)'}`,
                                color: copied ? '#10b981' : 'var(--text)',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {copied ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                        </button>

                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <span style={{
                                fontWeight: 600,
                                color: currentGridSize === 21 ? '#10b981' : 'var(--accent)'
                            }}>
                                v{currentVersion} ({currentGridSize}×{currentGridSize})
                            </span>
                            <span>·</span>
                            <span>Level {activeLevel}</span>
                            <span>·</span>
                            <span>{urlLength}/{maxCapacity} chars</span>
                        </div>
                    </div>

                    {/* Minimum size notice */}
                    <div style={{
                        marginTop: '10px',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                    }}>
                        <Info size={12} color="var(--accent)" />
                        <span>21×21 is the smallest possible QR code size</span>
                    </div>
                </div>
            </div>
        </Popup>
    );
}
