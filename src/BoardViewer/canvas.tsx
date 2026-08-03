import React, { useRef, useState, useEffect } from 'react';
import type { BoardData } from './parser';

interface CanvasProps {
    boardData: BoardData | null;
    visibleLayers: Set<number>;
    selectedItem: { type: 'element' | 'net'; name: string } | null;
    onSelectElement: (name: string) => void;
}

export function BoardCanvas({
    boardData,
    visibleLayers,
    selectedItem,
    onSelectElement
}: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Track resize
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                setCanvasSize({ width: Math.max(width, 300), height: Math.max(height, 350) });
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Reset pan & zoom to center board when board data is loaded
    useEffect(() => {
        if (!boardData) return;
        const bbox = boardData.boundingBox;
        const boardW = bbox.maxX - bbox.minX || 100;
        const boardH = bbox.maxY - bbox.minY || 100;
        
        const padding = 60;
        const scaleX = (canvasSize.width - padding * 2) / boardW;
        const scaleY = (canvasSize.height - padding * 2) / boardH;
        const initialScale = Math.min(scaleX, scaleY, 50); // cap initial scale
        
        const boardCenterX = (bbox.minX + bbox.maxX) / 2;
        const boardCenterY = (bbox.minY + bbox.maxY) / 2;
        
        const initialPanX = canvasSize.width / 2 - boardCenterX * initialScale;
        const initialPanY = canvasSize.height / 2 - (-boardCenterY) * initialScale; // flipped Y
        
        setScale(initialScale);
        setPan({ x: initialPanX, y: initialPanY });
    }, [boardData, canvasSize.width, canvasSize.height]);

    // Center on selected element when it changes
    useEffect(() => {
        if (!boardData || !selectedItem || selectedItem.type !== 'element') return;
        const el = boardData.elements.find(e => e.name === selectedItem.name);
        if (!el) return;

        const targetPanX = canvasSize.width / 2 - el.x * scale;
        const targetPanY = canvasSize.height / 2 - (-el.y) * scale;
        
        setPan({ x: targetPanX, y: targetPanY });
    }, [selectedItem, boardData]);

    // Draw handler
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Fill background
        ctx.fillStyle = '#0f172a'; // Deep slate
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw nice dark theme grid
        drawGrid(ctx, canvas.width, canvas.height, pan, scale);

        if (!boardData) {
            // Draw loading or empty text
            ctx.fillStyle = '#9ca3af';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No PCB board data loaded.', canvas.width / 2, canvas.height / 2);
            return;
        }

        ctx.save();
        ctx.translate(pan.x, pan.y);
        ctx.scale(scale, scale);

        // Set line join / caps for beautiful trace connections
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // 1. Draw copper traces (Bottom Copper Layer 16 first, then Top Copper Layer 1)
        if (visibleLayers.has(16)) {
            drawSignals(ctx, boardData.signals, 16);
        }
        if (visibleLayers.has(1)) {
            drawSignals(ctx, boardData.signals, 1);
        }

        // 2. Draw Pads & Vias (Layer 45)
        if (visibleLayers.has(45)) {
            drawVias(ctx, boardData.signals);
            drawElementPads(ctx, boardData.elements);
        }

        // 3. Draw Silkscreen Bottom (Layer 22/26)
        if (visibleLayers.has(22)) {
            drawElementSilkscreen(ctx, boardData.elements, true);
        }

        // 4. Draw Silkscreen Top (Layer 21/25)
        if (visibleLayers.has(21)) {
            drawElementSilkscreen(ctx, boardData.elements, false);
        }

        // 5. Draw Board Outline (Layer 20 / Dimension)
        if (visibleLayers.has(20)) {
            ctx.strokeStyle = '#10b981'; // Green dimension outline
            ctx.lineWidth = 1.5 / scale;
            boardData.dimensions.forEach(line => {
                ctx.beginPath();
                ctx.moveTo(line.x1, -line.y1);
                ctx.lineTo(line.x2, -line.y2);
                ctx.stroke();
            });
        }

        // 6. Highlight selected item
        if (selectedItem) {
            drawSelectionHighlight(ctx, boardData, selectedItem, scale);
        }

        ctx.restore();
    }, [boardData, pan, scale, visibleLayers, selectedItem]);

    // --- Draw Helpers ---

    const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number, pan: { x: number; y: number }, scale: number) => {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;

        // Grid spacing adapts to zoom level
        let spacing = 50;
        if (scale > 15) spacing = 10;
        else if (scale > 5) spacing = 25;
        else if (scale < 0.5) spacing = 200;

        const gridStep = spacing * scale;
        const startX = pan.x % gridStep;
        const startY = pan.y % gridStep;

        for (let x = startX; x < w; x += gridStep) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = startY; y < h; y += gridStep) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        ctx.restore();
    };

    const drawSignals = (ctx: CanvasRenderingContext2D, signals: BoardData['signals'], targetLayer: number) => {
        const isTop = targetLayer === 1;
        ctx.strokeStyle = isTop ? 'rgba(239, 68, 68, 0.65)' : 'rgba(59, 130, 246, 0.65)'; // Translucent Red/Blue
        signals.forEach(sig => {
            // Check if this signal is currently highlighted
            const isHighlightedNet = selectedItem?.type === 'net' && selectedItem?.name === sig.name;
            if (isHighlightedNet) {
                ctx.save();
                ctx.strokeStyle = '#c084fc'; // Violet highlight
                ctx.shadowColor = '#c084fc';
                ctx.shadowBlur = 10;
            }

            // Draw copper planes/polygons for this layer/signal
            sig.polygons?.forEach(poly => {
                const isPolyTop = poly.layer < 16;
                if ((isTop && isPolyTop) || (!isTop && poly.layer === 16)) {
                    ctx.fillStyle = isHighlightedNet 
                        ? 'rgba(192, 132, 252, 0.25)' 
                        : (isTop ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)');
                    
                    ctx.beginPath();
                    poly.vertices.forEach((v, vIdx) => {
                        if (vIdx === 0) ctx.moveTo(v.x, -v.y);
                        else ctx.lineTo(v.x, -v.y);
                    });
                    ctx.closePath();
                    ctx.fill();
                    
                    ctx.lineWidth = poly.width || 0.2;
                    ctx.strokeStyle = isHighlightedNet 
                        ? '#c084fc' 
                        : (isTop ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)');
                    ctx.stroke();
                }
            });

            // Draw tracks/wires for this layer/signal
            sig.wires.forEach(wire => {
                const isWireTop = wire.layer < 16;
                if ((isTop && isWireTop) || (!isTop && wire.layer === 16)) {
                    ctx.lineWidth = Math.max(wire.width, 0.15);
                    ctx.beginPath();
                    ctx.moveTo(wire.x1, -wire.y1);
                    ctx.lineTo(wire.x2, -wire.y2);
                    ctx.stroke();
                }
            });

            if (isHighlightedNet) {
                ctx.restore();
            }
        });
    };

    const drawVias = (ctx: CanvasRenderingContext2D, signals: BoardData['signals']) => {
        signals.forEach(sig => {
            sig.vias.forEach(via => {
                const isHighlightedNet = selectedItem?.type === 'net' && selectedItem?.name === sig.name;

                // Outer pad ring
                ctx.fillStyle = isHighlightedNet ? '#c084fc' : '#f59e0b'; // Gold or Violet
                ctx.beginPath();
                ctx.arc(via.x, -via.y, via.diameter / 2, 0, Math.PI * 2);
                ctx.fill();

                // Inner drill hole
                ctx.fillStyle = '#0f172a'; // match background
                ctx.beginPath();
                ctx.arc(via.x, -via.y, via.drill / 2, 0, Math.PI * 2);
                ctx.fill();
            });
        });
    };

    const drawElementPads = (ctx: CanvasRenderingContext2D, elements: BoardData['elements']) => {
        elements.forEach(el => {
            // Rotate and translate coordinates for pads
            ctx.save();
            ctx.translate(el.x, -el.y);
            ctx.rotate((-el.angle * Math.PI) / 180);

            // Draw Through-hole Pads
            el.pads.forEach(pad => {
                ctx.fillStyle = '#f59e0b'; // Gold copper
                ctx.beginPath();
                ctx.arc(pad.x, -pad.y, pad.diameter / 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#0f172a'; // Drill hole
                ctx.beginPath();
                ctx.arc(pad.x, -pad.y, pad.drill / 2, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw SMDs
            el.smds.forEach(smd => {
                // Determine color by SMD layer
                if (smd.layer === 1 && visibleLayers.has(1)) {
                    ctx.fillStyle = 'rgba(239, 68, 68, 0.8)'; // Top pad
                } else if (smd.layer === 16 && visibleLayers.has(16)) {
                    ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'; // Bottom pad
                } else {
                    return;
                }

                ctx.save();
                ctx.translate(smd.x, -smd.y);
                if (smd.rot) {
                    const smdAngle = parseFloat(smd.rot.replace(/^[a-zA-Z]/, '')) || 0;
                    ctx.rotate((-smdAngle * Math.PI) / 180);
                }
                ctx.fillRect(-smd.dx / 2, -smd.dy / 2, smd.dx, smd.dy);
                ctx.restore();
            });

            ctx.restore();
        });
    };

    const drawElementSilkscreen = (ctx: CanvasRenderingContext2D, elements: BoardData['elements'], drawBottom: boolean) => {
        ctx.strokeStyle = drawBottom ? 'rgba(168, 85, 247, 0.5)' : 'rgba(243, 244, 246, 0.5)'; // Light grey or purple
        ctx.fillStyle = drawBottom ? 'rgba(168, 85, 247, 0.7)' : 'rgba(243, 244, 246, 0.7)';
        
        elements.forEach(el => {
            if (el.mirror !== drawBottom) return;

            ctx.save();
            ctx.translate(el.x, -el.y);
            ctx.rotate((-el.angle * Math.PI) / 180);

            // Draw package outlines
            ctx.lineWidth = 0.15;
            el.silks.forEach(silk => {
                ctx.beginPath();
                ctx.moveTo(silk.x1, -silk.y1);
                ctx.lineTo(silk.x2, -silk.y2);
                ctx.stroke();
            });

            // Draw component text designator label (e.g. "U1")
            ctx.scale(1, -1); // flip back Y so text is upright
            ctx.font = `${Math.max(1.2, 8 / scale)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Adjust offset to not overlap pads
            ctx.fillText(el.name, 0, 0);

            ctx.restore();
        });
    };

    const drawSelectionHighlight = (
        ctx: CanvasRenderingContext2D,
        boardData: BoardData,
        selected: { type: 'element' | 'net'; name: string },
        scale: number
    ) => {
        if (selected.type === 'element') {
            const el = boardData.elements.find(e => e.name === selected.name);
            if (!el) return;

            ctx.save();
            ctx.strokeStyle = '#c084fc'; // Purple highlight
            ctx.shadowColor = '#c084fc';
            ctx.shadowBlur = 12;
            ctx.lineWidth = 2.5 / scale;
            
            // Draw a glowing crosshair / bounding circle
            ctx.beginPath();
            ctx.arc(el.x, -el.y, 8 / scale + 1.5, 0, Math.PI * 2);
            ctx.stroke();

            // Draw outer brackets
            const bracketSize = 12 / scale;
            ctx.beginPath();
            ctx.moveTo(el.x - bracketSize, -el.y - bracketSize / 2);
            ctx.lineTo(el.x - bracketSize, -el.y - bracketSize);
            ctx.lineTo(el.x - bracketSize / 2, -el.y - bracketSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(el.x + bracketSize, -el.y - bracketSize / 2);
            ctx.lineTo(el.x + bracketSize, -el.y - bracketSize);
            ctx.lineTo(el.x + bracketSize / 2, -el.y - bracketSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(el.x - bracketSize, -el.y + bracketSize / 2);
            ctx.lineTo(el.x - bracketSize, -el.y + bracketSize);
            ctx.lineTo(el.x - bracketSize / 2, -el.y + bracketSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(el.x + bracketSize, -el.y + bracketSize / 2);
            ctx.lineTo(el.x + bracketSize, -el.y + bracketSize);
            ctx.lineTo(el.x + bracketSize / 2, -el.y + bracketSize);
            ctx.stroke();

            ctx.restore();
        }
    };

    // --- Interaction Handlers ---

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (e.button === 0) { // Left click
            setIsDragging(true);
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isDragging) {
            setPan({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Zoom centered on mouse
        const boardX = (mouseX - pan.x) / scale;
        const boardY = (mouseY - pan.y) / scale;

        const zoomFactor = 1.25;
        let newScale = scale;
        if (e.deltaY < 0) {
            newScale = Math.min(scale * zoomFactor, 120);
        } else {
            newScale = Math.max(scale / zoomFactor, 0.05);
        }

        const newPanX = mouseX - boardX * newScale;
        const newPanY = mouseY - boardY * newScale;

        setScale(newScale);
        setPan({ x: newPanX, y: newPanY });
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // Skip clicks that were part of dragging
        if (Math.abs(e.clientX - dragStart.x - pan.x) > 5 || Math.abs(e.clientY - dragStart.y - pan.y) > 5) {
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas || !boardData) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Convert click to board coordinates
        const clickX = (mouseX - pan.x) / scale;
        const clickY = -(mouseY - pan.y) / scale; // unflip Y

        // Check if clicked close to any component
        let closestEl = null;
        let minDist = 15 / scale; // click tolerance

        boardData.elements.forEach(el => {
            const dist = Math.hypot(el.x - clickX, el.y - clickY);
            if (dist < minDist) {
                minDist = dist;
                closestEl = el;
            }
        });

        if (closestEl) {
            onSelectElement((closestEl as any).name);
        }
    };

    const handleReset = () => {
        if (!boardData) return;
        const bbox = boardData.boundingBox;
        const boardW = bbox.maxX - bbox.minX || 100;
        const boardH = bbox.maxY - bbox.minY || 100;
        const scaleX = (canvasSize.width - 120) / boardW;
        const scaleY = (canvasSize.height - 120) / boardH;
        const newScale = Math.min(scaleX, scaleY, 50);
        
        setScale(newScale);
        setPan({
            x: canvasSize.width / 2 - ((bbox.minX + bbox.maxX) / 2) * newScale,
            y: canvasSize.height / 2 - (-(bbox.minY + bbox.maxY) / 2) * newScale
        });
    };

    return (
        <div 
            ref={containerRef} 
            style={{ 
                width: '100%', 
                height: '100%', 
                position: 'relative', 
                overflow: 'hidden',
                borderRadius: '12px',
                border: '1px solid var(--border)'
            }}
        >
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onClick={handleCanvasClick}
                style={{ display: 'block', cursor: isDragging ? 'grabbing' : 'grab' }}
            />
            {boardData && (
                <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', gap: '8px' }}>
                    <button
                        onClick={handleReset}
                        style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: 'var(--text-h)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backdropFilter: 'blur(4px)',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                    >
                        Center Fit
                    </button>
                    <div
                        style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            backdropFilter: 'blur(4px)'
                        }}
                    >
                        Zoom: {Math.round(scale * 10)}%
                    </div>
                </div>
            )}
        </div>
    );
}
