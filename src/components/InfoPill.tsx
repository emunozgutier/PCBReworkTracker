import React from 'react';
import { FONTS } from '../store/useStyles';

interface InfoPillProps {
    text: string;
    color?: string;
    bg?: string;
    border?: string;
    min_width?: number;
    title?: string;
    center?: boolean;
    style?: React.CSSProperties;
}

export function InfoPill({ text, color = 'var(--text)', bg, border, min_width, title, center = false, style: customStyle }: InfoPillProps) {
    const style: React.CSSProperties = {
        fontFamily: FONTS.monospace,
        fontSize: '0.75rem',
        fontWeight: 600,
        color: color,
        background: bg || 'rgba(255, 255, 255, 0.05)',
        border: border || '1px solid rgba(255, 255, 255, 0.1)',
        padding: '2px 8px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        whiteSpace: 'pre',
        boxSizing: 'border-box',
        ...customStyle
    };

    if (min_width) {
        style.minWidth = `${min_width}ch`;
    }

    const strText = String(text ?? '');
    let displayText = strText;
    if (min_width && strText.length < min_width) {
        const padLength = min_width - strText.length;
        if (center) {
            const padStart = Math.floor(padLength / 2);
            const padEnd = padLength - padStart;
            displayText = ' '.repeat(padStart) + strText + ' '.repeat(padEnd);
        } else {
            displayText = strText + ' '.repeat(padLength);
        }
    }

    return (
        <span style={style} title={title || text}>
            {displayText}
        </span>
    );
}

