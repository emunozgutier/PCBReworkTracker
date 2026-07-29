import { useState, useEffect } from 'react';
import { ShieldCheck, CheckSquare, Square, MinusSquare } from 'lucide-react';
import { useGlobalSettings } from '../../store/useGlobalSettings';
import { useAppState } from '../../store/useAppState';
import { generateCRC, getNatoWord } from '../../components/UrlManager/crc';
import './SettingsView.css';

export function SettingsView() {
    const { crcFormat, setCrcFormat, allowGuestMinorRework, setAllowGuestMinorRework } = useGlobalSettings();
    const { currentUserRole } = useAppState();
    const [calcInput, setCalcInput] = useState('MAP-0001');
    const [localGuestMinorRework, setLocalGuestMinorRework] = useState(allowGuestMinorRework);

    useEffect(() => {
        setLocalGuestMinorRework(allowGuestMinorRework);
    }, [allowGuestMinorRework]);

    const isSuperUser = currentUserRole === 'Super User';

    const handleSaveChanges = () => {
        setAllowGuestMinorRework(localGuestMinorRework);
        alert("Permissions updated and saved successfully!");
    };

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
                        className={`setting-choice-card ${crcFormat === 'letter' ? 'selected' : ''}`}
                        onClick={() => {
                            setCrcFormat('letter');
                        }}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">Single Letter</span>
                            <div className="choice-radio">
                                {crcFormat === 'letter' && (
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                )}
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
                        className={`setting-choice-card ${crcFormat === 'nato' ? 'selected' : ''}`}
                        onClick={() => {
                            setCrcFormat('nato');
                        }}
                    >
                        <div className="choice-card-top">
                            <span className="choice-title">NATO Phonetic Word</span>
                            <div className="choice-radio">
                                {crcFormat === 'nato' && (
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                                )}
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

                {/* Save Changes button on top of the table */}
                {isSuperUser && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <button
                            type="button"
                            onClick={handleSaveChanges}
                            className="submit-button"
                            style={{ margin: 0, padding: '8px 16px', fontSize: '0.85rem', borderRadius: '8px', width: 'auto', background: 'var(--accent)' }}
                        >
                            Save Changes
                        </button>
                    </div>
                )}

                <div className="permissions-table-container">
                    <table className="permissions-table">
                        <thead>
                            <tr>
                                <th>Resource</th>
                                <th>Action</th>
                                <th className={`cb-header-cell ${currentUserRole === 'Super User' ? 'active-column' : ''}`}>Super User</th>
                                <th className={`cb-header-cell ${currentUserRole === 'User' ? 'active-column' : ''}`}>User</th>
                                <th className={`cb-header-cell ${currentUserRole === 'Guest' ? 'active-column' : ''}`}>Guest</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Projects */}
                            <tr>
                                <td className="resource-cell" rowSpan={4}>Projects</td>
                                <td>View</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                            </tr>
                            <tr>
                                <td>Add</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Edit</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Delete</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>

                            {/* PCBs */}
                            <tr>
                                <td className="resource-cell" rowSpan={4}>PCBs</td>
                                <td>View</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                            </tr>
                            <tr>
                                <td>Add</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Edit</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Delete</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>

                            {/* Reworks */}
                            <tr>
                                <td className="resource-cell" rowSpan={7}>Reworks</td>
                                <td>View</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                            </tr>
                            <tr>
                                <td>Add High Priority</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Add Low Priority</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td 
                                    className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}
                                    onClick={isSuperUser ? () => {
                                        console.log("CELL CLICKED! Old state:", localGuestMinorRework);
                                        setLocalGuestMinorRework(!localGuestMinorRework);
                                    } : undefined}
                                    style={isSuperUser ? { cursor: 'pointer', transition: 'background-color 0.2s' } : undefined}
                                    onMouseEnter={isSuperUser ? (e) => { e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)'; } : undefined}
                                    onMouseLeave={isSuperUser ? (e) => { e.currentTarget.style.backgroundColor = ''; } : undefined}
                                >
                                    {console.log("Rendering checkbox: localGuestMinorRework=", localGuestMinorRework, "allowGuestMinorRework=", allowGuestMinorRework)}
                                    {localGuestMinorRework ? (
                                        <CheckSquare size={16} className="allowed-cb" style={{ pointerEvents: 'none' }} />
                                    ) : (
                                        <Square size={16} className="denied-cb" style={{ pointerEvents: 'none' }} />
                                    )}
                                </td>
                            </tr>
                            <tr className="edit-row">
                                <td>Edit Own</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr className="edit-row">
                                <td>Edit Others</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Delete Own</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Delete Others</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>

                            {/* Users */}
                            <tr>
                                <td className="resource-cell" rowSpan={5}>Users</td>
                                <td>View</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                            </tr>
                            <tr>
                                <td>Add</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                            </tr>
                            <tr className="edit-row">
                                <td>Edit Own</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr className="edit-row">
                                <td>Edit Others</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Delete</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>

                            {/* Tags */}
                            <tr>
                                <td className="resource-cell" rowSpan={4}>Tags</td>
                                <td>View</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                            </tr>
                            <tr>
                                <td>Add</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Edit</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                            <tr>
                                <td>Delete</td>
                                <td className={`cb-cell ${currentUserRole === 'Super User' ? 'active-cell' : ''}`}><CheckSquare size={16} className="allowed-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'User' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                                <td className={`cb-cell ${currentUserRole === 'Guest' ? 'active-cell' : ''}`}><Square size={16} className="denied-cb" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Card 3: Rework Priority Classification */}
            <div className="settings-main-card">
                <div className="settings-card-label">
                    <ShieldCheck size={18} color="var(--accent)" />
                    <span>Rework Priority Classification</span>
                </div>
                <p className="settings-description">
                    Classification mapping rules showing priority assignment based on select rework types.
                </p>
                <div className="permissions-table-container">
                    <table className="permissions-table" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Rework Type</th>
                                <th style={{ textAlign: 'center' }}>Classification Priority</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Silicon Swap</td>
                                <td style={{ textAlign: 'center', padding: '10px' }}>
                                    <span className="priority-badge high">High Priority</span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Major Rework</td>
                                <td style={{ textAlign: 'center', padding: '10px' }}>
                                    <span className="priority-badge high">High Priority</span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Minor Rework</td>
                                <td style={{ textAlign: 'center', padding: '10px' }}>
                                    <span className="priority-badge low">Low Priority</span>
                                </td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600, color: 'var(--text-h)' }}>Resistor Swap</td>
                                <td style={{ textAlign: 'center', padding: '10px' }}>
                                    <span className="priority-badge low">Low Priority</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

