function CardList({ icon, title, subtitle, items, emptyMessage, delay, children }) {
    return (
        <div className="col-12 col-md-6 col-xl-3">
            <div className={`card glass-card animate-zoom-in h-100 ${delay ? 'delay-' + delay : ''}`}>
                <div className="card-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{subtitle}</p>
                <ul className="data-list">
                    {items && items.length > 0 ? items.map((item, index) => (
                        <React.Fragment key={item.id || index}>
                            {children(item)}
                        </React.Fragment>
                    )) : (
                        <li className="empty-state">{emptyMessage || 'No items found.'}</li>
                    )}
                </ul>
            </div>
        </div>
    );
}

// Make it available globally for the Babel standalone environment
window.CardList = CardList;
