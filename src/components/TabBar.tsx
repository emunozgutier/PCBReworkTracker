import { CircuitBoard, ClipboardList, PenTool, Hash, Users } from 'lucide-react';

interface TabBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
    const tabs = [
        { id: 'projects', label: 'Projects', icon: ClipboardList },
        { id: 'pcbs', label: 'PCBs', icon: CircuitBoard },
        { id: 'reworks', label: 'Reworks', icon: PenTool },
        { id: 'owners', label: 'Owners', icon: Users },
        { id: 'tags', label: 'Tags', icon: Hash }
    ];

    return (
        <nav className="tab-bar">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <Icon size={20} strokeWidth={2.5} />
                        <span className="tab-label">{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
