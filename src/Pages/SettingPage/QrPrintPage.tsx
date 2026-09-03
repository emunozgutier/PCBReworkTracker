import { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, Printer, LayoutTemplate } from 'lucide-react';
import { QrCodeSettingCard } from './QrCodeSettingCard';
import { useAppState } from '../../store/useAppState';
import { usePcbStore, type Pcb } from '../../store/clientDataBase/usePcbStore';
import { useProjectStore } from '../../store/clientDataBase/useProjectStore';
import { resolveQrUrl, encodeBase36ShortCode } from '../../components/UrlManager/qrHelper';
import '../ViewPages/SettingsView.css';
import './QrPrintPage.css';

interface QrPrintPageProps {
    onBack: () => void;
}

function PrintLabelCell({ pcb, includeBoardName, customMessage, labelSize }: { pcb: Pcb; includeBoardName: boolean; customMessage: string; labelSize: string }) {
    const { qrCodeUrlType, qrCodeBaseUrlType, qrCodeCustomBaseUrl, qrCodeErrorCorrection, qrCodeMode } = useAppState();
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    const projectKey = (pcb as any).project_key || pcb.project || (pcb.board_number.includes('-') ? pcb.board_number.split('-')[0] : 'PCB');
    const effectiveShortCode = pcb.short_code && pcb.short_code.length >= 5
        ? pcb.short_code
        : encodeBase36ShortCode(projectKey, pcb.board_number);

    const { url } = resolveQrUrl(pcb.board_number, effectiveShortCode, {
        urlType: qrCodeUrlType,
        baseUrlType: qrCodeBaseUrlType,
        customBaseUrl: qrCodeCustomBaseUrl,
        errorCorrectionLevel: qrCodeErrorCorrection || 'L',
        qrCodeMode: qrCodeMode
    });

    let width = 300;
    if (labelSize === '05') { width = 150; }
    if (labelSize === '075') { width = 225; }
    if (labelSize === '10') { width = 300; }
    if (labelSize === '15') { width = 450; }
    if (labelSize === '20') { width = 600; }
    if (labelSize === '30') { width = 900; }

    useEffect(() => {
        if (!url) return;
        let isMounted = true;
        
        const generateQR = async () => {
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    margin: 1, // Minimize margin for small labels
                    width: width,
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

    return (
        <div className="print-label-cell">
            {customMessage && <div className="print-label-text">{customMessage}</div>}
            {qrDataUrl && (
                <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2px 0' }}>
                    <img 
                        src={qrDataUrl} 
                        alt={`QR Code for ${pcb.board_number}`} 
                        style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            objectFit: 'contain' 
                        }} 
                    />
                </div>
            )}
            {includeBoardName && <div className="print-label-text">{pcb.board_number}</div>}
        </div>
    );
}

export function QrPrintPage({ onBack }: QrPrintPageProps) {
    const pcbs = usePcbStore(state => state.pcbs);
    const projects = useProjectStore(state => state.projects);

    const [selectedProject, setSelectedProject] = useState<string>('');
    const [includeBoardName, setIncludeBoardName] = useState(true);
    const [customMessage, setCustomMessage] = useState('Rework Tracker');
    const [labelSize, setLabelSize] = useState<'05' | '075' | '10' | '15' | '20' | '30'>('10');
    const [sheetSize, setSheetSize] = useState<'3x4' | '4x6'>('3x4');
    const [sheetOrientation, setSheetOrientation] = useState<'portrait' | 'landscape'>('portrait');

    // Compute filtered PCBs based only on selected project
    const filteredPcbs = useMemo(() => {
        return pcbs.filter(pcb => {
            if (selectedProject && pcb.project !== selectedProject) return false;
            return true;
        });
    }, [pcbs, selectedProject]);

    const handlePrint = () => {
        window.print();
    };

    // Calculate grid layout
    const sheetW = sheetSize === '3x4' ? 3 : 4;
    const sheetH = sheetSize === '3x4' ? 4 : 6;
    const widthIn = sheetOrientation === 'portrait' ? sheetW : sheetH;
    const heightIn = sheetOrientation === 'portrait' ? sheetH : sheetW;

    const qrSizeIn = labelSize === '05' ? 0.5 : labelSize === '075' ? 0.75 : labelSize === '10' ? 1.0 : labelSize === '15' ? 1.5 : labelSize === '20' ? 2.0 : 3.0;

    const cols = Math.floor(widthIn / qrSizeIn);
    const rows = Math.floor(heightIn / qrSizeIn);
    const labelsPerPage = Math.max(1, cols * rows);

    const pages = useMemo(() => {
        const result = [];
        for (let i = 0; i < filteredPcbs.length; i += labelsPerPage) {
            result.push(filteredPcbs.slice(i, i + labelsPerPage));
        }
        return result;
    }, [filteredPcbs, labelsPerPage]);

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
                                Label Sheet Size
                            </label>
                            <select
                                className="auth-input"
                                value={sheetSize}
                                onChange={(e) => setSheetSize(e.target.value as '3x4' | '4x6')}
                            >
                                <option value="3x4">3" x 4" (Standard)</option>
                                <option value="4x6">4" x 6" (Shipping)</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
                                Sheet Orientation
                            </label>
                            <select
                                className="auth-input"
                                value={sheetOrientation}
                                onChange={(e) => setSheetOrientation(e.target.value as 'portrait' | 'landscape')}
                            >
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                            </select>
                        </div>
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
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                Printing {filteredPcbs.length} boards ({labelsPerPage} labels per {widthIn}"x{heightIn}" sheet).
                            </div>
                        </div>

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
                    </div>

                    {/* Column 2: Layout & Extras */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', marginBottom: '6px' }}>
                                QR Cell Size (Inches)
                            </label>
                            <select
                                className="auth-input"
                                value={labelSize}
                                onChange={(e) => setLabelSize(e.target.value as any)}
                            >
                                <option value="05">0.5 x 0.5 inches</option>
                                <option value="075">0.75 x 0.75 inches</option>
                                <option value="10">1.0 x 1.0 inches</option>
                                <option value="15">1.5 x 1.5 inches</option>
                                <option value="20">2.0 x 2.0 inches</option>
                                <option value="30">3.0 x 3.0 inches</option>
                            </select>
                        </div>

                        <div style={{ marginTop: 'auto', marginBottom: '8px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-h)' }}>
                                <input
                                    type="checkbox"
                                    checked={includeBoardName}
                                    onChange={(e) => setIncludeBoardName(e.target.checked)}
                                />
                                Include Board Name on label
                            </label>
                        </div>
                    </div>
                </div>

                <div className="print-action-bar">
                    <button className="btn-print-labels" onClick={handlePrint} disabled={filteredPcbs.length === 0}>
                        <Printer size={18} />
                        Print All {filteredPcbs.length} Labels
                    </button>
                </div>
            </div>

            {/* The Print-Only Grid */}
            <div className="print-only-wrapper">
                <style>{`
                    @media print {
                        @page {
                            size: ${widthIn}in ${heightIn}in !important;
                            margin: 0 !important;
                        }
                    }
                `}</style>
                {pages.map((page, pageIndex) => (
                    <div key={pageIndex} className={`print-only-container size-${labelSize}`} style={{ 
                        width: `${widthIn}in`, 
                        height: `${heightIn}in`,
                        gridTemplateColumns: `repeat(${cols}, ${qrSizeIn}in)`,
                        gridTemplateRows: `repeat(${rows}, ${qrSizeIn}in)`,
                        pageBreakAfter: 'always' 
                    }}>
                        {page.map((pcb) => (
                            <PrintLabelCell 
                                key={pcb.id} 
                                pcb={pcb}
                                includeBoardName={includeBoardName}
                                customMessage={customMessage}
                                labelSize={labelSize}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
