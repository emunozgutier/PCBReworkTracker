import { useEffect, useState, useMemo, useCallback } from 'react';
import { AlertCircle } from 'lucide-react';
import { useProjectStore } from '../store/clientDataBase/useProjectStore';
import { BoardCanvas } from './BoardViewer/canvas';
import { parseEagleXML, parseBinaryFallback, parseAllegro } from './BoardViewer/parser';
import type { BoardData } from './BoardViewer/parser';
import { SideMenu } from './BoardViewer/SideMenu';
import { getLayerList } from './BoardViewer/SideMenu/layers';
import { useBoardViewer } from '../store/useBoardViewer';
import { useAppState } from '../store/useAppState';
import { TopBar } from './BoardViewer/TopBar';
import { getDocumentUrl } from '../store/useDemoStore';
import { BrdLoadingOverlay } from './BoardViewer/BrdLoadingOverlay';
import type { LoadStep } from './BoardViewer/BrdLoadingOverlay';

interface BoardViewerProps {
    docId: string | number;
    onBack: () => void;
}

// ── Loading step definitions ──────────────────────────────────────────────────
const LOAD_STEPS: LoadStep[] = [
    { id: 'projects',  label: 'Loading projects'         },
    { id: 'docs',      label: 'Loading project documents' },
    { id: 'resolve',   label: 'Resolving board file'      },
    { id: 'download',  label: 'Downloading board file'    },
    { id: 'detect',    label: 'Detecting file format'     },
    { id: 'parse',     label: 'Parsing board layout'      },
    { id: 'adapt',     label: 'Building component data'   },
    { id: 'layers',    label: 'Initializing layers'       },
];

export function BoardViewer({ docId, onBack }: BoardViewerProps) {
    const { projects, projectDocs, fetchProjects, fetchDocs } = useProjectStore();
    const { isMobile } = useAppState();
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ── Step-driven loading state ─────────────────────────────────────────────
    /** Index of the step currently executing (0 = not started / all done when > last index) */
    const [currentStep, setCurrentStep] = useState(0);
    const isLoading = currentStep < LOAD_STEPS.length;

    const [fileContent, setFileContent] = useState<string | ArrayBuffer | null>(null);
    const [formatType, setFormatType] = useState<'eagle' | 'allegro' | 'binary' | null>(null);
    const [boardData, setBoardData] = useState<BoardData | null>(null);

    const {
        visibleLayers,
        searchQuery,
        selectedItem,
        setSearchQuery,
        setSelectedItem,
        toggleLayer,
        setVisibleLayers,
    } = useBoardViewer();

    // ── Find the doc from the store ───────────────────────────────────────────
    const boardDoc = useMemo(() => {
        for (const projectId in projectDocs) {
            const docs = projectDocs[projectId];
            const found = docs.find((d: any) => d.id.toString() === docId.toString());
            if (found) return found;
        }
        return null;
    }, [projectDocs, docId]);

    // ── Sequential async loader ───────────────────────────────────────────────
    const runLoad = useCallback(async () => {
        try {
            // Step 0 — load projects
            setCurrentStep(0);
            if (projects.length === 0) {
                await fetchProjects();
            }

            // Step 1 — load docs for all projects
            setCurrentStep(1);
            const promises = projects.map(p => fetchDocs(p.id));
            await Promise.all(promises);

            // Step 2 — resolve document (boardDoc is derived from the store; re-check)
            setCurrentStep(2);
            // Give React one tick to propagate the fetched docs into `boardDoc`
            await new Promise(r => setTimeout(r, 50));

            // boardDoc is still computed via useMemo from store — read it fresh via ref trick below

        } catch (err: any) {
            setError(err.message || 'Failed to load board metadata.');
            setCurrentStep(LOAD_STEPS.length); // stop spinner
        }
    }, [projects, fetchProjects, fetchDocs]);

    // Kick off metadata loading once
    useEffect(() => {
        runLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally only once on mount

    // Step 3+ — once boardDoc is resolved, download + parse
    useEffect(() => {
        if (!boardDoc) return;
        if (currentStep > 2) return; // already past this point

        const load = async () => {
            try {
                // Step 3 — download
                setCurrentStep(3);
                const fullUrl = getDocumentUrl(boardDoc.path, boardDoc.filename);
                const res = await fetch(fullUrl);
                if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to retrieve board file`);
                const buffer = await res.arrayBuffer();

                // Step 4 — detect format
                setCurrentStep(4);
                await new Promise(r => setTimeout(r, 0)); // let React paint the step
                const uint8 = new Uint8Array(buffer.slice(0, 100));
                let headerText = '';
                for (let i = 0; i < uint8.length; i++) headerText += String.fromCharCode(uint8[i]);
                const isXml = headerText.trim().startsWith('<?xml') || headerText.trim().startsWith('<eagle');

                let content: string | ArrayBuffer;
                let fmt: 'eagle' | 'allegro' | 'binary';
                if (isXml) {
                    content = new TextDecoder().decode(buffer);
                    fmt = 'eagle';
                } else {
                    content = buffer;
                    fmt = 'allegro';
                }
                setFileContent(content);
                setFormatType(fmt);

                // Step 5 — parse (synchronous but CPU-heavy — yield first so the UI paints)
                setCurrentStep(5);
                await new Promise(r => setTimeout(r, 10));

                let parsed: BoardData;
                try {
                    if (fmt === 'eagle') {
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(content as string, 'text/xml');
                        const parseError = xmlDoc.querySelector('parsererror');
                        if (parseError) throw new Error(parseError.textContent || 'XML parse failed');
                        parsed = parseEagleXML(xmlDoc);
                    } else {
                        parsed = parseAllegro(content as ArrayBuffer);
                    }
                } catch (e: any) {
                    console.warn('Parse failed, falling back:', e);
                    const text = typeof content === 'string'
                        ? content
                        : new TextDecoder().decode(content);
                    parsed = parseBinaryFallback(text);
                }

                // Step 6 — adapt / post-process (already done inside parse, but label it)
                setCurrentStep(6);
                await new Promise(r => setTimeout(r, 0));
                setBoardData(parsed);

                // Step 7 — initialise layers
                setCurrentStep(7);
                await new Promise(r => setTimeout(r, 0));
                const allLayers = getLayerList(parsed).map(l => l.number);
                setVisibleLayers(new Set(allLayers));

                // Done
                setCurrentStep(LOAD_STEPS.length);

            } catch (err: any) {
                console.error('BoardViewer load error:', err);
                setError(err.message || 'Failed to load board file.');
                setCurrentStep(LOAD_STEPS.length);
            }
        };

        load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardDoc]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const [selectionSource, setSelectionSource] = useState<'search' | 'click' | null>(null);

    const handleToggleAll = (visible: boolean) => {
        if (visible) {
            const allLayers = getLayerList(boardData).map(l => l.number);
            setVisibleLayers(new Set(allLayers));
        } else {
            setVisibleLayers(new Set());
        }
    };

    const elementsList = useMemo(() => {
        if (!boardData) return [];
        return boardData.elements.map(e => ({ name: e.name, value: e.value, package: e.package }));
    }, [boardData]);

    const handleSelectSearchItem = (type: 'element' | 'net', name: string) => {
        setSelectionSource('search');
        setSelectedItem((selectedItem?.type === type && selectedItem?.name === name) ? null : { type, name });
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="board-viewer-container">
            <TopBar
                filename={boardDoc?.filename}
                onClose={onBack}
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {isLoading ? (
                <BrdLoadingOverlay
                    steps={LOAD_STEPS}
                    currentStep={currentStep}
                    filename={boardDoc?.filename}
                />
            ) : error ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '12px' }} />
                    <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-h)' }}>Loading Failed</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '400px' }}>{error}</p>
                    <button
                        onClick={onBack}
                        style={{ marginTop: '16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                        Go Back
                    </button>
                </div>
            ) : (
                <div className="board-viewer-body">
                    {isMobile && isSidebarOpen && (
                        <div
                            onClick={() => setIsSidebarOpen(false)}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 9, borderRadius: '12px' }}
                        />
                    )}

                    <div className={`board-viewer-sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                        <SideMenu
                            boardData={boardData}
                            searchQuery={searchQuery}
                            onSearchChange={setSearchQuery}
                            elements={elementsList}
                            onSelect={(type, name) => {
                                handleSelectSearchItem(type, name);
                                if (isMobile) setIsSidebarOpen(false);
                            }}
                            selectedItem={selectedItem}
                            visibleLayers={visibleLayers}
                            onToggleLayer={toggleLayer}
                            onToggleAll={handleToggleAll}
                        />
                    </div>

                    <div className="board-viewer-canvas-container">
                        <BoardCanvas
                            boardData={boardData}
                            onSelectElement={(name) => {
                                setSelectionSource('click');
                                setSelectedItem({ type: 'element', name });
                            }}
                            selectionSource={selectionSource}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
