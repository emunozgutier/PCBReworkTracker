import React from 'react';
import './PcbFilterElement.css';
import { useAppState } from '../../store/useAppState';
import { FilterScrollBar } from './FilterScrollBar';

interface PcbFilterElementProps {
    title: React.ReactNode;
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
    threeStateMode?: boolean;
    requiredValue?: string[];
    onRequiredChange?: (selected: string[]) => void;
    children: React.ReactNode;
}

export function PcbFilterElement({ title, value, onChange, width = 'auto', exclusion = false, threeStateMode = false, requiredValue, onRequiredChange, children }: PcbFilterElementProps) {
    const isMobile = useAppState(state => state.isMobile);
    const [isElementExpanded, setIsElementExpanded] = React.useState(false);

    if (isMobile) {
        // For non-exclusion filters: value=[] means "all selected" (implicit-all).
        // A real restriction is active only when value is non-empty.
        // For exclusion filters: value holds excluded items, so activeCount = items excluded.
        const activeCount = value ? value.length : 0;
        // Collect all available option values so we can build the "all items" set.
        const allOptionValues: string[] = [];
        React.Children.forEach(children, (child: any) => {
            if (child) allOptionValues.push(child.props.value);
        });

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
                            
                            if (threeStateMode && requiredValue && onRequiredChange) {
                                const isReq = requiredValue.includes(optionValue);
                                const isExc = value.includes(optionValue);
                                let state: 'ignored' | 'required' | 'excluded' = 'ignored';
                                if (isReq) state = 'required';
                                if (isExc) state = 'excluded';
                                
                                let bg = 'transparent';
                                let border = 'rgba(255,255,255,0.25)';
                                if (state === 'required') {
                                    bg = '#eab308';
                                    border = '#eab308';
                                } else if (state === 'excluded') {
                                    bg = '#ef4444';
                                    border = '#ef4444';
                                }
                                
                                return (
                                    <div
                                        className={`pfe-mobile-option${state !== 'ignored' ? ' pfe-mobile-option--checked' : ''}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (!isReq && !isExc) {
                                                onRequiredChange([...requiredValue, optionValue]);
                                            } else if (isReq) {
                                                onRequiredChange(requiredValue.filter(v => v !== optionValue));
                                                onChange([...value, optionValue]);
                                            } else if (isExc) {
                                                onChange(value.filter(v => v !== optionValue));
                                            }
                                        }}
                                    >
                                        <span className="pfe-mobile-option-label" style={{ textDecoration: state === 'excluded' ? 'line-through' : 'none', opacity: state === 'excluded' ? 0.5 : 1 }}>{child.props.children}</span>
                                        <div 
                                            className="pfe-mobile-check" 
                                            style={{ backgroundColor: bg, border: `1px solid ${border}`, opacity: state !== 'ignored' ? 1 : 0.5 }}
                                            title={state === 'required' ? 'Must have it' : state === 'excluded' ? 'Must NOT have it' : 'Does not matter'}
                                        >
                                            {state === 'required' && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            )}
                                            {state === 'excluded' && (
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            const isInValue = value.includes(optionValue);
                            // Mirror desktop logic:
                            //   exclusion mode  → checked = NOT excluded (not in value)
                            //   normal mode     → checked = implicit-all (value=[]) OR explicitly included
                            const isChecked = exclusion ? !isInValue : (value.length === 0 || isInValue);
                            return (
                                <div
                                    className={`pfe-mobile-option${isChecked ? ' pfe-mobile-option--checked' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (exclusion) {
                                            // Toggle exclusion
                                            let newVal = [...value];
                                            if (isInValue) {
                                                newVal = newVal.filter(v => v !== optionValue);
                                            } else {
                                                newVal.push(optionValue);
                                            }
                                            onChange(newVal);
                                        } else if (value.length === 0) {
                                            // Implicit-all → uncheck one = keep all others selected
                                            onChange(allOptionValues.filter(v => v !== optionValue));
                                        } else {
                                            // Explicit selection
                                            let newVal = [...value];
                                            if (isInValue) {
                                                newVal = newVal.filter(v => v !== optionValue);
                                            } else {
                                                newVal.push(optionValue);
                                            }
                                            onChange(newVal);
                                        }
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
                        {(value && value.length > 0) || (requiredValue && requiredValue.length > 0) ? (
                            <button className="pfe-mobile-clear" onClick={() => {
                                onChange([]);
                                if (onRequiredChange) onRequiredChange([]);
                            }}>
                                {exclusion ? 'Show All' : 'Clear All'}
                            </button>
                        ) : null}
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
    let masterChecked = false;
    if (threeStateMode && requiredValue) {
        masterChecked = value.length === 0 && requiredValue.length === 0;
    } else {
        masterChecked = !exclusion
            ? value.length === 0 || allItems.every(i => value.includes(i.optionValue))
            : value.length === 0; // exclusion: checked = nothing excluded
    }

    const handleToggle = (optionValue: string) => {
        if (threeStateMode && requiredValue && onRequiredChange) {
            // 3-state cycle: ignored -> required -> excluded -> ignored
            const isReq = requiredValue.includes(optionValue);
            const isExc = value.includes(optionValue);
            
            if (!isReq && !isExc) {
                // ignored -> required
                onRequiredChange([...requiredValue, optionValue]);
            } else if (isReq) {
                // required -> excluded
                onRequiredChange(requiredValue.filter(v => v !== optionValue));
                onChange([...value, optionValue]);
            } else if (isExc) {
                // excluded -> ignored
                onChange(value.filter(v => v !== optionValue));
            }
        } else if (exclusion) {
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
        if (threeStateMode && onRequiredChange) {
            // Clear all
            onChange([]);
            onRequiredChange([]);
        } else if (exclusion) {
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
            <FilterScrollBar className="pfe-item-list" visible={isHovered}>
                {allItems.map(({ optionValue, label }) => {
                    if (threeStateMode && requiredValue) {
                        const isReq = requiredValue.includes(optionValue);
                        const isExc = value.includes(optionValue);
                        let state: 'ignored' | 'required' | 'excluded' = 'ignored';
                        if (isReq) state = 'required';
                        if (isExc) state = 'excluded';
                        return (
                            <FilterCheckItemRow
                                key={optionValue}
                                optionValue={optionValue}
                                label={label}
                                state={state}
                                showCheckbox={isHovered}
                                onToggle={() => handleToggle(optionValue)}
                            />
                        );
                    }

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
    isChecked?: boolean;
    state?: 'ignored' | 'required' | 'excluded' | 'checked';
    showCheckbox?: boolean;
    onToggle?: () => void;
    /** Override the checkbox fill/border color (default: var(--accent) purple) */
    checkboxColor?: string;
    /** When true the label never gets a strikethrough, even when unchecked */
    noStrikethrough?: boolean;
}

function FilterCheckItemRow({ label, isChecked, state, showCheckbox = true, onToggle, checkboxColor, noStrikethrough }: FilterCheckItemRowProps) {
    const [hovered, setHovered] = React.useState(false);
    const interactive = showCheckbox && !!onToggle;
    
    // Normalize state vs isChecked
    let activeState = state || (isChecked ? 'checked' : 'ignored');
    
    // Background and border colors
    let bg = 'transparent';
    let border = 'rgba(255,255,255,0.25)';
    const defaultColor = checkboxColor ?? 'var(--accent)';
    
    if (activeState === 'checked') {
        bg = defaultColor;
        border = defaultColor;
    } else if (activeState === 'required') {
        bg = '#eab308'; // yellow-500
        border = '#eab308';
    } else if (activeState === 'excluded') {
        bg = '#ef4444'; // red-500
        border = '#ef4444';
    }

    // Is the visual row "selected" (changes background slightly on hover/active)?
    const isVisualChecked = activeState !== 'ignored';

    const rowClasses = [
        'fcir-row',
        interactive ? 'fcir-row--interactive' : '',
        interactive && hovered ? 'fcir-row--hovered' : '',
        interactive && isVisualChecked ? 'fcir-row--checked' : '',
    ].filter(Boolean).join(' ');

    const isStrikethrough = activeState === 'excluded' || (activeState === 'ignored' && !noStrikethrough && state === undefined && isChecked === false);

    const labelClasses = [
        'fcir-label',
        interactive && isVisualChecked ? 'fcir-label--interactive-checked' : '',
        interactive && isStrikethrough ? 'fcir-label--interactive-unchecked' : '',
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
                    border: `1.5px solid ${border}`,
                    backgroundColor: bg,
                }}
                title={activeState === 'required' ? 'Must have it' : activeState === 'excluded' ? 'Must NOT have it' : 'Does not matter'}
            >
                {activeState === 'checked' && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
                {activeState === 'required' && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                )}
                {activeState === 'excluded' && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
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
