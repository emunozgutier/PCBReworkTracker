import { useState, useEffect } from 'react';
import { QrCode, Globe, Zap, ExternalLink, RefreshCw, Shield, Info } from 'lucide-react';
import QRCode from 'qrcode';
import { useAppState } from '../../store/useAppState';
import { usePcbStore } from '../../store/clientDataBase/usePcbStore';
import {
    getDefaultBaseUrl,
    resolveQrUrl,
    QR_ERROR_CORRECTION_LEVELS,
    getQrCapacity,
    getQrGridSize,
    type QrErrorCorrectionLevel
} from '../../components/UrlManager/qrHelper';

export function QrCodeSettingCard() {
    const {
        qrCodeUrlType,
        qrCodeBaseUrlType,
        qrCodeCustomBaseUrl,
        qrCodeErrorCorrection,
        setQrCodeUrlType,
        setQrCodeBaseUrlType,
        setQrCodeCustomBaseUrl,
        setQrCodeErrorCorrection
    } = useAppState();

    const pcbs = usePcbStore(state => state.pcbs);

    // Test preview inputs
    const [testBoardName, setTestBoardName] = useState('MAP-0001');
    const [previewQrUrl, setPreviewQrUrl] = useState('');
    const [previewQrDataUrl, setPreviewQrDataUrl] = useState('');
    const [previewInfo, setPreviewInfo] = useState<{ version: number; size: number } | null>(null);

    // Find test PCB's short code if available or generate sample
    const matchingPcb = pcbs.find(p => p.board_number.toLowerCase() === testBoardName.trim().toLowerCase());
    const previewShortCode = matchingPcb?.short_code || 'MQ9';

    const defaultOrigin = getDefaultBaseUrl();

    // Compute preview URL
    const resolved = resolveQrUrl(
        testBoardName.trim() || 'MAP-0001',
        previewShortCode,
        {
            urlType: qrCodeUrlType,
            baseUrlType: qrCodeBaseUrlType,
            customBaseUrl: qrCodeCustomBaseUrl,
            errorCorrectionLevel: qrCodeErrorCorrection
        }
    );

    const activeLevel: QrErrorCorrectionLevel = qrCodeErrorCorrection || 'L';

    useEffect(() => {
        setPreviewQrUrl(resolved.url);

        let isMounted = true;
        const gen = async () => {
            try {
                const info = QRCode.create(resolved.url, { errorCorrectionLevel: activeLevel });
                if (isMounted) setPreviewInfo({ version: info.version, size: info.modules.size });

                const dataUrl = await QRCode.toDataURL(resolved.url, {
                    margin: 2,
                    width: 260,
                    errorCorrectionLevel: activeLevel,
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                if (isMounted) setPreviewQrDataUrl(dataUrl);
            } catch (err) {
                console.error('Failed to generate preview QR code:', err);
            }
        };
        gen();

        return () => {
            isMounted = false;
        };
    }, [resolved.url, activeLevel]);

    const urlLength = previewQrUrl.length;
    const currentVersion = previewInfo?.version || 1;
    const currentGridSize = previewInfo?.size || getQrGridSize(currentVersion);
    const maxCapacity = getQrCapacity(currentVersion, activeLevel);
    const isSmallestGrid = currentGridSize === 21;
    const usagePercent = Math.min(100, Math.round((urlLength / maxCapacity) * 100));

    // Capacity for smallest 21x21 at selected level
    const smallest21Capacity = getQrCapacity(1, activeLevel);

    return (
        <div className="settings-main-card">
            <div className="settings-card-label">
                <QrCode size={18} color="var(--accent)" />
                <span>QR Code URL & Error Correction Settings</span>
            </div>

            <p className="settings-description">
                Customize how QR codes are generated across the PCB Rework Tracker. Configure custom domains, full vs compressed URLs, and recovery levels for harsh workshop environments.
            </p>

            {/* Section 1: Base URL / Domain */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-h)',
                    marginBottom: '12px'
                }}>
                    <Globe size={16} color="var(--accent)" />
                    <span>1. Base Website / Domain Address</span>
                </div>

                <div className="settings-options-grid">
                    {/* Option 1: Current Website */}
                    <div
                        className={`setting-choice-card ${qrCodeBaseUrlType === 'current' ? 'selected' : ''}`}
                        onClick={() => setQrCodeBaseUrlType('current')}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">Default Website</span>
                            <div className="choice-radio">
                                {qrCodeBaseUrlType === 'current' && (
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                )}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Automatically uses the address of this current session.
                        </div>

                        <div className="choice-example-badge">
                            <span className="example-tag">Active Host</span>
                            <span className="example-code" style={{ fontSize: '0.85rem' }}>
                                {defaultOrigin}
                            </span>
                        </div>
                    </div>

                    {/* Option 2: Custom Base URL */}
                    <div
                        className={`setting-choice-card ${qrCodeBaseUrlType === 'custom' ? 'selected' : ''}`}
                        onClick={() => setQrCodeBaseUrlType('custom')}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">Custom Domain / IP</span>
                            <div className="choice-radio">
                                {qrCodeBaseUrlType === 'custom' && (
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                )}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Use a custom public domain or intranet URL prefix.
                        </div>

                        <div
                            style={{ marginTop: 'auto' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (qrCodeBaseUrlType !== 'custom') {
                                    setQrCodeBaseUrlType('custom');
                                }
                            }}
                        >
                            <input
                                type="text"
                                value={qrCodeCustomBaseUrl}
                                onChange={(e) => {
                                    setQrCodeCustomBaseUrl(e.target.value);
                                    if (qrCodeBaseUrlType !== 'custom') {
                                        setQrCodeBaseUrlType('custom');
                                    }
                                }}
                                placeholder="e.g. https://tracker.corp.internal"
                                className="calculator-input"
                                style={{
                                    fontSize: '0.85rem',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    margin: 0
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 2: URL Format (Full vs Compressed) */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-h)',
                    marginBottom: '12px'
                }}>
                    <Zap size={16} color="var(--accent)" />
                    <span>2. QR Code URL Format</span>
                </div>

                <div className="settings-options-grid">
                    {/* Option A: Full Board URL */}
                    <div
                        className={`setting-choice-card ${qrCodeUrlType === 'full' ? 'selected' : ''}`}
                        onClick={() => setQrCodeUrlType('full')}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">Full Board URL</span>
                            <div className="choice-radio">
                                {qrCodeUrlType === 'full' && (
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                )}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Explicit path containing the exact board name.
                        </div>

                        <div className="choice-example-badge">
                            <span className="example-tag">Path Format</span>
                            <span className="example-code" style={{ fontSize: '0.85rem' }}>
                                /pcbs/<span>{testBoardName || 'MAP-0001'}</span>/view
                            </span>
                        </div>
                    </div>

                    {/* Option B: Compressed Short Code */}
                    <div
                        className={`setting-choice-card ${qrCodeUrlType === 'compressed' ? 'selected' : ''}`}
                        onClick={() => setQrCodeUrlType('compressed')}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">Compressed (3-4 Chars)</span>
                            <div className="choice-radio">
                                {qrCodeUrlType === 'compressed' && (
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                )}
                            </div>
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Ultra-compact code for simpler, faster QR scanning.
                        </div>

                        <div className="choice-example-badge">
                            <span className="example-tag">Path Format</span>
                            <span className="example-code" style={{ fontSize: '0.85rem' }}>
                                /<span>{previewShortCode}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 3: Error Correction / Recovery Level */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--text-h)',
                    marginBottom: '12px'
                }}>
                    <Shield size={16} color="var(--accent)" />
                    <span>3. Error Correction & Damage Recovery Level</span>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '12px'
                }}>
                    {QR_ERROR_CORRECTION_LEVELS.map((item) => {
                        const isSelected = activeLevel === item.level;
                        return (
                            <div
                                key={item.level}
                                className={`setting-choice-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => setQrCodeErrorCorrection(item.level)}
                                style={{ padding: '14px', gap: '8px' }}
                            >
                                <div className="choice-card-top">
                                    <span className="choice-title" style={{ fontSize: '0.95rem' }}>{item.label}</span>
                                    <div className="choice-radio" style={{ width: '18px', height: '18px' }}>
                                        {isSelected && (
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                        )}
                                    </div>
                                </div>

                                <div style={{
                                    display: 'inline-block',
                                    alignSelf: 'flex-start',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    background: isSelected ? 'var(--accent)' : 'rgba(255, 255, 255, 0.08)',
                                    color: '#ffffff'
                                }}>
                                    {item.recoveryPercent} Recovery
                                </div>

                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                                    {item.description}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Live Interactive Preview Box & Capacity Details */}
            <div style={{
                background: 'rgba(2, 6, 23, 0.4)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '18px',
                marginTop: '10px'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-h)' }}>
                            Live QR Code Preview & Capacity Breakdown
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Test Board:</span>
                        <input
                            type="text"
                            value={testBoardName}
                            onChange={(e) => setTestBoardName(e.target.value)}
                            placeholder="e.g. MAP-0001"
                            className="calculator-input"
                            style={{
                                width: '130px',
                                padding: '4px 8px',
                                fontSize: '0.8rem',
                                borderRadius: '6px',
                                margin: 0
                            }}
                        />
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        backgroundColor: '#fff',
                        padding: '10px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}>
                        {previewQrDataUrl ? (
                            <img
                                src={previewQrDataUrl}
                                alt="QR Code Preview"
                                style={{ width: '125px', height: '125px', display: 'block' }}
                            />
                        ) : (
                            <div style={{ width: '125px', height: '125px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <RefreshCw className="spin" size={24} color="#666" />
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: '220px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '6px',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: qrCodeUrlType === 'compressed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                color: qrCodeUrlType === 'compressed' ? '#10b981' : 'var(--accent)',
                                border: `1px solid ${qrCodeUrlType === 'compressed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
                            }}>
                                {qrCodeUrlType === 'compressed' ? '3-4 Char Compressed' : 'Full Board URL'}
                            </span>

                            <span style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#3b82f6',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                                Level {activeLevel}
                            </span>

                            <span style={{
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: isSmallestGrid ? '#10b981' : 'var(--accent)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                border: '1px solid var(--border)'
                            }}>
                                Version {currentVersion} ({currentGridSize}×{currentGridSize})
                            </span>
                        </div>

                        <a
                            href={previewQrUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'block',
                                wordBreak: 'break-all',
                                fontSize: '0.85rem',
                                fontFamily: 'var(--mono)',
                                color: 'var(--accent)',
                                background: 'rgba(0, 0, 0, 0.3)',
                                padding: '10px 12px',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span style={{ color: 'var(--text-muted)' }}>{resolved.domain}</span>
                            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{resolved.path}</span>
                            <ExternalLink size={12} style={{ marginLeft: '6px', verticalAlign: 'middle' }} />
                        </a>
                    </div>
                </div>

                {/* Capacity breakdown banner */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '12px 14px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--text)'
                    }}>
                        <span>
                            {currentGridSize}×{currentGridSize} Grid (Version {currentVersion}) at Level {activeLevel}
                        </span>
                        <span style={{ color: 'var(--accent)' }}>
                            Used {urlLength} of {maxCapacity} characters ({usagePercent}%)
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '8px'
                    }}>
                        <div style={{
                            width: `${usagePercent}%`,
                            height: '100%',
                            backgroundColor: usagePercent > 90 ? '#ef4444' : usagePercent > 70 ? '#f59e0b' : '#10b981',
                            borderRadius: '4px',
                            transition: 'width 0.3s ease, background-color 0.3s ease'
                        }} />
                    </div>

                    <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        lineHeight: '1.4'
                    }}>
                        <Info size={14} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div>
                            <strong>Note:</strong> <strong>21×21 (Version 1) is the smallest possible QR code size.</strong>
                            {isSmallestGrid ? (
                                <span> At Level {activeLevel}, a 21×21 code can hold up to <strong>{smallest21Capacity} characters</strong>. Your URL currently uses <strong>{urlLength} characters</strong> and fits perfectly in the smallest size.</span>
                            ) : (
                                <span> At Level {activeLevel}, a 21×21 code holds up to {smallest21Capacity} characters. Because your URL is {urlLength} characters, it has automatically expanded to <strong>{currentGridSize}×{currentGridSize} (Version {currentVersion})</strong> which holds up to {maxCapacity} characters.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
