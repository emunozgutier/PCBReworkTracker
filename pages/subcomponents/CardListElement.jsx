function CardListElement({ items, emptyMessage, children }) {
    return (
        <ul className="data-list">
            {items && items.length > 0 ? items.map((item, index) => (
                <React.Fragment key={item.id || index}>
                    {children(item)}
                </React.Fragment>
            )) : (
                <li className="empty-state">{emptyMessage || 'No items found.'}</li>
            )}
        </ul>
    );
}

window.CardListElement = CardListElement;
