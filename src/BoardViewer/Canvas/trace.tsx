import type { BoardData } from '../parser';

export const drawSignals = (
    ctx: CanvasRenderingContext2D,
    signals: BoardData['signals'],
    targetLayer: number,
    selectedItem: { type: 'element' | 'net'; name: string } | null
) => {
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
