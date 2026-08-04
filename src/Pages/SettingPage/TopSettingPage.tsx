import { CheckSumCard } from './CheckSumCard';
import { RolePermissionCard } from './RolePermissionCard';
import { ReworkPriorityCard } from './ReworkPriorityCard';
import { Calendar } from 'lucide-react';
import '../ViewPages/SettingsView.css';

declare const __BUILD_DATE__: string;

export function TopSettingPage() {
    const buildDate = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="settings-page-wrapper">
            <CheckSumCard />
            <RolePermissionCard />
            <ReworkPriorityCard />
            
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
