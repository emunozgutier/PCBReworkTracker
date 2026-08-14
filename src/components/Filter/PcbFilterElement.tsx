import React from 'react';

import { useAppState } from '../../store/useAppState';

interface PcbFilterElementProps {
    title: string;
    value: string[];
    onChange: (selected: string[]) => void;
    width?: string;
    /**
     * exclusion mode — value[] holds the EXCLUDED items.
     * checked  = NOT in value → board is shown
     * unchecked = IN value   → board is hidden
     * value=[] → nothing excluded → all boards visible
     */
    exclusion?: boolean;
    children: React.ReactNode;
}

export function PcbFilterElement({ title, value, onChange, width = 'auto', exclusion = false, children }: PcbFilterElementProps) {
    const isMobile = useAppState(state => state.isMobile);
    const [isElementExpanded, setIsElementExpanded] = React.useState(false);

    if (isMobile) {
        const activeCount = value ? value.length : 0;
        return (
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '100%', 
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.01)',
                boxSizing: 'border-box'
            }}>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsElementExpanded(!isElementExpanded); }}
                    style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{title}</span>
                        {activeCount > 0 && (
                            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>
                                #{activeCount}
                            </span>
                        )}
                    </div>
                    <span style={{ 
                        transition: 'transform 0.2s', 
                        transform: isElementExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </span>
                </button>

                {isElementExpanded && (
                    <div style={{
                        padding: '8px 12px',
                        borderTop: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        maxHeight: '180px',
                        overflowY: 'auto',
                        backgroundColor: 'rgba(0,0,0,0.15)',
                        boxSizing: 'border-box'
                    }}>
                        {React.Children.map(children, (child: any) => {
                            if (!child) return null;
                            const optionValue = child.props.value;
                            const isInValue = value.includes(optionValue);
                            // In exclusion mode: being IN value means EXCLUDED (unchecked).
                            // In normal mode: being IN value means SELECTED (checked).
                            const isChecked = exclusion ? !isInValue : isInValue;
                            return (
                                <div 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Toggle the item in/out of the value list
                                        let newVal = [...value];
                                        if (isInValue) {
                                            newVal = newVal.filter(v => v !== optionValue);
                                        } else {
                                            newVal.push(optionValue);
                                        }
                                        onChange(newVal);
                                    }}
                                    style={{
                                        padding: '6px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                                        color: isChecked ? 'var(--accent)' : 'var(--text)',
                                        userSelect: 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '8px'
                                    }}
                                >
                                    <span style={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {child.props.children}
                                    </span>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: `1.5px solid ${isChecked ? 'var(--accent)' : 'var(--text-muted)'}`,
                                        borderRadius: '3px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: isChecked ? 'var(--accent)' : 'transparent',
                                        flexShrink: 0
                                    }}>
                                        {isChecked && (
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {value && value.length > 0 && (
                            <button 
                                onClick={() => onChange([])}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    color: 'var(--accent)', 
                                    fontSize: '0.75rem', 
                                    cursor: 'pointer',
                                    padding: '8px 0 4px 8px',
                                    alignSelf: 'flex-start',
                                    fontWeight: 600
                                }}
                            >
                                {exclusion ? 'Show All' : 'Clear All'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ── Desktop ───────────────────────────────────────────────────────────────
    /** Sentinel stored in value[] to represent "all items explicitly deselected". */
    const NONE = '__NONE__';

    const [isHovered, setIsHovered] = React.useState(false);

    const allItems: { optionValue: string; label: React.ReactNode }[] = [];
    React.Children.forEach(children, (child: any) => {
        if (!child) return;
        allItems.push({ optionValue: child.props.value, label: child.props.children });
    });

    // "All deselected" state: value contains only the sentinel (no boards pass the filter)
    const isDeselectedAll = value.length === 1 && value[0] === NONE;
    // Master is "checked" (all items on) when value=[] (default implicit-all) or all explicitly included
    const masterChecked = !exclusion
        ? value.length === 0 || allItems.every(i => value.includes(i.optionValue))
        : value.length === 0; // exclusion: checked = nothing excluded

    const handleToggle = (optionValue: string) => {
        if (exclusion) {
            const isExcluded = value.includes(optionValue);
            if (isExcluded) {
                onChange(value.filter(v => v !== optionValue));
            } else {
                onChange([...value, optionValue]);
            }
        } else if (isDeselectedAll) {
            // Coming from "all deselected" — select just this one item
            onChange([optionValue]);
        } else if (value.length === 0) {
            // Implicit-all → unchecking one item means "show everything except this"
            const next = allItems.map(i => i.optionValue).filter(v => v !== optionValue);
            // If there was only one item, result is [] which would cycle back to "all selected"
            // Use sentinel instead to properly represent "all deselected"
            onChange(next.length === 0 ? [NONE] : next);
        } else {
            const isCurrentlySelected = value.includes(optionValue);
            if (isCurrentlySelected) {
                const next = value.filter(v => v !== optionValue);
                // If we just unchecked the last real item, move to "all deselected" state
                onChange(next.length === 0 ? [NONE] : next);
            } else {
                onChange([...value, optionValue]);
            }
        }
    };

    // Simplified toggle without event param — used by FilterCheckItemRow's onToggle
    const handleMasterToggle = () => {
        if (exclusion) {
            onChange(value.length === 0 ? allItems.map(i => i.optionValue) : []);
        } else {
            onChange(masterChecked ? [NONE] : []);
        }
    };

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => { setIsHovered(false); setHeaderHovered(false); }}
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: width,
                minWidth: '120px',
                flexShrink: 0,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.015)',
                overflow: 'hidden',
            }}>
            {/* Header — identical FilterCheckItemRow with amber checkbox + border separator */}
            <div
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <FilterCheckItemRow
                    optionValue="__master__"
                    label={
                        <span style={{
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            fontWeight: isHovered ? (masterChecked ? 600 : 400) : 400,
                        }}>
                            {title}
                        </span>
                    }
                    isChecked={masterChecked}
                    showCheckbox={isHovered}
                    onToggle={handleMasterToggle}
                    checkboxColor="#f59e0b"
                    noStrikethrough
                />
            </div>


            {/* Item list — checkboxes visible only on hover */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                maxHeight: '160px',
                overflowY: 'auto',
                padding: '6px 0',
            }}>
                {allItems.map(({ optionValue, label }) => {
                    const isExcluded = value.includes(optionValue);
                    // exclusion: checked = NOT excluded
                    // normal: checked = implicit-all (value=[]) OR explicitly in value; NOT when isDeselectedAll
                    const isChecked = exclusion
                        ? !isExcluded
                        : !isDeselectedAll && (value.length === 0 || value.includes(optionValue));
                    return (
                        <FilterCheckItemRow
                            key={optionValue}
                            optionValue={optionValue}
                            label={label}
                            isChecked={isChecked}
                            showCheckbox={isHovered}
                            onToggle={() => handleToggle(optionValue)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

// ── Internal rendered row ─────────────────────────────────────────────────────
interface FilterCheckItemRowProps {
    optionValue: string;
    label: React.ReactNode;
    isChecked: boolean;
    showCheckbox?: boolean;
    onToggle?: () => void;
    /** Override the checkbox fill/border color (default: var(--accent) purple) */
    checkboxColor?: string;
    /** When true the label never gets a strikethrough, even when unchecked */
    noStrikethrough?: boolean;
}

function FilterCheckItemRow({ label, isChecked, showCheckbox = true, onToggle, checkboxColor, noStrikethrough }: FilterCheckItemRowProps) {
    const [hovered, setHovered] = React.useState(false);
    const interactive = showCheckbox && !!onToggle;
    const color = checkboxColor ?? 'var(--accent)';

    return (
        <div
            onClick={interactive ? onToggle : undefined}
            onMouseEnter={interactive ? () => setHovered(true) : undefined}
            onMouseLeave={interactive ? () => setHovered(false) : undefined}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 8px',
                borderRadius: '5px',
                cursor: interactive ? 'pointer' : 'default',
                userSelect: 'none',
                background: interactive && hovered
                    ? 'rgba(255,255,255,0.04)'
                    : interactive && isChecked
                    ? 'rgba(99,102,241,0.06)'
                    : 'transparent',
                transition: 'background 0.15s ease',
            }}
        >
            {/* Checkbox — always reserves space; invisible when not hovered */}
            <div
                style={{
                    width: '15px',
                    height: '15px',
                    borderRadius: '3px',
                    border: `1.5px solid ${isChecked ? color : 'rgba(255,255,255,0.25)'}`,
                    backgroundColor: isChecked ? color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    visibility: showCheckbox ? 'visible' : 'hidden',
                }}
            >
                {isChecked && (
                    <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </div>

            {/* Label */}
            <span
                style={{
                    fontSize: '0.82rem',
                    color: showCheckbox
                        ? (isChecked ? 'var(--text-h)' : 'var(--text-muted)')
                        : 'var(--text)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'color 0.15s ease, text-decoration-color 0.15s ease',
                    fontWeight: showCheckbox ? (isChecked ? 500 : 400) : 400,
                    textDecoration: (!isChecked && !noStrikethrough) ? 'line-through' : 'none',
                    textDecorationColor: 'var(--text-muted)',
                }}
            >
                {label}
            </span>
        </div>
    );
}
