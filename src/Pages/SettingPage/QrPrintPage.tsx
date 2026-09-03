import { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, Printer, LayoutTemplate } from 'lucide-react';
import { QrCodeSettingCard } from './QrCodeSettingCard';
import { useAppState } from '../../store/useAppState';
import { usePcbStore } from '../../store/clientDataBase/usePcbStore';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import { resolveQrUrl } from '../../components/UrlManager/qrHelper';
import './QrPrintPage.css';

interface QrPrintPageProps {
    onBack: () => void;
}

export function QrPrintPage({ onBack }: QrPrintPageProps) {
    const pcbs = usePcbStore(state => state.pcbs);
    const projects = useProjectStore(state => state.projects);
    const { qrCodeUrlType, qrCodeBaseUrlType, qrCodeCustomBaseUrl, qrCodeErrorCorrection, qrCodeMode } = useAppState();

    const [selectedProject, setSelectedProject] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const [targetBoard, setTargetBoard] = useState('');
    const [includeBoardName, setIncludeBoardName] = useState(true);
    const [customMessage, setCustomMessage] = useState('Rework Tracker');
    const [labelSize, setLabelSize] = useState<'05' | '10'>('10');
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    // Compute filtered PCBs
    const filteredPcbs = useMemo(() => {
        return pcbs.filter(pcb => {
            if (selectedProject && pcb.project !== selectedProject) return false;
            if (startDate || endDate) {
                const pcbDate = pcb.created_at ? new Date(pcb.created_at) : null;
                if (!pcbDate) return false; // If filtering by date, exclude PCBs without one
                
                // Set pcbDate time to start of day for accurate comparison
                pcbDate.setHours(0, 0, 0, 0);

                if (startDate) {
                    const sDate = new Date(startDate);
                    sDate.setHours(0, 0, 0, 0);
                    if (pcbDate < sDate) return false;
                }
                if (endDate) {
                    const eDate = new Date(endDate);
                    eDate.setHours(0, 0, 0, 0);
                    if (pcbDate > eDate) return false;
                }
            }
            return true;
        });
    }, [pcbs, selectedProject, startDate, endDate]);

    // Auto-select first board if current is invalid
    useEffect(() => {
        if (filteredPcbs.length > 0) {
            if (!targetBoard || !filteredPcbs.some(p => p.board_number === targetBoard)) {
                setTargetBoard(filteredPcbs[0].board_number);
            }
        } else {
            setTargetBoard('');
        }
    }, [filteredPcbs, targetBoard]);

    // Generate URL based on settings
    const matchingPcb = pcbs.find(p => p.board_number === targetBoard);
    const shortCode = matchingPcb?.short_code;

    const { url } = resolveQrUrl(targetBoard, shortCode, {
        urlType: qrCodeUrlType,
        baseUrlType: qrCodeBaseUrlType,
        customBaseUrl: qrCodeCustomBaseUrl,
        errorCorrectionLevel: qrCodeErrorCorrection || 'L',
        qrCodeMode: qrCodeMode
    });

    useEffect(() => {
        if (!url) return;
        let isMounted = true;
        
        const generateQR = async () => {
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    margin: 1, // Minimize margin for small labels
                    width: labelSize === '05' ? 150 : 300,
                    errorCorrectionLevel: qrCodeErrorCorrection || 'L',
                    color: {
                        dark: '#000000',
                        light: '#ffffff'
                    }
                });
                if (isMounted) {
                    setQrDataUrl(dataUrl);
                }
            } catch (err) {
                console.error('Failed to generate QR code for print:', err);
            }
        };

        generateQR();

        return () => { isMounted = false; };
    }, [url, labelSize, qrCodeErrorCorrection]);

    const handlePrint = () => {
        window.print();
    };

    // Calculate how many labels fit based on size
    const numLabels = labelSize === '05' ? 48 : 12;
    const labelsArray = Array.from({ length: numLabels });

    return (
        <div className="qr-print-studio-wrapper">
            <div className="qr-print-studio-header">
                <button className="back-button" onClick={onBack}>
                    <ArrowLeft size={20} />
                </button>
                <h1>QR Print Studio</h1>
            </div>

            {/* Embedded Settings from before */}
            <QrCodeSettingCard />

            <div className="settings-main-card">
                <div className="settings-card-label" style={{ marginBottom: '16px' }}>
                    <LayoutTemplate size={18} color="var(--accent)" />
                    <span>Label Layout & Content</span>
                </div>

                <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
                    {/* Column 1: Board Filters & Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
                                Filter by Project
                            </label>
                            <select
                                className="auth-input"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                            >
                                <option value="">All Projects</option>
                                {projects.map(p => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)' }}>
                                    Filter by Date Range
                                </label>
                                {(startDate || endDate) && (
                                    <button 
                                        type="button"
                                        onClick={() => { setStartDate(''); setEndDate(''); }}
                                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, padding: 0 }}
                                    >
                                        Clear Dates
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="date"
                                        className="auth-input"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        title="Start Date"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="date"
                                        className="auth-input"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        title="End Date"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
                                Target Board for Labels
                            </label>
                            <select
                                className="auth-input"
                                value={targetBoard}
                                onChange={(e) => setTargetBoard(e.target.value)}
                                disabled={filteredPcbs.length === 0}
                            >
                                {filteredPcbs.length === 0 ? (
                                    <option value="">No boards found...</option>
                                ) : (
                                    filteredPcbs.map(p => (
                                        <option key={p.board_number} value={p.board_number}>{p.board_number}</option>
                                    ))
                                )}
                            </select>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {filteredPcbs.length} board(s) match these filters.
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Layout & Extras */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
                                Custom Message
                            </label>
                            <input
                                type="text"
                                className="auth-input"
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                                placeholder="e.g. Rework Tracker"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
                                Label Size (3" x 4" Sheet)
                            </label>
                            <select
                                className="auth-input"
                                value={labelSize}
                                onChange={(e) => setLabelSize(e.target.value as '05' | '10')}
                            >
                                <option value="10">1" x 1" (12 labels per sheet)</option>
                                <option value="05">0.5" x 0.5" (48 labels per sheet)</option>
                            </select>
                        </div>

                        <div style={{ marginTop: 'auto', marginBottom: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                                <input
                                    type="checkbox"
                                    checked={includeBoardName}
                                    onChange={(e) => setIncludeBoardName(e.target.checked)}
                                    disabled={!targetBoard}
                                />
                                Include Board Name ({targetBoard || '...'}) on label
                            </label>
                        </div>
                    </div>
                </div>

                <div className="print-action-bar">
                    <button className="btn-print-labels" onClick={handlePrint} disabled={!qrDataUrl}>
                        <Printer size={18} />
                        Print Labels
                    </button>
                </div>
            </div>

            {/* The Print-Only Grid */}
            <div className="print-only-wrapper">
                <div className={`print-only-container size-${labelSize}`}>
                    {labelsArray.map((_, index) => (
                        <div key={index} className="print-label-cell">
                            {customMessage && <div className="print-label-text">{customMessage}</div>}
                            {qrDataUrl && (
                                <img 
                                    src={qrDataUrl} 
                                    alt="QR Code" 
                                    style={{ 
                                        width: '100%', 
                                        height: 'auto', 
                                        maxWidth: labelSize === '05' ? '0.35in' : '0.7in' 
                                    }} 
                                />
                            )}
                            {includeBoardName && targetBoard && <div className="print-label-text">{targetBoard}</div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
