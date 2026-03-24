function CardList({ icon, title, subtitle, items, emptyMessage, delay, children }) {
    return (
        <div className="col-12 col-md-6 col-xl-3">
            <div className={`card glass-card animate-zoom-in h-100 ${delay ? 'delay-' + delay : ''}`}>
                <CardHeader icon={icon} title={title} subtitle={subtitle} />
                <CardListElement items={items} emptyMessage={emptyMessage}>
                    {children}
                </CardListElement>
            </div>
        </div>
    );
}

window.CardList = CardList;
