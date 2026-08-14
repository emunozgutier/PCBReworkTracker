import React from 'react';
import './BrdLoadingOverlay.css';

export interface LoadStep {
    id: string;
    label: string;
}

interface BrdLoadingOverlayProps {
    steps: LoadStep[];
    /** Index of the step currently in progress (0-based). All steps before it are done. */
    currentStep: number;
    filename?: string;
}

const CHECK_ICON = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const SPINNER_ICON = (
    <svg className="brd-step-spinner" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 2 a10 10 0 0 1 10 10" />
    </svg>
);

const PENDING_ICON = (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="9" />
    </svg>
);

export function BrdLoadingOverlay({ steps, currentStep, filename }: BrdLoadingOverlayProps) {
    // Auto-scroll: keep the active step visible by scrolling it into view
    const activeRef = React.useRef<HTMLLIElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);

    React.useEffect(() => {
        if (!activeRef.current || !listRef.current) return;
        const list = listRef.current;
        const item = activeRef.current;
        // Scroll so the active step is at the bottom of the visible area
        const itemBottom = item.offsetTop + item.offsetHeight;
        const listVisible = list.clientHeight;
        if (itemBottom > list.scrollTop + listVisible) {
            list.scrollTop = itemBottom - listVisible + 8;
        }
    }, [currentStep]);

    const pct = Math.round((currentStep / steps.length) * 100);

    return (
        <div className="brd-loading-overlay">
            <div className="brd-loading-card">

                {/* Animated PCB icon */}
                <div className="brd-loading-icon">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <rect x="4" y="4" width="32" height="32" rx="4" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" className="brd-icon-border" />
                        <rect x="10" y="10" width="8" height="8" rx="1" fill="var(--accent)" opacity="0.25" />
                        <rect x="22" y="10" width="8" height="8" rx="1" fill="var(--accent)" opacity="0.25" />
                        <rect x="10" y="22" width="8" height="8" rx="1" fill="var(--accent)" opacity="0.25" />
                        <rect x="22" y="22" width="8" height="8" rx="1" fill="var(--accent)" opacity="0.5" />
                        <line x1="14" y1="18" x2="14" y2="22" stroke="var(--accent)" strokeWidth="1.2" opacity="0.6" />
                        <line x1="26" y1="18" x2="26" y2="22" stroke="var(--accent)" strokeWidth="1.2" opacity="0.6" />
                        <line x1="18" y1="14" x2="22" y2="14" stroke="var(--accent)" strokeWidth="1.2" opacity="0.6" />
                        <line x1="18" y1="26" x2="22" y2="26" stroke="var(--accent)" strokeWidth="1.2" opacity="0.6" />
                    </svg>
                </div>

                {/* Filename */}
                {filename && (
                    <p className="brd-loading-filename">{filename}</p>
                )}

                <h3 className="brd-loading-title">Opening Board File</h3>

                {/* Progress bar */}
                <div className="brd-progress-track">
                    <div className="brd-progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="brd-progress-pct">{pct}%</span>

                {/* Step checklist — scrollable, top clips away as steps complete */}
                <ul className="brd-step-list" ref={listRef}>
                    {steps.map((step, idx) => {
                        const done    = idx < currentStep;
                        const active  = idx === currentStep;
                        const pending = idx > currentStep;
                        return (
                            <li
                                key={step.id}
                                ref={active ? activeRef : undefined}
                                className={[
                                    'brd-step',
                                    done    ? 'brd-step--done'    : '',
                                    active  ? 'brd-step--active'  : '',
                                    pending ? 'brd-step--pending'  : '',
                                ].filter(Boolean).join(' ')}
                            >
                                <span className="brd-step-icon">
                                    {done ? CHECK_ICON : active ? SPINNER_ICON : PENDING_ICON}
                                </span>
                                <span className="brd-step-label">{step.label}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
