import React from 'react';

interface PcbFilterElementProps {
    title: string;
    value: string[];
    onChange: (selected: string[]) => void;
    width?: string;
    children: React.ReactNode;
}

export function PcbFilterElement({ title, value, onChange, width = '110px', children }: PcbFilterElementProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: width, minWidth: width, flexShrink: 0 }}>
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
            <select 
                multiple 
                value={value}
                onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    onChange(selected);
                }}
                style={{ 
                    width: '100%', 
                    height: '140px', 
                    padding: '6px', 
                    borderRadius: '4px', 
                    backgroundColor: 'var(--bg-panel)', 
                    border: '1px solid var(--border-color)', 
                    color: 'var(--text)', 
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem'
                }}
            >
                {children}
            </select>
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
