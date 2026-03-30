import React from 'react';

interface PcbFilterGroupProps {
    title: string;
    color: string;
    children: React.ReactNode;
}

export function PcbFilterGroup({ title, color, children }: PcbFilterGroupProps) {
    return (
        <fieldset style={{
            border: `2px solid ${color}`,
            borderRadius: '8px',
            padding: '12px 16px 16px 16px',
            margin: '0',
            display: 'flex',
            gap: '16px',
            flexShrink: 0,
            backgroundColor: 'var(--bg-secondary, transparent)',
            position: 'relative'
        }}>
            <legend style={{ 
                color: color, 
                fontWeight: 'bold', 
                padding: '0 8px',
                fontSize: '0.9rem',
                marginLeft: '8px'
            }}>
                {title}
            </legend>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {children}
            </div>
        </fieldset>
    );
}
