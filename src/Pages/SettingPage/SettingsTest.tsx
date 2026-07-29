import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Info, X } from 'lucide-react';
import { PermissionCheckbox } from './PermissionCheckbox';
import '../ViewPages/SettingsView.css';

interface SettingsTestProps {
    onBack: () => void;
}

export function SettingsTest({ onBack }: SettingsTestProps) {
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [testChecked, setTestChecked] = useState(false);

    return (
        <div className="settings-page-wrapper" style={{ padding: '24px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
            <button 
                onClick={onBack}
                className="back-button"
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    background: 'none', 
                    border: 'none', 
                    color: 'var(--text-muted)', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: '24px',
                    padding: 0
                }}
            >
                <ArrowLeft size={16} />
                <span>Back to Settings</span>
            </button>

            <div className="settings-main-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-h)' }}>Checkbox Toggling Test Facility</h2>
                <p className="settings-description" style={{ margin: 0 }}>
                    This environment allows sandbox testing of table matrix click propagation and rendering logic.
                </p>

                <button
                    onClick={() => setIsPopupOpen(true)}
                    className="submit-button"
                    style={{ 
                        margin: '12px 0 0 0', 
                        padding: '12px 24px', 
                        background: 'var(--accent)', 
                        color: 'var(--bg-panel)',
                        fontWeight: 700,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        border: 'none',
                        textAlign: 'center',
                        fontSize: '0.95rem'
                    }}
                >
                    Launch Interactive Test Popup
                </button>
            </div>

            {/* Glassmorphism Modal Popup */}
            {isPopupOpen && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(2, 6, 23, 0.8)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.2s ease-out'
                    }}
                >
                    <div 
                        className="settings-main-card" 
                        style={{ 
                            width: '90%', 
                            maxWidth: '460px', 
                            padding: '30px', 
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <button
                            onClick={() => setIsPopupOpen(false)}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '4px'
                            }}
                            title="Close Popup"
                        >
                            <X size={18} />
                        </button>

                        <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: 'var(--text-h)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle2 size={20} color="var(--accent)" />
                            <span>Checkbox Test Modal</span>
                        </h3>

                        <p className="settings-description" style={{ fontSize: '0.85rem', marginBottom: '24px' }}>
                            Click the matrix checkbox below to toggle its status. This validates pointer-events bubbling and state re-rendering.
                        </p>

                        <div 
                            style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                gap: '20px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                padding: '24px',
                                borderRadius: '16px',
                                border: '1px solid var(--border)',
                                marginBottom: '24px'
                            }}
                        >
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Interactive Permission Cell:</span>

                            <table className="permissions-table" style={{ width: 'auto', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ fontWeight: 600, padding: '16px 20px', borderRight: '1px solid var(--border)' }}>Test Permission</td>
                                        <PermissionCheckbox
                                            allowed={testChecked}
                                            active={true}
                                            canEdit={true}
                                            onClick={() => setTestChecked(!testChecked)}
                                        />
                                    </tr>
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: 600, marginTop: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                                <span style={{ color: testChecked ? '#10b981' : 'var(--text-muted)' }}>
                                    {testChecked ? 'Allowed (Checked)' : 'Denied (Unchecked)'}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.15)', padding: '12px 16px', borderRadius: '10px' }}>
                            <Info size={16} color="var(--accent)" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                Hovering highlights the cell and changes the cursor to pointer. Clicking the cell (even on the check icon itself) will trigger toggles.
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
