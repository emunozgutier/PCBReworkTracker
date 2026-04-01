import React from 'react';

interface PcbFilterElementProps {
    title: string;
    value: string[];
    onChange: (selected: string[]) => void;
    width?: string;
    children: React.ReactNode;
}

export function PcbFilterElement({ title, value, onChange, width = 'auto', children }: PcbFilterElementProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: width, minWidth: '110px', flexShrink: 0 }}>
            <span style={{ 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: 'var(--text-muted)',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                minHeight: '2.4em',
                lineHeight: 1.2
            }}>
                {title}
            </span>
            <div style={{
                width: '100%',
                height: '140px',
                overflowY: 'auto',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                backgroundColor: 'var(--bg-panel)',
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
            }}>
                {React.Children.map(children, (child: any) => {
                    if (!child) return null;
                    const optionValue = child.props.value;
                    const isSelected = value.includes(optionValue);
                    return (
                        <div 
                            onClick={(e) => {
                                e.preventDefault();
                                let newVal = [...value];
                                if (isSelected) {
                                    newVal = newVal.filter(v => v !== optionValue);
                                } else {
                                    newVal.push(optionValue);
                                }
                                onChange(newVal);
                            }}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                backgroundColor: isSelected ? 'var(--accent)' : 'transparent',
                                color: isSelected ? '#fff' : 'var(--text)',
                                userSelect: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {child.props.children}
                        </div>
                    );
                })}
            </div>
            <button 
                onClick={() => onChange([])}
                style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--accent)', 
                    fontSize: '0.75rem', 
                    cursor: value && value.length > 0 ? 'pointer' : 'default',
                    padding: '2px 0 0 0',
                    alignSelf: 'flex-start',
                    fontWeight: 500,
                    visibility: value && value.length > 0 ? 'visible' : 'hidden'
                }}
                disabled={!value || value.length === 0}
            >
                Clear
            </button>
        </div>
    );
}
