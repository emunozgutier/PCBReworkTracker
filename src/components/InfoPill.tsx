import React from 'react';
import { FONTS } from '../store/useStyles';

interface InfoPillProps {
    text: string;
    color?: string;
    min_width?: number;
}

export function InfoPill({ text, color = 'var(--text)', min_width }: InfoPillProps) {
    const style: React.CSSProperties = {
        fontFamily: FONTS.monospace,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: color,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2px 8px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
    };

    if (min_width) {
        style.minWidth = `${min_width}ch`;
    }

    return (
        <span style={style} title={text}>
            {text}
        </span>
    );
}
