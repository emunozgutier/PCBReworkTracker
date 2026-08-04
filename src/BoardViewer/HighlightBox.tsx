interface HighlightBoxProps {
    x: number;
    y: number;
    width: number;
    height: number;
    angle: number;
    scale: number;
    componentName: string;
}

export function HighlightBox({ x, y, width, height, angle, scale, componentName }: HighlightBoxProps) {
    const boxWidth = width * scale;
    const boxHeight = height * scale;

    return (
        <>
            <style>
                {`
                @keyframes borderRainbow {
                    0% { border-color: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.6); }
                    16% { border-color: #f97316; box-shadow: 0 0 12px rgba(249, 115, 22, 0.6); }
                    33% { border-color: #eab308; box-shadow: 0 0 12px rgba(234, 179, 8, 0.6); }
                    50% { border-color: #22c55e; box-shadow: 0 0 12px rgba(34, 197, 94, 0.6); }
                    66% { border-color: #06b6d4; box-shadow: 0 0 12px rgba(6, 182, 212, 0.6); }
                    83% { border-color: #3b82f6; box-shadow: 0 0 12px rgba(59, 130, 246, 0.6); }
                    100% { border-color: #a855f7; box-shadow: 0 0 12px rgba(168, 85, 247, 0.6); }
                }
                `}
            </style>
            <div
                key={componentName} // Resets the 3s CSS animation whenever a new component is highlighted
                style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    transform: `translate(-50%, -50%) rotate(${-angle}deg)`,
                    width: `${boxWidth}px`,
                    height: `${boxHeight}px`,
                    border: '3px solid #a855f7',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    animation: 'borderRainbow 5s linear forwards',
                    boxSizing: 'border-box',
                    zIndex: 10,
                    transition: 'left 0.1s ease, top 0.1s ease'
                }}
            />
        </>
    );
}
