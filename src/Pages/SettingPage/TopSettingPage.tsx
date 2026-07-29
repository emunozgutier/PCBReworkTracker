import { CheckSumCard } from './CheckSumCard';
import { RolePermissionCard } from './RolePermissionCard';
import { ReworkPriorityCard } from './ReworkPriorityCard';
import '../ViewPages/SettingsView.css';

export function TopSettingPage() {
    return (
        <div className="settings-page-wrapper">
            <CheckSumCard />
            <RolePermissionCard />
            <ReworkPriorityCard />
        </div>
    );
}
