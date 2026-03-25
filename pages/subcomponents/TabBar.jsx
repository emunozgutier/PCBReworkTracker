function TabBar({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'projects', label: 'Projects', icon: '📁' },
        { id: 'pcbs', label: 'PCBs', icon: '📟' },
        { id: 'reworks', label: 'Reworks', icon: '🔧' },
        { id: 'tags', label: 'Tags', icon: '🏷️' }
    ];

    return (
        <nav className="mobile-tab-bar">
            {tabs.map(tab => (
                <button 
                    key={tab.id}
                    className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <span className="tab-icon">{tab.icon}</span>
                    <span className="tab-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}

window.TabBar = TabBar;
