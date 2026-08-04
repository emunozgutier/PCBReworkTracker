import { X, Search, Cpu, FileText } from 'lucide-react';

interface TopBarProps {
    filename?: string;
    onClose: () => void;
    isSidebarOpen?: boolean;
    onToggleSidebar?: () => void;
    showSearchToggle?: boolean;
    fileType?: 'board' | 'pdf';
}

export function TopBar({ 
    filename, 
    onClose, 
    isSidebarOpen = false, 
    onToggleSidebar, 
    showSearchToggle = true,
    fileType = 'board'
}: TopBarProps) {
    return (
        <header className="board-viewer-topbar">
            {/* Left: filename info */}
            <div className="board-viewer-topbar-title" title={filename || 'Document Viewer'}>
                {fileType === 'pdf' ? (
                    <FileText size={18} color="#ef4444" />
                ) : (
                    <Cpu size={18} color="var(--accent)" />
                )}
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {filename || 'Loading document...'}
                </span>
            </div>

            {/* Right: Actions */}
            <div className="board-viewer-topbar-actions">
                {/* Search / Sidebar Toggle button - only shown on mobile when enabled */}
                {showSearchToggle && onToggleSidebar && (
                    <button
                        className={`board-viewer-btn mobile-only-btn ${isSidebarOpen ? 'active' : ''}`}
                        onClick={onToggleSidebar}
                        title="Search and layers menu"
                        aria-label="Toggle search and layers menu"
                    >
                        <Search size={16} />
                        <span>Search</span>
                    </button>
                )}

                {/* Close Button - shown on all screens */}
                <button
                    className="board-viewer-btn board-viewer-btn-close"
                    onClick={onClose}
                    title="Close"
                    aria-label="Close"
                >
                    <X size={16} />
                    <span>Close</span>
                </button>
            </div>
        </header>
    );
}
