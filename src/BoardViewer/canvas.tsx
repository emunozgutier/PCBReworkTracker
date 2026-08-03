import React, { useRef, useState, useEffect } from 'react';
import type { BoardData } from './parser';
import { useBoardViewer } from '../store/useBoardViewer';
import {
    drawGrid,
    drawVias,
    drawElementPads,
    drawElementSilkscreen,
    drawSelectionHighlight
} from './Canvas/Components';
import { drawSignals } from './Canvas/trace';

interface CanvasProps {
    boardData: BoardData | null;
    onSelectElement: (name: string) => void;
}

export function BoardCanvas({ boardData, onSelectElement }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });

    const {
        visibleLayers,
        selectedItem,
        pan,
        scale,
        setPan,
        setScale
    } = useBoardViewer();

    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Handle container resizing to make canvas responsive
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
    }, [boardData, canvasSize.width, canvasSize.height, setScale, setPan]);

    // Center on selected element when it changes
    useEffect(() => {
        if (!boardData || !selectedItem || selectedItem.type !== 'element') return;
        const el = boardData.elements.find(e => e.name === selectedItem.name);
        if (!el) return;

        const targetPanX = canvasSize.width / 2 - el.x * scale;
        const targetPanY = canvasSize.height / 2 - (-el.y) * scale;
        
        setPan({ x: targetPanX, y: targetPanY });
    }, [selectedItem, boardData, canvasSize.width, canvasSize.height, scale, setPan]);

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
            drawSignals(ctx, boardData.signals, 16, selectedItem);
        }
        if (visibleLayers.has(1)) {
            drawSignals(ctx, boardData.signals, 1, selectedItem);
        }

        // 2. Draw Pads & Vias (Layer 45)
        if (visibleLayers.has(45)) {
            drawVias(ctx, boardData.signals, selectedItem);
            drawElementPads(ctx, boardData.elements, visibleLayers);
        }

        // 3. Draw Silkscreen Bottom (Layer 22/26)
        if (visibleLayers.has(22)) {
            drawElementSilkscreen(ctx, boardData.elements, true, scale);
        }

        // 4. Draw Silkscreen Top (Layer 21/25)
        if (visibleLayers.has(21)) {
            drawElementSilkscreen(ctx, boardData.elements, false, scale);
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
