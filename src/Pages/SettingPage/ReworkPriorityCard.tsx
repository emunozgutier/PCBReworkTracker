import { ShieldCheck } from 'lucide-react';

export function ReworkPriorityCard() {
    return (
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
    );
}
