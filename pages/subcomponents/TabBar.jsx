function TabBar({ activeTab, onTabChange }) {
    const { Layout, Cpu, Wrench, Tag } = LucideReact;
    
    const tabs = [
        { id: 'projects', label: 'Projects', icon: Layout },
        { id: 'pcbs', label: 'PCBs', icon: Cpu },
        { id: 'reworks', label: 'Reworks', icon: Wrench },
        { id: 'tags', label: 'Tags', icon: Tag }
    ];

    return (
        <nav className="mobile-tab-bar">
            {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                    <button 
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <span className="tab-icon">
                            <Icon size={20} strokeWidth={2.5} />
                        </span>
                        <span className="tab-label">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}

window.TabBar = TabBar;
