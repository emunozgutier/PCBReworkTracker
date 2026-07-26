import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from './client';
import { useAppState } from '../store/useAppState';
import { useOwnerStore } from '../store/useOwnerStore';
import { ShieldCheck, RefreshCw, Key } from 'lucide-react';
import './LoginView.css';

export function LoginView() {
    const { 
        loading, 
        error, 
        verifyTotp, 
        clearError 
    } = useAuthStore();
    const { owners, fetchOwners } = useOwnerStore();

    const [username, setUsername] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
    const isVerifyingRef = useRef(false);

    // Clear error on mount and fetch owners
    useEffect(() => {
        clearError();
        fetchOwners();
    }, [clearError, fetchOwners]);

    // Auto-verify once 6 digits are fully entered
    useEffect(() => {
        const verifyAndRedirect = async () => {
            if (username && otpDigits.every(digit => digit !== '') && !loading && !isVerifyingRef.current) {
                isVerifyingRef.current = true;
                const code = otpDigits.join('');
                
                // Clear digits immediately to prevent duplicate triggers
                setOtpDigits(['', '', '', '', '', '']);

                try {
                    const success = await verifyTotp(username, code);
                    if (success) {
                        useAppState.getState().setPage('projects');
                    } else {
                        digitRefs.current[0]?.focus();
                    }
                } finally {
                    isVerifyingRef.current = false;
                }
            }
        };
        verifyAndRedirect();
    }, [otpDigits, username, verifyTotp, loading]);

    // Handle digit typing
    const handleDigitChange = (index: number, value: string) => {
        // Only accept numbers
        if (value && !/^\d$/.test(value)) return;

        const newDigits = [...otpDigits];
        newDigits[index] = value;
        setOtpDigits(newDigits);

        // Auto focus next box if we typed a digit
        if (value !== '' && index < 5) {
            digitRefs.current[index + 1]?.focus();
        }
    };

    // Handle backspaces
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (otpDigits[index] === '' && index > 0) {
                const newDigits = [...otpDigits];
                newDigits[index - 1] = '';
                setOtpDigits(newDigits);
                digitRefs.current[index - 1]?.focus();
            } else {
                const newDigits = [...otpDigits];
                newDigits[index] = '';
                setOtpDigits(newDigits);
            }
        }
    };

    // Handle pasting the whole 6-digit code
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pasteData)) {
            const digits = pasteData.split('');
            setOtpDigits(digits);
            digitRefs.current[5]?.focus();
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-glass-panel">
                <div className="login-brand">
                    <div className="login-logo-circle">
                        <ShieldCheck className="logo-icon animate-bounce-slow" size={32} />
                    </div>
                    <h2>PCB Rework Tracker</h2>
                    <p className="subtitle">Secure Login</p>
                </div>

                {error && (
                    <div className="login-error-toast" onClick={clearError}>
                        <span>{error}</span>
                    </div>
                )}

                <div className="login-form">
                    <div className="input-group">
                        <label htmlFor="username">Select User</label>
                        <div className="input-with-icon">
                            <Key className="input-icon" size={18} style={{ color: 'var(--text-secondary)' }} />
                            {owners && owners.length > 0 ? (
                                <select
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-app)',
                                        color: 'var(--text-main)',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        appearance: 'auto'
                                    }}
                                >
                                    <option value="">-- Select Your Name --</option>
                                    {owners.map(o => (
                                        <option key={o.id} value={o.username} style={{ background: 'var(--bg-panel)', color: 'var(--text-main)' }}>
                                            {o.name} ({o.username})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Username"
                                    required
                                    disabled={loading}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '12px 12px 12px 40px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--bg-app)',
                                        color: 'var(--text-main)',
                                        borderRadius: '8px',
                                        fontSize: '0.95rem',
                                        outline: 'none'
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    <div className="otp-digit-container" style={{ marginTop: '20px' }}>
                        <label className="otp-label" style={{ marginBottom: '8px', display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>6-Digit Authenticator Code</label>
                        <div className="otp-boxes">
                            {otpDigits.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => { digitRefs.current[idx] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    onPaste={handlePaste}
                                    disabled={loading || !username}
                                    placeholder="-"
                                    style={{
                                        opacity: username ? 1 : 0.5,
                                        cursor: username ? 'text' : 'not-allowed'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {loading && (
                        <div className="otp-verifying-loader" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', color: 'var(--text-secondary)' }}>
                            <RefreshCw className="spinner" size={18} />
                            <span>Authorizing session...</span>
                        </div>
                    )}

                    <p className="login-note" style={{ marginTop: '20px' }}>
                        Open your Authenticator app (e.g., Google Authenticator, Authy) to view your 6-digit code. Sessions are valid for 3 days.
                    </p>
                </div>
            </div>
        </div>
    );
}
