import React from 'react';

interface FormGroupProps {
    title: React.ReactNode;
    children: React.ReactNode;
}

export function FormGroup({ title, children }: FormGroupProps) {
    return (
        <fieldset style={{ 
            border: '2px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            borderRadius: '10px', 
            padding: '20px 16px 16px 16px', 
            margin: '12px 0 20px 0',
            backgroundColor: 'var(--bg-panel)',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box',
            minWidth: 0
        }}>
            <legend style={{ 
                padding: '0 8px', 
                fontWeight: 600, 
                color: 'var(--accent)',
                fontSize: '1.2rem',
                backgroundColor: 'var(--bg-element)',
                borderRadius: '8px',
                border: '2px solid rgba(255, 255, 255, 0.1)'
            }}>
                {title}
            </legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {children}
            </div>
        </fieldset>
    );
}
