import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProjectStore } from './store/clientDataBase/useProjectStore';
import { API_BASE } from './store/serverDataBase/apiBridge';
import { BoardCanvas } from './BoardViewer/canvas';
import { parseEagleXML, parseBinaryFallback } from './BoardViewer/parser';
import type { BoardData } from './BoardViewer/parser';
import { BoardSearch } from './BoardViewer/search';
import { BoardLayers } from './BoardViewer/layers';

interface BoardViewerProps {
    docId: string | number;
    onBack: () => void;
}

export function BoardViewer({ docId, onBack }: BoardViewerProps) {
    const { projects, projectDocs, fetchProjects, fetchDocs } = useProjectStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');
    const [formatType, setFormatType] = useState<'eagle' | 'binary' | null>(null);

    // Board viewer states
    const [visibleLayers, setVisibleLayers] = useState<Set<number>>(new Set([20, 1, 16, 21, 22, 45]));
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<{ type: 'element' | 'net'; name: string } | null>(null);

    // Fetch projects and their docs on mount to ensure we can identify the document
    useEffect(() => {
        setLoading(true);
        const loadMetadata = async () => {
            try {
                if (projects.length === 0) {
                    await fetchProjects();
                }
            } catch (err) {}
        };
        loadMetadata();
    }, [projects.length, fetchProjects]);

    // Once projects are loaded, fetch docs for all projects to locate our docId
    useEffect(() => {
        if (projects.length === 0) return;
        
        const loadDocs = async () => {
            try {
                const promises = projects.map(p => fetchDocs(p.id));
                await Promise.all(promises);
            } catch (err) {}
        };
        loadDocs();
    }, [projects, fetchDocs]);

    // Find the specific board document from the store
    const boardDoc = useMemo(() => {
        for (const projectId in projectDocs) {
            const docs = projectDocs[projectId];
            const found = docs.find((d: any) => d.id.toString() === docId.toString());
            if (found) return found;
        }
        return null;
    }, [projectDocs, docId]);

    // Fetch the file contents when the document path is resolved
    useEffect(() => {
        if (!boardDoc) {
            // Still loading projects/docs or not found
            return;
        }

        setFileName(boardDoc.filename);
        const fullUrl = boardDoc.path.startsWith('http') 
            ? boardDoc.path 
            : `${API_BASE.replace('/api', '')}/api${boardDoc.path}`;

        setLoading(true);
        fetch(fullUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}: Failed to retrieve board file`);
                return res.text();
            })
            .then(content => {
                setFileContent(content);
                // Check format
                const isXml = content.trim().startsWith('<?xml') || content.trim().startsWith('<eagle');
                setFormatType(isXml ? 'eagle' : 'binary');
                setLoading(false);
            })
            .catch(err => {
                console.error("BoardViewer load error:", err);
                setError(err.message || 'Failed to download board file contents.');
                setLoading(false);
            });
    }, [boardDoc]);

    // Parse the board file contents into structured layout details
    const boardData = useMemo<BoardData | null>(() => {
        if (!fileContent || !formatType) return null;

        try {
            if (formatType === 'eagle') {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(fileContent, 'text/xml');
                
                // Check if parse succeeded
                const parseError = xmlDoc.querySelector('parsererror');
                if (parseError) {
                    throw new Error(parseError.textContent || 'XML parsing failed');
                }

                return parseEagleXML(xmlDoc);
            } else {
                return parseBinaryFallback(fileContent);
            }
        } catch (e: any) {
            console.error("Parsing error:", e);
            // Fallback to simulated mode if Eagle XML parsing fails
            return parseBinaryFallback(fileContent);
        }
    }, [fileContent, formatType]);

    // Lists of elements and nets for the search panel
    const elementsList = useMemo(() => {
        if (!boardData) return [];
        return boardData.elements.map(e => ({ name: e.name, value: e.value, package: e.package }));
    }, [boardData]);

    const netsList = useMemo(() => {
        if (!boardData) return [];
        return boardData.signals.map(s => s.name);
    }, [boardData]);

    // Toggles visibility of a specific layer
    const handleToggleLayer = (layerNumber: number) => {
        const next = new Set(visibleLayers);
        if (next.has(layerNumber)) {
            next.delete(layerNumber);
        } else {
            next.add(layerNumber);
        }
        setVisibleLayers(next);
    };

    // Toggles all layers
    const handleToggleAllLayers = (visible: boolean) => {
        if (visible) {
            setVisibleLayers(new Set([20, 1, 16, 21, 22, 45]));
        } else {
            setVisibleLayers(new Set());
        }
    };

    // Handle search panel selection
    const handleSelectSearchItem = (type: 'element' | 'net', name: string) => {
        setSelectedItem(prev => (prev?.type === type && prev?.name === name) ? null : { type, name });
    };

;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', width: '100%', gap: '16px', padding: '0 8px', boxSizing: 'border-box' }}>
            {/* Header bar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '12px',
                    borderBottom: '1px solid var(--border)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={onBack}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            color: 'var(--text-h)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.color = 'var(--accent)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.color = 'var(--text-h)';
                        }}
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-h)', textAlign: 'left' }}>
                            {fileName || 'Board Viewer'}
                        </h2>
                        {formatType && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                {formatType === 'eagle' ? (
                                    <>
                                        <CheckCircle2 size={12} color="#10b981" />
                                        <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>
                                            Autodesk Eagle XML Board
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle size={12} color="var(--accent)" />
                                        <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>
                                            Simulated Layout (Allegro/Binary Fallback)
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main content grid */}
            {loading ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                    <Loader2 size={36} className="animate-spin" color="var(--accent)" />
                    <span style={{ fontSize: '0.9rem' }}>Downloading and parsing board layout...</span>
                </div>
            ) : error ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '12px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-h)' }}>Loading Failed</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '400px' }}>{error}</p>
                    <button
                        onClick={onBack}
                        style={{
                            marginTop: '16px',
                            background: 'var(--accent)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}
                    >
                        Go Back
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        flex: 1,
                        display: 'flex',
                        gap: '16px',
                        minHeight: 0,
                        flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
                    }}
                >
                    {/* Left sidebar: Search & Layers */}
                    <div
                        style={{
                            width: window.innerWidth <= 768 ? '100%' : '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px',
                            flexShrink: 0,
                            minHeight: 0
                        }}
                    >
                        {/* Search component */}
                        <div
                            style={{
                                flex: 1,
                                minHeight: '180px',
                                background: 'rgba(255, 255, 255, 0.01)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden'
                            }}
                        >
                            <BoardSearch
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                                elements={elementsList}
                                nets={netsList}
                                onSelect={handleSelectSearchItem}
                                selectedItem={selectedItem}
                            />
                        </div>

                        {/* Layers toggler */}
                        <div
                            style={{
                                background: 'rgba(255, 255, 255, 0.01)',
                                border: '1px solid var(--border)',
                                borderRadius: '12px',
                                padding: '16px',
                                flexShrink: 0
                            }}
                        >
                            <BoardLayers
                                visibleLayers={visibleLayers}
                                onToggleLayer={handleToggleLayer}
                                onToggleAll={handleToggleAllLayers}
                            />
                        </div>
                    </div>

                    {/* Right side: Canvas area */}
                    <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
                        <BoardCanvas
                            boardData={boardData}
                            visibleLayers={visibleLayers}
                            selectedItem={selectedItem}
                            onSelectElement={(name) => setSelectedItem({ type: 'element', name })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
