import { Check, Radio, Key, Eye, Plus, Edit2, Trash2 } from 'lucide-react';
import { useGlobalSettings } from '../../store/useGlobalSettings';
import type { UserRole, PageName, PagePermissions } from '../../store/useGlobalSettings';
import { getNatoWord } from '../../components/UrlManager/crc';
import './SettingsView.css';
import { useState } from 'react';

export function SettingsView() {
    const { crcFormat, setCrcFormat, activeRole, setActiveRole, permissions, togglePermission } = useGlobalSettings();
    const [selectedRoleTab, setSelectedRoleTab] = useState<UserRole>(activeRole);

    const sampleBase = 'VTT-0042';
    const sampleLetter = 'G';
    const sampleNato = getNatoWord(sampleLetter); // 'Golf'

    const handleRoleTabClick = (role: UserRole) => {
        setSelectedRoleTab(role);
        setActiveRole(role); // Auto-simulate active role
    };

    const pagesList: { name: PageName; label: string }[] = [
        { name: 'projects', label: 'Projects' },
        { name: 'pcbs', label: 'PCBs' },
        { name: 'reworks', label: 'Reworks' },
        { name: 'owners', label: 'Owners/Users' },
        { name: 'tags', label: 'Tags' },
        { name: 'sandbox', label: 'CRC (Always Open)' },
        { name: 'settings', label: 'Settings' }
    ];

    const rightsList: { key: keyof PagePermissions; label: string; icon: any }[] = [
        { key: 'view', label: 'View', icon: Eye },
        { key: 'create', label: 'Create', icon: Plus },
        { key: 'edit', label: 'Edit', icon: Edit2 },
        { key: 'delete', label: 'Delete', icon: Trash2 }
    ];

    return (
        <div className="settings-page-wrapper">


            {/* Checksum format setting */}
            <div className="settings-main-card" style={{ marginBottom: '24px' }}>
                <div className="settings-card-label">
                    <Radio size={18} color="var(--accent)" />
                    <span>CRC Checksum Display Mode</span>
                </div>

                <div className="settings-options-grid">
                    {/* Option 1: Single Letter */}
                    <div
                        className={`setting-choice-card ${crcFormat === 'letter' ? 'selected' : ''}`}
                        onClick={() => setCrcFormat('letter')}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">Single Letter</span>
                            <div className="choice-radio">
                                {crcFormat === 'letter' && <Check size={14} color="#ffffff" />}
                            </div>
                        </div>

                        <div className="choice-example-badge">
                            <span className="example-code">
                                {sampleBase}<span>{sampleLetter}</span>
                            </span>
                        </div>
                    </div>

                    {/* Option 2: NATO Phonetic Word */}
                    <div
                        className={`setting-choice-card ${crcFormat === 'nato' ? 'selected' : ''}`}
                        onClick={() => setCrcFormat('nato')}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">NATO Phonetic Word</span>
                            <div className="choice-radio">
                                {crcFormat === 'nato' && <Check size={14} color="#ffffff" />}
                            </div>
                        </div>

                        <div className="choice-example-badge" style={{ justifyContent: 'flex-start' }}>
                            <span className="example-code">
                                {sampleBase}<span>{sampleNato}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rights Table Card */}
            <div className="settings-main-card">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div>
                        <div className="settings-card-label" style={{ marginBottom: '8px' }}>
                            <Key size={18} color="var(--accent)" />
                            <span>Role Access Rights Matrix</span>
                        </div>
                        

                    </div>

                    <div className="settings-role-tabs">
                        {(['superuser', 'user', 'guest'] as UserRole[]).map((role) => (
                            <button
                                key={role}
                                className={`role-tab-btn ${activeRole === role ? 'active' : ''} ${role}`}
                                onClick={() => handleRoleTabClick(role)}
                            >
                                <span className="role-dot" />
                                {role === 'superuser' ? '✦ ' : ''}
                                {role.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="permissions-table-container">
                    <table className="permissions-table">
                        <thead>
                            <tr>
                                <th>Page / Feature</th>
                                {rightsList.map((right) => (
                                    <th key={right.key} style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                            <right.icon size={14} />
                                            <span>{right.label}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {pagesList.map((page) => {
                                const isCrc = page.name === 'sandbox';
                                return (
                                    <tr key={page.name} className={isCrc ? 'crc-row' : ''}>
                                        <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>
                                            {page.label}
                                        </td>
                                        {rightsList.map((right) => {
                                            const hasRight = isCrc ? true : permissions[selectedRoleTab]?.[page.name]?.[right.key];
                                            const isDisabled = isCrc; // CRC is open for all and cannot be toggled

                                            return (
                                                <td key={right.key} style={{ textAlign: 'center' }}>
                                                    <span 
                                                        className={`perm-checkbox-label ${isDisabled ? 'disabled' : ''} ${hasRight ? 'checked' : ''}`}
                                                        onClick={() => !isDisabled && togglePermission(selectedRoleTab, page.name, right.key)}
                                                    >
                                                        <div className="perm-checkbox-box">
                                                            {hasRight && <Check size={14} strokeWidth={3} />}
                                                        </div>
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
