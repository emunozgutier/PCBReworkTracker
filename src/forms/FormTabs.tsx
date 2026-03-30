import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface FormTabsProps {
    tabs: string[];
    activeTab: number;
    onTabChange: (index: number) => void;
    onAddTab: () => void;
    onDeleteActiveTab: () => void;
    children: React.ReactNode;
}

export function FormTabs({
    tabs, 
    activeTab, 
    onTabChange, 
    onAddTab, 
    onDeleteActiveTab, 
    children
}: FormTabsProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Tabs Header */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                paddingLeft: '8px', 
                borderBottom: '1px solid var(--border-color)', 
                position: 'relative', 
                zIndex: 1 
            }}>
                {tabs.map((tabName, idx) => {
                    const isActive = activeTab === idx;

                    return (
                        <div 
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '8px 16px',
                                borderRadius: '6px 6px 0 0',
                                background: isActive ? 'var(--bg-panel)' : 'transparent',
                                color: isActive ? 'var(--text-color)' : 'var(--text-muted)',
                                border: '1px solid',
                                borderColor: isActive ? 'var(--border-color) var(--border-color) var(--bg-panel) var(--border-color)' : 'transparent transparent transparent transparent',
                                cursor: 'pointer',
                                fontWeight: isActive ? 600 : 400,
                                whiteSpace: 'nowrap',
                                position: 'relative',
                                top: isActive ? '1px' : '0', // Overlaps the parent border perfectly
                                zIndex: isActive ? 2 : 1
                            }}
                            onClick={() => onTabChange(idx)}
                        >
                            <span>{tabName || `Flavor ${idx + 1}`}</span>
                        </div>
                    );
                })}
                
                {/* Plus button area pushing the border all the way */}
                <div style={{ 
                        display: 'flex', alignItems: 'center', 
                        flex: 1, 
                        paddingLeft: '4px',
                        marginBottom: '4px'
                    }}>
                    <button
                        type="button"
                        onClick={onAddTab}
                        style={{
                            padding: '6px 8px',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px dashed transparent',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '4px' // align visually
                        }}
                        title="Add Tab"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--text-color)';
                            e.currentTarget.style.border = '1px dashed var(--border-color)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.border = '1px dashed transparent';
                        }}
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {/* Content Area bordered */}
            {tabs.length > 0 && (
                <div style={{ 
                    border: '1px solid var(--border-color)',
                    borderTop: 'none',
                    padding: '20px',
                    borderRadius: '0 0 4px 4px',
                    backgroundColor: 'var(--bg-panel)',
                    position: 'relative',
                    zIndex: 0
                }}>
                    {children}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
                        <button 
                            type="button" 
                            onClick={onDeleteActiveTab}
                            style={{ 
                                padding: '6px 12px', 
                                background: 'rgba(239, 68, 68, 0.05)', 
                                border: '1px solid rgba(239, 68, 68, 0.2)', 
                                borderRadius: '4px', 
                                cursor: 'pointer', 
                                color: '#ef4444', 
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)')}
                        >
                            <Trash2 size={14} />
                            Delete This Flavor
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
