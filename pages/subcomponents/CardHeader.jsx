function CardHeader({ icon, title, subtitle }) {
    return (
        <React.Fragment>
            <div className="card-icon">{icon}</div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
        </React.Fragment>
    );
}

window.CardHeader = CardHeader;
