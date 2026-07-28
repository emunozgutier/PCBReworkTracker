import { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { useGlobalSettings } from '../../store/useGlobalSettings';
import { useAppState } from '../../store/useAppState';
import { generateCRC, getNatoWord } from '../../components/UrlManager/crc';
import './SettingsView.css';

export function SettingsView() {
    const { crcFormat, setCrcFormat } = useGlobalSettings();
    const { currentUserRole } = useAppState();
    const [calcInput, setCalcInput] = useState('MAP-0001');

    const isSuperUser = currentUserRole === 'Super User';

    // Dynamic CRC calculation logic
    const cleanInput = calcInput.trim().toUpperCase();
    const previewBase = cleanInput || 'MAP-0001';
    const previewCrc = generateCRC(previewBase);
    const previewNato = getNatoWord(previewCrc);

    return (
        <div className="settings-page-wrapper">
            {/* Card 1: Calculator & Settings */}
            <div className="settings-main-card">
                <div className="settings-card-label">
                    <ShieldCheck size={18} color="var(--accent)" />
                    <span>CRC Checksum Calculator & Settings</span>
                </div>
                
                <p className="settings-description">
                    Enter a base board name (e.g., PROJECT-NUMBER) to calculate its unique CRC checksum, and select your preferred display mode below.
                </p>
                
                <div className="calculator-input-container">
                    <input 
                        type="text" 
                        value={calcInput}
                        onChange={e => setCalcInput(e.target.value)}
                        placeholder="e.g. MAP-0001"
                        className="calculator-input"
                    />
                </div>

                <div className="settings-options-grid">
                    {/* Option 1: Single Letter */}
                    <div
                        className={`setting-choice-card ${crcFormat === 'letter' ? 'selected' : ''} ${!isSuperUser ? 'disabled' : ''}`}
                        onClick={() => {
                            if (!isSuperUser) return;
                            setCrcFormat('letter');
                        }}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">Single Letter</span>
                            <div className="choice-radio">
                                {crcFormat === 'letter' && <Check size={14} color="#ffffff" />}
                            </div>
                        </div>

                        <div className="choice-example-badge">
                            <span className="example-code">
                                {previewBase}<span>{previewCrc}</span>
                            </span>
                        </div>
                    </div>

                    {/* Option 2: NATO Phonetic Word */}
                    <div
                        className={`setting-choice-card ${crcFormat === 'nato' ? 'selected' : ''} ${!isSuperUser ? 'disabled' : ''}`}
                        onClick={() => {
                            if (!isSuperUser) return;
                            setCrcFormat('nato');
                        }}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">NATO Phonetic Word</span>
                            <div className="choice-radio">
                                {crcFormat === 'nato' && <Check size={14} color="#ffffff" />}
                            </div>
                        </div>

                        <div className="choice-example-badge">
                            <span className="example-tag">NATO:</span>
                            <span className="example-code">
                                {previewBase}<span>{previewNato}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {!isSuperUser && (
                    <div className="settings-lock-warning">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>Only Super Users have permission to modify display settings.</span>
                    </div>
                )}
            </div>

            {/* Card 2: Permissions Matrix */}
            <div className="settings-main-card">
                <div className="settings-card-label">
                    <ShieldCheck size={18} color="var(--accent)" />
                    <span>Role Permissions Matrix</span>
                </div>
                <p className="settings-description">
                    Overview of user capabilities based on active session role. Adjust your session role in the controller in the top-right corner to test permissions.
                </p>
                <div className="permissions-table-container">
                    <table className="permissions-table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Projects</th>
                                <th>PCBs</th>
                                <th>Reworks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className={currentUserRole === 'Guest' ? 'active-row' : ''}>
                                <td className="role-cell">Guest</td>
                                <td className="denied-cell">❌ Read-only</td>
                                <td className="denied-cell">❌ Read-only</td>
                                <td className="denied-cell">❌ Read-only</td>
                            </tr>
                            <tr className={currentUserRole === 'User' ? 'active-row' : ''}>
                                <td className="role-cell">User</td>
                                <td className="denied-cell">❌ Read-only</td>
                                <td className="restricted-cell">⚠️ Add / Edit & Del (Own Only)</td>
                                <td className="restricted-cell">⚠️ Add / Edit & Del (Own Only)</td>
                            </tr>
                            <tr className={currentUserRole === 'Super User' ? 'active-row' : ''}>
                                <td className="role-cell">Super User</td>
                                <td className="allowed-cell">✅ Full Access</td>
                                <td className="allowed-cell">✅ Full Access</td>
                                <td className="allowed-cell">✅ Full Access</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

