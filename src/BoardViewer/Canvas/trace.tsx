import type { BoardData } from '../parser';

function hexToRgba(hex: string, alpha: number): string {
    // If it's already rgba or rgb, return as is
    if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const drawSignals = (
    ctx: CanvasRenderingContext2D,
    signals: BoardData['signals'],
    targetLayer: number,
    selectedItem: { type: 'element' | 'net'; name: string } | null,
    layerColor?: string
) => {
    const isTop = targetLayer === 1;
    const baseColor = layerColor || (isTop ? '#ef4444' : '#3b82f6');
    ctx.strokeStyle = hexToRgba(baseColor, 0.65);

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
            if (poly.layer === targetLayer) {
                ctx.fillStyle = isHighlightedNet 
                    ? 'rgba(192, 132, 252, 0.25)' 
                    : hexToRgba(baseColor, 0.12);
                
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
                    : hexToRgba(baseColor, 0.3);
                ctx.stroke();
            }
        });

        // Draw tracks/wires for this layer/signal
        sig.wires.forEach(wire => {
            if (wire.layer === targetLayer) {
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
// force reload
