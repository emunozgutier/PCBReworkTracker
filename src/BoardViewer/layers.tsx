import { Eye, EyeOff } from 'lucide-react';

export interface LayerDef {
    number: number;
    name: string;
    color: string;
    description: string;
}

export const LAYERS: LayerDef[] = [
    { number: 20, name: 'Dimension (Outline)', color: '#10b981', description: 'Board outline and dimensions' },
    { number: 1, name: 'Top Copper', color: '#ef4444', description: 'Traces and components on Top layer' },
    { number: 16, name: 'Bottom Copper', color: '#3b82f6', description: 'Traces and components on Bottom layer' },
    { number: 21, name: 'Silkscreen Top', color: '#f3f4f6', description: 'Top markings and component outlines' },
    { number: 22, name: 'Silkscreen Bottom', color: '#a855f7', description: 'Bottom markings and component outlines' },
    { number: 45, name: 'Pads & Vias', color: '#f59e0b', description: 'Through-hole pads and connection vias' },
];

interface LayersProps {
    visibleLayers: Set<number>;
    onToggleLayer: (layerNumber: number) => void;
    onToggleAll: (visible: boolean) => void;
}

export function BoardLayers({ visibleLayers, onToggleLayer, onToggleAll }: LayersProps) {
    const allVisible = LAYERS.every(l => visibleLayers.has(l.number));
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h4
                    style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'var(--text-muted)'
                    }}
                >
                    PCB Layers
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => onToggleAll(!allVisible)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent)',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0,
                        }}
                    >
                        {allVisible ? 'Hide All' : 'Show All'}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {LAYERS.map((layer) => {
                    const isVisible = visibleLayers.has(layer.number);
                    return (
                        <div
                            key={layer.number}
                            onClick={() => onToggleLayer(layer.number)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px 12px',
                                background: isVisible ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                userSelect: 'none'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.background = isVisible ? 'rgba(255, 255, 255, 0.02)' : 'transparent';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                <div
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '3px',
                                        background: layer.color,
                                        border: layer.number === 21 ? '1px solid #9ca3af' : 'none',
                                        flexShrink: 0
                                    }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {layer.name}
                                    </span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {layer.description}
                                    </span>
                                </div>
                            </div>
                            <div style={{ color: isVisible ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
