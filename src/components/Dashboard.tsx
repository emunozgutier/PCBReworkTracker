import { useEffect, useState } from 'react';

import { API_BASE } from '../apiBridge';

interface DashboardStats {
    projects: number;
    pcbs: number;
    owners: number;
    reworks: number;
    tags: number;
}

export function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE}/dashboard`)
            .then(res => res.json())
            .then(data => {
                setStats(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch dashboard stats:', err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading">Loading dashboard...</div>;

    const cards = [
        { label: 'Projects', value: stats?.projects || 0, color: 'blue' },
        { label: 'PCBs', value: stats?.pcbs || 0, color: 'indigo' },
        { label: 'Reworks', value: stats?.reworks || 0, color: 'amber' },
        { label: 'Owners', value: stats?.owners || 0, color: 'emerald' },
        { label: 'Tags', value: stats?.tags || 0, color: 'rose' }
    ];

    return (
        <div className="dashboard-grid">
            {cards.map((card) => (
                <div key={card.label} className={`stat-card ${card.color}`}>
                    <span className="stat-value">{card.value}</span>
                    <span className="stat-label">{card.label}</span>
                </div>
            ))}
        </div>
    );
}
