import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface FormTabsProps {
    tabs: string[];
    activeTab: number;
    onTabChange: (index: number) => void;
    onAddTab?: () => void;
    onDeleteActiveTab?: () => void;
    canDeleteActiveTab?: boolean;
    children?: React.ReactNode;
}

export function FormTabs({
    tabs, 
    activeTab, 
    onTabChange, 
    onAddTab, 
    onDeleteActiveTab, 
    canDeleteActiveTab = true,
    children
}: FormTabsProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Tabs Header */}
            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                paddingLeft: '8px', 
                borderBottom: '1px solid var(--border)', 
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
                                padding: '10px 20px',
                                borderRadius: '8px 8px 0 0',
                                background: isActive ? 'var(--card-bg)' : 'transparent',
                                color: isActive ? 'var(--text)' : 'var(--text-muted)',
                                borderTop: isActive ? '2px solid var(--accent)' : '1px solid transparent',
                                borderRight: isActive ? '1px solid var(--border)' : '1px solid transparent',
                                borderLeft: isActive ? '1px solid var(--border)' : '1px solid transparent',
                                borderBottom: isActive ? '1px solid var(--card-bg)' : '1px solid var(--border)',
                                cursor: 'pointer',
                                fontWeight: isActive ? 600 : 500,
                                whiteSpace: 'nowrap',
                                position: 'relative',
                                top: isActive ? '1px' : '0',
                                zIndex: isActive ? 2 : 1,
                                transition: 'all 0.2s ease',
                                opacity: isActive ? 1 : 0.6
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = 'var(--text)';
                                    e.currentTarget.style.opacity = '1';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                    e.currentTarget.style.opacity = '0.6';
                                }
                            }}
                            onClick={() => onTabChange(idx)}
                        >
                            <span>{tabName || `Flavor ${idx + 1}`}</span>
                        </div>
                    );
                })}
                
                {onAddTab && (
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
                                e.currentTarget.style.color = 'var(--text)';
                                e.currentTarget.style.border = '1px dashed var(--border)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.border = '1px dashed transparent';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                )}
            </div>
            
            {/* Tab Content */}
            <div style={{ padding: '16px', background: 'var(--card-bg)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                {children}

                {onDeleteActiveTab && tabs.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border)' }}>
                        <button 
                            type="button" 
                            onClick={canDeleteActiveTab ? onDeleteActiveTab : undefined}
                            disabled={!canDeleteActiveTab}
                            title={!canDeleteActiveTab ? "Cannot delete flavor currently assigned to PCBs." : "Delete This Flavor"}
                            style={{ 
                                padding: '6px 12px', 
                                background: canDeleteActiveTab ? 'rgba(239, 68, 68, 0.05)' : 'transparent', 
                                border: '1px solid',
                                borderColor: canDeleteActiveTab ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)', 
                                borderRadius: '4px', 
                                cursor: canDeleteActiveTab ? 'pointer' : 'not-allowed', 
                                color: canDeleteActiveTab ? '#ef4444' : 'var(--text-muted)', 
                                fontSize: '0.85rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                opacity: canDeleteActiveTab ? 1 : 0.5
                            }}
                            onMouseEnter={(e) => { if (canDeleteActiveTab) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                            onMouseLeave={(e) => { if (canDeleteActiveTab) e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; }}
                        >
                            <Trash2 size={14} />
                            Delete This Flavor
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
