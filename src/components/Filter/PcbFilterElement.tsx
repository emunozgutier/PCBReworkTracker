import React from 'react';
import './PcbFilterElement.css';
import { useAppState } from '../../store/useAppState';
import { FilterScrollBar } from './FilterScrollBar';

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
            <div className="pfe-mobile">
                <button
                    className="pfe-mobile-btn"
                    onClick={(e) => { e.stopPropagation(); setIsElementExpanded(!isElementExpanded); }}
                >
                    <div className="pfe-mobile-btn-inner">
                        <span className="pfe-mobile-title">{title}</span>
                        {activeCount > 0 && (
                            <span className="pfe-mobile-count">#{activeCount}</span>
                        )}
                    </div>
                    <span className={`pfe-mobile-chevron${isElementExpanded ? ' pfe-mobile-chevron--expanded' : ''}`}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </span>
                </button>

                {isElementExpanded && (
                    <div className="pfe-mobile-body">
                        {React.Children.map(children, (child: any) => {
                            if (!child) return null;
                            const optionValue = child.props.value;
                            const isInValue = value.includes(optionValue);
                            const isChecked = exclusion ? !isInValue : isInValue;
                            return (
                                <div
                                    className={`pfe-mobile-option${isChecked ? ' pfe-mobile-option--checked' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        let newVal = [...value];
                                        if (isInValue) {
                                            newVal = newVal.filter(v => v !== optionValue);
                                        } else {
                                            newVal.push(optionValue);
                                        }
                                        onChange(newVal);
                                    }}
                                >
                                    <span className="pfe-mobile-option-label">{child.props.children}</span>
                                    <div className={`pfe-mobile-check${isChecked ? ' pfe-mobile-check--checked' : ''}`}>
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
                            <button className="pfe-mobile-clear" onClick={() => onChange([])}>
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
            className="pfe-desktop"
            style={{ width }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header — identical FilterCheckItemRow with amber checkbox + border separator */}
            <div
                className="pfe-header-wrap"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
                <FilterCheckItemRow
                    optionValue="__master__"
                    label={
                        <span className="pfe-title" style={{
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
            <FilterScrollBar className="pfe-item-list">
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
            </FilterScrollBar>
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

    const rowClasses = [
        'fcir-row',
        interactive ? 'fcir-row--interactive' : '',
        interactive && hovered ? 'fcir-row--hovered' : '',
        interactive && isChecked ? 'fcir-row--checked' : '',
    ].filter(Boolean).join(' ');

    const labelClasses = [
        'fcir-label',
        interactive && isChecked ? 'fcir-label--interactive-checked' : '',
        interactive && !isChecked && !noStrikethrough ? 'fcir-label--interactive-unchecked' : '',
    ].filter(Boolean).join(' ');

    return (
        <div
            className={rowClasses}
            onClick={interactive ? onToggle : undefined}
            onMouseEnter={interactive ? () => setHovered(true) : undefined}
            onMouseLeave={interactive ? () => setHovered(false) : undefined}
        >
            {/* Checkbox — always reserves space; invisible when not hovered */}
            <div
                className={`fcir-checkbox${showCheckbox ? ' fcir-checkbox--visible' : ''}`}
                style={{
                    border: `1.5px solid ${isChecked ? color : 'rgba(255,255,255,0.25)'}`,
                    backgroundColor: isChecked ? color : 'transparent',
                }}
            >
                {isChecked && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </div>

            {/* Label */}
            <span className={labelClasses}>
                {label}
            </span>
        </div>
    );
}
