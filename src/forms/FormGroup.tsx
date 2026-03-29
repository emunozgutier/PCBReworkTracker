import React from 'react';

interface FormGroupProps {
    title: string;
    children: React.ReactNode;
}

export function FormGroup({ title, children }: FormGroupProps) {
    return (
        <fieldset style={{ 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            padding: '20px 16px 16px 16px', 
            marginBottom: '20px',
            backgroundColor: 'var(--bg-panel)',
            position: 'relative',
            marginTop: '12px'
        }}>
            <legend style={{ 
                padding: '0 8px', 
                fontWeight: 600, 
                color: 'var(--accent)',
                fontSize: '1.2rem',
                backgroundColor: 'var(--bg-element)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)'
            }}>
                {title}
            </legend>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {children}
            </div>
        </fieldset>
    );
}
