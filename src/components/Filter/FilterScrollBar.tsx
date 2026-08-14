import React from 'react';
import './FilterScrollBar.css';

interface FilterScrollBarProps {
    /** Max height before scroll kicks in. Defaults to 160px (desktop item list height). */
    maxHeight?: string | number;
    /** When false the scrollbar thumb fades out after a short delay. Defaults to true. */
    visible?: boolean;
    /** How long (ms) to wait before hiding the scrollbar after visible becomes false. */
    hideDelay?: number;
    className?: string;
    style?: React.CSSProperties;
    children: React.ReactNode;
}

/**
 * Thin-scrollbar wrapper used by filter item lists.
 * Applies the app's indigo accent scrollbar that matches FilterCheckItemRow styling.
 * - visible=true  → scrollbar appears immediately
 * - visible=false → scrollbar lingers for hideDelay ms, then disappears
 */
export function FilterScrollBar({
    maxHeight = '160px',
    visible = true,
    hideDelay = 800,
    className = '',
    style,
    children,
}: FilterScrollBarProps) {
    // Internal "display visible" state — trails behind the prop on hide, instant on show
    const [displayVisible, setDisplayVisible] = React.useState(visible);
    const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        if (visible) {
            // Show immediately: cancel any pending hide and set visible now
            if (timerRef.current) clearTimeout(timerRef.current);
            setDisplayVisible(true);
        } else {
            // Hide after delay
            timerRef.current = setTimeout(() => setDisplayVisible(false), hideDelay);
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [visible, hideDelay]);

    const hiddenClass = displayVisible ? '' : 'filter-scrollbar--hidden';
    return (
        <div
            className={`filter-scrollbar ${hiddenClass} ${className}`.trim().replace(/\s+/g, ' ')}
            style={{ maxHeight, ...style }}
        >
            {children}
        </div>
    );
}
