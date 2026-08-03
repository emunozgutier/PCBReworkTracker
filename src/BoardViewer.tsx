import { useEffect, useState, useMemo } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { useProjectStore } from './store/clientDataBase/useProjectStore';
import { API_BASE } from './store/serverDataBase/apiBridge';
import { BoardCanvas } from './BoardViewer/canvas';
import { parseEagleXML, parseBinaryFallback, parseAllegro } from './BoardViewer/parser';
import type { BoardData } from './BoardViewer/parser';
import { SideMenu } from './BoardViewer/SideMenu';
import { getLayerList } from './BoardViewer/SideMenu/layers';
import { useBoardViewer } from './store/useBoardViewer';

interface BoardViewerProps {
    docId: string | number;
    onBack: () => void;
}

export function BoardViewer({ docId, onBack }: BoardViewerProps) {
    const { projects, projectDocs, fetchProjects, fetchDocs } = useProjectStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(null);

    const [formatType, setFormatType] = useState<'eagle' | 'allegro' | 'binary' | null>(null);

    const {
        visibleLayers,
        searchQuery,
        selectedItem,
        setSearchQuery,
        setSelectedItem,
        toggleLayer,
        setVisibleLayers
    } = useBoardViewer();

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


        const fullUrl = boardDoc.path.startsWith('http') 
            ? boardDoc.path 
            : `${API_BASE.replace('/api', '')}/api${boardDoc.path}`;

        setLoading(true);
        fetch(fullUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error ${res.status}: Failed to retrieve board file`);
                return res.arrayBuffer();
            })
            .then(buffer => {
                // Peek first 100 bytes to check if it's XML or binary
                const uint8 = new Uint8Array(buffer.slice(0, 100));
                let headerText = '';
                for (let i = 0; i < uint8.length; i++) {
                    headerText += String.fromCharCode(uint8[i]);
                }
                
                const isXml = headerText.trim().startsWith('<?xml') || headerText.trim().startsWith('<eagle');
                if (isXml) {
                    const text = new TextDecoder().decode(buffer);
                    setFileContent(text);
                    setFormatType('eagle');
                } else {
                    setFileContent(buffer);
                    setFormatType('allegro');
                }
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
                if (typeof fileContent !== 'string') return null;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(fileContent, 'text/xml');
                
                // Check if parse succeeded
                const parseError = xmlDoc.querySelector('parsererror');
                if (parseError) {
                    throw new Error(parseError.textContent || 'XML parsing failed');
                }

                return parseEagleXML(xmlDoc);
            } else if (formatType === 'allegro') {
                if (!(fileContent instanceof ArrayBuffer)) return null;
                return parseAllegro(fileContent);
            } else {
                const text = typeof fileContent === 'string' 
                    ? fileContent 
                    : new TextDecoder().decode(fileContent);
                return parseBinaryFallback(text);
            }
        } catch (e: any) {
            console.error("Parsing error:", e);
            // Fallback to simulated mode if Allegro or Eagle parsing fails
            const text = typeof fileContent === 'string' 
                ? fileContent 
                : new TextDecoder().decode(fileContent);
            return parseBinaryFallback(text);
        }
    }, [fileContent, formatType]);

    // Set initial visible layers when board data is loaded
    useEffect(() => {
        if (!boardData) return;
        const allLayers = getLayerList(boardData).map(l => l.number);
        setVisibleLayers(new Set(allLayers));
    }, [boardData, setVisibleLayers]);

    const handleToggleAll = (visible: boolean) => {
        if (visible) {
            const allLayers = getLayerList(boardData).map(l => l.number);
            setVisibleLayers(new Set(allLayers));
        } else {
            setVisibleLayers(new Set());
        }
    };

    // Lists of elements and nets for the search panel
    const elementsList = useMemo(() => {
        if (!boardData) return [];
        return boardData.elements.map(e => ({ name: e.name, value: e.value, package: e.package }));
    }, [boardData]);

    const netsList = useMemo(() => {
        if (!boardData) return [];
        return boardData.signals.map(s => s.name);
    }, [boardData]);

    // Handle search panel selection
    const handleSelectSearchItem = (type: 'element' | 'net', name: string) => {
        setSelectedItem((selectedItem?.type === type && selectedItem?.name === name) ? null : { type, name });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: '16px', padding: '0 8px', boxSizing: 'border-box' }}>


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
                            minHeight: 0,
                            height: '100%',
                            background: 'rgba(255, 255, 255, 0.01)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '16px',
                            overflow: 'hidden'
                        }}
                    >
                        <SideMenu
                            boardData={boardData}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            elements={elementsList}
                            nets={netsList}
                            onSelect={handleSelectSearchItem}
                            selectedItem={selectedItem}
                            visibleLayers={visibleLayers}
                            onToggleLayer={toggleLayer}
                            onToggleAll={handleToggleAll}
                        />
                    </div>

                    {/* Right side: Canvas area */}
                    <div style={{ flex: 1, minWidth: 0, height: '100%' }}>
                        <BoardCanvas
                            boardData={boardData}
                            onSelectElement={(name) => setSelectedItem({ type: 'element', name })}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
