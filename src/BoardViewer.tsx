import { useEffect, useState, useMemo } from 'react';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useProjectStore } from './store/clientDataBase/useProjectStore';
import { API_BASE } from './store/serverDataBase/apiBridge';
import { BoardCanvas } from './BoardViewer/canvas';
import type { BoardData } from './BoardViewer/canvas';
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

    // Parser implementation: Eagle XML files
    function parseEagleXML(xmlDoc: Document): BoardData {
        const dimensions: any[] = [];
        const elements: any[] = [];
        const signals: any[] = [];
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const updateBBox = (x: number, y: number) => {
            if (isNaN(x) || isNaN(y)) return;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        };

        // 1. Build footprint packages dictionary
        const packagesMap: Record<string, any> = {};
        const libraries = xmlDoc.querySelectorAll('libraries > library');
        libraries.forEach(lib => {
            const libName = lib.getAttribute('name') || '';
            const packages = lib.querySelectorAll('packages > package');
            packages.forEach(pkg => {
                const pkgName = pkg.getAttribute('name') || '';
                const key = `${libName}::${pkgName}`;
                
                const smds = Array.from(pkg.querySelectorAll('smd')).map(s => ({
                    name: s.getAttribute('name') || '',
                    x: parseFloat(s.getAttribute('x') || '0'),
                    y: parseFloat(s.getAttribute('y') || '0'),
                    dx: parseFloat(s.getAttribute('dx') || '0'),
                    dy: parseFloat(s.getAttribute('dy') || '0'),
                    layer: parseInt(s.getAttribute('layer') || '1', 10),
                    rot: s.getAttribute('rot') || ''
                }));
                
                const pads = Array.from(pkg.querySelectorAll('pad')).map(p => ({
                    name: p.getAttribute('name') || '',
                    x: parseFloat(p.getAttribute('x') || '0'),
                    y: parseFloat(p.getAttribute('y') || '0'),
                    drill: parseFloat(p.getAttribute('drill') || '0'),
                    diameter: parseFloat(p.getAttribute('diameter') || '0') || (parseFloat(p.getAttribute('drill') || '0') * 1.6)
                }));
                
                const silks = Array.from(pkg.querySelectorAll('wire')).map(w => ({
                    x1: parseFloat(w.getAttribute('x1') || '0'),
                    y1: parseFloat(w.getAttribute('y1') || '0'),
                    x2: parseFloat(w.getAttribute('x2') || '0'),
                    y2: parseFloat(w.getAttribute('y2') || '0'),
                    width: parseFloat(w.getAttribute('width') || '0.15'),
                    layer: parseInt(w.getAttribute('layer') || '21', 10)
                }));
                
                packagesMap[key] = { smds, pads, silks };
                packagesMap[pkgName] = { smds, pads, silks };
            });
        });

        // 2. Parse board outline/dimensions (Layer 20)
        const outlineWires = xmlDoc.querySelectorAll('board > plain > wire[layer="20"]');
        outlineWires.forEach(w => {
            const x1 = parseFloat(w.getAttribute('x1') || '0');
            const y1 = parseFloat(w.getAttribute('y1') || '0');
            const x2 = parseFloat(w.getAttribute('x2') || '0');
            const y2 = parseFloat(w.getAttribute('y2') || '0');
            dimensions.push({ x1, y1, x2, y2 });
            updateBBox(x1, y1);
            updateBBox(x2, y2);
        });

        // 3. Parse components/elements
        const elementsList = xmlDoc.querySelectorAll('board > elements > element');
        elementsList.forEach(el => {
            const name = el.getAttribute('name') || '';
            const value = el.getAttribute('value') || '';
            const pkg = el.getAttribute('package') || '';
            const lib = el.getAttribute('library') || '';
            const x = parseFloat(el.getAttribute('x') || '0');
            const y = parseFloat(el.getAttribute('y') || '0');
            const rot = el.getAttribute('rot') || 'R0';
            
            const mirror = rot.includes('M');
            const angle = parseFloat(rot.replace(/^[a-zA-Z]/, '')) || 0;
            
            updateBBox(x, y);

            const key = `${lib}::${pkg}`;
            const pkgDetails = packagesMap[key] || packagesMap[pkg] || { smds: [], pads: [], silks: [] };

            elements.push({
                name,
                value,
                package: pkg,
                x,
                y,
                rot,
                mirror,
                angle,
                smds: pkgDetails.smds,
                pads: pkgDetails.pads,
                silks: pkgDetails.silks
            });
        });

        // 4. Parse signals/traces (vias & wires)
        const signalsList = xmlDoc.querySelectorAll('board > signals > signal');
        signalsList.forEach(sig => {
            const name = sig.getAttribute('name') || '';
            const wires: any[] = [];
            const vias: any[] = [];

            sig.querySelectorAll('wire').forEach(w => {
                const x1 = parseFloat(w.getAttribute('x1') || '0');
                const y1 = parseFloat(w.getAttribute('y1') || '0');
                const x2 = parseFloat(w.getAttribute('x2') || '0');
                const y2 = parseFloat(w.getAttribute('y2') || '0');
                const width = parseFloat(w.getAttribute('width') || '0.2');
                const layer = parseInt(w.getAttribute('layer') || '1', 10);
                
                wires.push({ x1, y1, x2, y2, width, layer });
                updateBBox(x1, y1);
                updateBBox(x2, y2);
            });

            sig.querySelectorAll('via').forEach(v => {
                const x = parseFloat(v.getAttribute('x') || '0');
                const y = parseFloat(v.getAttribute('y') || '0');
                const drill = parseFloat(v.getAttribute('drill') || '0.6');
                const diameter = parseFloat(v.getAttribute('diameter') || '0') || (drill * 1.6);
                
                vias.push({ x, y, drill, diameter });
                updateBBox(x, y);
            });

            signals.push({ name, wires, vias });
        });

        if (minX === Infinity) {
            minX = 0; minY = 0; maxX = 100; maxY = 100;
        }

        return {
            dimensions,
            elements,
            signals,
            boundingBox: { minX, minY, maxX, maxY }
        };
    };

    function parseBinaryFallback(binaryContent: string): BoardData {
        // Limit scanning to first 2MB for performance safety on large files
        const scanLimit = 2 * 1024 * 1024;
        const contentToScan = binaryContent.length > scanLimit 
            ? binaryContent.slice(0, scanLimit) 
            : binaryContent;

        // Scan for standard designator labels
        const designatorRegex = /\b([URCDJQY]|TP|JP|CN|LED|F|FB|TP|MH|CONN)[0-9]{1,4}\b/g;
        const foundDesignators = new Set<string>();
        let match;
        while ((match = designatorRegex.exec(contentToScan)) !== null) {
            foundDesignators.add(match[0]);
            if (foundDesignators.size >= 400) break; // Cap matching count
        }

        // Scan for common net name strings
        const netRegex = /\b(GND|VCC|VDD|3V3|5V|1V8|RESET|CLK|MISO|MOSI|SCK|CS|DDR_[A-Z0-9_]+|USB_[A-Z_]+)\b/g;
        const foundNets = new Set<string>();
        while ((match = netRegex.exec(contentToScan)) !== null) {
            foundNets.add(match[0]);
            if (foundNets.size >= 100) break; // Cap matching count
        }

        const designators = Array.from(foundDesignators).sort((a, b) => {
            const aPrefix = a.replace(/[0-9]/g, '');
            const bPrefix = b.replace(/[0-9]/g, '');
            if (aPrefix !== bPrefix) return aPrefix.localeCompare(bPrefix);
            return (parseInt(a.replace(/[^0-9]/g, ''), 10) || 0) - (parseInt(b.replace(/[^0-9]/g, ''), 10) || 0);
        });
        const nets = Array.from(foundNets).sort();
        if (nets.indexOf('GND') === -1) nets.unshift('GND');
        if (nets.indexOf('VCC') === -1) nets.push('VCC');

        // Layout dimensions representing a typical board outline
        const dimensions = [
            { x1: 0, y1: 0, x2: 240, y2: 0 },
            { x1: 240, y1: 0, x2: 240, y2: 130 },
            { x1: 240, y1: 130, x2: 0, y2: 130 },
            { x1: 0, y1: 130, x2: 0, y2: 0 }
        ];

        const elements: any[] = [];
        const signals: any[] = [];

        // Grid layout spacing logic
        const cols = 10;
        designators.forEach((name, idx) => {
            const col = idx % cols;
            const row = Math.floor(idx / cols);
            const x = 20 + col * 22;
            const y = 20 + row * 18;

            let pkg = '0603';
            let val = '';
            let smds: any[] = [];
            let pads: any[] = [];
            let silks: any[] = [];

            if (name.startsWith('U')) {
                pkg = 'SO-8';
                val = 'IC';
                // 8 pads
                for (let i = 0; i < 4; i++) {
                    smds.push({ name: `${i + 1}`, x: -2, y: 1.5 - i * 1, dx: 1.2, dy: 0.5, layer: 1 });
                    smds.push({ name: `${8 - i}`, x: 2, y: 1.5 - i * 1, dx: 1.2, dy: 0.5, layer: 1 });
                }
                silks = [
                    { x1: -1.5, y1: 2.2, x2: 1.5, y2: 2.2, layer: 21 },
                    { x1: 1.5, y1: 2.2, x2: 1.5, y2: -2.2, layer: 21 },
                    { x1: 1.5, y1: -2.2, x2: -1.5, y2: -2.2, layer: 21 },
                    { x1: -1.5, y1: -2.2, x2: -1.5, y2: 2.2, layer: 21 }
                ];
            } else if (name.startsWith('R') || name.startsWith('C') || name.startsWith('FB')) {
                pkg = '0603';
                val = name.startsWith('R') ? '10k' : '0.1uF';
                smds = [
                    { name: '1', x: -0.85, y: 0, dx: 0.6, dy: 0.8, layer: 1 },
                    { name: '2', x: 0.85, y: 0, dx: 0.6, dy: 0.8, layer: 1 }
                ];
                silks = [
                    { x1: -1.2, y1: 0.6, x2: 1.2, y2: 0.6, layer: 21 },
                    { x1: 1.2, y1: 0.6, x2: 1.2, y2: -0.6, layer: 21 },
                    { x1: 1.2, y1: -0.6, x2: -1.2, y2: -0.6, layer: 21 },
                    { x1: -1.2, y1: -0.6, x2: -1.2, y2: 0.6, layer: 21 }
                ];
            } else if (name.startsWith('LED')) {
                pkg = '0805_LED';
                val = 'Red';
                smds = [
                    { name: 'A', x: -1.0, y: 0, dx: 0.8, dy: 1.0, layer: 1 },
                    { name: 'C', x: 1.0, y: 0, dx: 0.8, dy: 1.0, layer: 1 }
                ];
                silks = [
                    { x1: -1.5, y1: 0.8, x2: 1.5, y2: 0.8, layer: 21 },
                    { x1: 1.5, y1: 0.8, x2: 1.5, y2: -0.8, layer: 21 },
                    { x1: 1.5, y1: -0.8, x2: -1.5, y2: -0.8, layer: 21 },
                    { x1: -1.5, y1: -0.8, x2: -1.5, y2: 0.8, layer: 21 }
                ];
            } else {
                pkg = 'PTH_2MM';
                val = 'Pad';
                pads = [{ name: '1', x: 0, y: 0, drill: 0.9, diameter: 1.8 }];
                silks = [
                    { x1: -1.2, y1: 1.2, x2: 1.2, y2: 1.2, layer: 21 },
                    { x1: 1.2, y1: 1.2, x2: 1.2, y2: -1.2, layer: 21 },
                    { x1: 1.2, y1: -1.2, x2: -1.2, y2: -1.2, layer: 21 },
                    { x1: -1.2, y1: -1.2, x2: -1.2, y2: 1.2, layer: 21 }
                ];
            }

            elements.push({
                name,
                value: val,
                package: pkg,
                x,
                y: y % 110, // wrap inside outline limits
                rot: 'R0',
                mirror: false,
                angle: 0,
                smds,
                pads,
                silks
            });
        });

        // Add simulated traces between grid elements connecting to nets
        nets.slice(0, 20).forEach((netName, nIdx) => {
            const wires: any[] = [];
            const connectionsCount = 3 + (nIdx % 4);
            
            for (let i = 0; i < connectionsCount; i++) {
                const elIdx = (nIdx * 5 + i * 8) % elements.length;
                const nextElIdx = (elIdx + 1) % elements.length;
                const el = elements[elIdx];
                const nextEl = elements[nextElIdx];
                if (el && nextEl) {
                    wires.push({
                        x1: el.x,
                        y1: el.y,
                        x2: nextEl.x,
                        y2: nextEl.y,
                        width: 0.3,
                        layer: nIdx % 2 === 0 ? 1 : 16 // alternate layers
                    });
                }
            }
            signals.push({ name: netName, wires, vias: [] });
        });

        return {
            dimensions,
            elements,
            signals,
            boundingBox: { minX: 0, minY: 0, maxX: 240, maxY: 130 }
        };
    };

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
