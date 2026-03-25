function CardList({ icon, title, subtitle, items, emptyMessage, delay, children, isActive, onHeaderClick, hideHeaderMobile }) {
    return (
        <div className={`col-12 col-md-6 col-xl-3 dashboard-col ${isActive ? 'is-active' : 'is-collapsed'} ${hideHeaderMobile ? 'mobile-hide-header' : ''}`}>
            <div className={`card glass-card animate-zoom-in h-100 ${delay ? 'delay-' + delay : ''}`}>
                <CardHeader 
                    icon={icon} 
                    title={title} 
                    subtitle={subtitle} 
                    onClick={onHeaderClick}
                    isActive={isActive}
                />
                <div className="card-content-wrapper">
                    <CardListElement items={items} emptyMessage={emptyMessage}>
                        {children}
                    </CardListElement>
                </div>
            </div>
        </div>
    );
}

window.CardList = CardList;
