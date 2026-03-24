function TitleBar({ title, subtitle }) {
    return (
        <header className="hero">
            <h1 className="animate-fade-in-down">
                {title ? (
                    typeof title === 'string' && title.includes(' ') ? (
                        <>
                            {title.split(' ')[0]} <span>{title.split(' ').slice(1).join(' ')}</span>
                        </>
                    ) : title
                ) : (
                    <>PCB <span>Rework</span> Tracker</>
                )}
            </h1>
            <p className="subtitle animate-fade-in-up">
                {subtitle || 'Manage, track, and optimize your PCB rework workflow with ease.'}
            </p>
        </header>
    );
}

window.TitleBar = TitleBar;
