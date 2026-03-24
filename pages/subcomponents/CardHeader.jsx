function CardHeader({ icon, title, subtitle, onClick, isActive }) {
    return (
        <div 
            className={`card-header-row ${isActive ? 'active' : ''}`} 
            onClick={onClick}
        >
            <div className="header-main">
                <span className="card-icon">{icon}</span>
                <h3>{title}</h3>
            </div>
            <div className="header-sub">
                <p>{subtitle}</p>
                <span className="mobile-chevron">⌄</span>
            </div>
        </div>
    );
}

window.CardHeader = CardHeader;
