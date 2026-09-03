import { CheckSumCard } from './CheckSumCard';
import { useAppState } from '../../store/useAppState';
import { RolePermissionCard } from './RolePermissionCard';
import { ReworkPriorityCard } from './ReworkPriorityCard';
import { Calendar } from 'lucide-react';
import '../ViewPages/SettingsView.css';

declare const __BUILD_DATE__: string;

export function TopSettingPage() {
    const { setPage } = useAppState();
    const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="settings-page-wrapper">
            <CheckSumCard />
            <RolePermissionCard />
            <ReworkPriorityCard />
            
            <div className="settings-main-card">
                <div className="settings-card-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                    <span>QR Code & Label Printing</span>
                </div>
                <p className="settings-description">
                    Configure QR code formats, customize your domain prefix, and print sheets of tracking labels for your boards.
                </p>
                <div style={{ marginTop: '16px' }}>
                    <button 
                        onClick={() => setPage('settings_qr_print')}
                        style={{
                            background: 'var(--accent)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'opacity 0.2s'
                        }}
                    >
                        Open QR Print Studio
                    </button>
                </div>
            </div>
            
            <div className="settings-main-card">
                <div className="settings-card-label">
                    <Calendar size={18} color="var(--accent)" />
                    <span>Application Version Info</span>
                </div>
                <p className="settings-description" style={{ margin: 0 }}>
                    Website Last Updated: <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{buildDate}</strong>
                </p>
            </div>
        </div>
    );
}
