import React from 'react';
import './FilterScrollBar.css';

interface FilterScrollBarProps {
    /** Max height before scroll kicks in. Defaults to 160px (desktop item list height). */
    maxHeight?: string | number;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}

/**
 * Thin-scrollbar wrapper used by filter item lists.
 * Applies the app's indigo accent scrollbar that matches FilterCheckItemRow styling.
 */
export function FilterScrollBar({ maxHeight = '160px', className = '', style, children }: FilterScrollBarProps) {
    return (
        <div
            className={`filter-scrollbar ${className}`.trim()}
            style={{ maxHeight, ...style }}
        >
            {children}
        </div>
    );
}
