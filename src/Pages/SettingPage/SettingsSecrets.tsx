import { ArrowLeft, Lock } from 'lucide-react';
import { DbSettingsCard } from './DbSettingsCard';
import '../ViewPages/SettingsView.css';

interface SettingsSecretsProps {
    onBack: () => void;
}

export function SettingsSecrets({ onBack }: SettingsSecretsProps) {
    return (
        <div className="settings-page-wrapper" style={{ padding: '16px 0 32px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
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
                        padding: 0
                    }}
                >
                    <ArrowLeft size={16} />
                    <span>Back to Settings</span>
                </button>

                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 6, 
                        fontSize: '0.78rem', 
                        color: 'var(--text-muted)',
                        padding: '4px 10px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderRadius: 20,
                        border: '1px solid var(--border)'
                    }}
                >
                    <Lock size={12} color="var(--accent)" />
                    <span>/settings/secrets</span>
                </div>
            </div>

            <DbSettingsCard />
        </div>
    );
}
