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

export function BrdLoadingOverlay({ steps, currentStep, filename }: BrdLoadingOverlayProps) {
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
                    <div
                        className="brd-progress-fill"
                        style={{ width: `${Math.round((currentStep / steps.length) * 100)}%` }}
                    />
                </div>
                <span className="brd-progress-pct">
                    {Math.round((currentStep / steps.length) * 100)}%
                </span>

                {/* Step checklist */}
                <ul className="brd-step-list">
                    {steps.map((step, idx) => {
                        const done = idx < currentStep;
                        const active = idx === currentStep;
                        const pending = idx > currentStep;
                        return (
                            <li
                                key={step.id}
                                className={[
                                    'brd-step',
                                    done ? 'brd-step--done' : '',
                                    active ? 'brd-step--active' : '',
                                    pending ? 'brd-step--pending' : '',
                                ].join(' ')}
                            >
                                <span className="brd-step-icon">
                                    {done ? CHECK_ICON : active ? SPINNER_ICON : (
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="9" />
                                        </svg>
                                    )}
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
