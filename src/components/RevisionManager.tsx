interface RevisionManagerProps {
    revisions: string;
    onChange: (revisions: string) => void;
}

export function RevisionManager({ revisions, onChange }: RevisionManagerProps) {
    const revs = revisions.split(',').map(r => r.trim()).filter(Boolean);
    
    // Group by major letter (A, B, C...)
    const grouped = revs.reduce((acc, rev) => {
        const major = rev[0];
        if (major && /[a-zA-Z]/.test(major)) {
            const upperMajor = major.toUpperCase();
            if (!acc[upperMajor]) acc[upperMajor] = [];
            acc[upperMajor].push(rev);
        }
        return acc;
    }, {} as Record<string, string[]>);
    
    const majorLetters = Object.keys(grouped).sort();

    const handleAddMajor = () => {
        if (majorLetters.length === 0) {
            onChange('A0');
            return;
        }
        
        // Find highest major letter
        const highest = majorLetters[majorLetters.length - 1];
        const nextMajorCode = highest.charCodeAt(0) + 1;
        
        if (nextMajorCode <= 90) { // Z is 90
            const nextMajor = String.fromCharCode(nextMajorCode);
            onChange([...revs, `${nextMajor}0`].join(', '));
        }
    };
    
    const handleAddMinor = (major: string) => {
        const currentRevs = grouped[major] || [];
        // Find highest minor number
        let maxMinor = -1;
        for (const r of currentRevs) {
            const minorStr = r.substring(1);
            if (!isNaN(Number(minorStr))) {
                maxMinor = Math.max(maxMinor, Number(minorStr));
            }
        }
        const nextMinor = maxMinor + 1;
        onChange([...revs, `${major}${nextMinor}`].join(', '));
    };

    return (
        <div className="revision-manager" style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9em' }}>
            <div className="revision-actions" style={{ marginBottom: '10px' }}>
                <button 
                    type="button" 
                    onClick={handleAddMajor} 
                    style={{ padding: '4px 10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    + Add Major ({majorLetters.length === 0 ? 'A0' : String.fromCharCode(majorLetters[majorLetters.length - 1].charCodeAt(0) + 1) + '0'})
                </button>
            </div>
            
            {majorLetters.length > 0 && (
                <div className="major-groups" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {majorLetters.map(major => (
                        <div key={major} className="major-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="major-label" style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>
                                {major}
                            </div>
                            <div className="minor-list" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', flex: 1 }}>
                                {grouped[major].sort((a,b) => {
                                    const minorA = Number(a.substring(1));
                                    const minorB = Number(b.substring(1));
                                    return (isNaN(minorA)?0:minorA) - (isNaN(minorB)?0:minorB);
                                }).map(rev => (
                                    <span key={rev} className="rev-badge" style={{ padding: '2px 6px', background: '#e2e8f0', borderRadius: '4px', color: '#334155' }}>
                                        {rev}
                                    </span>
                                ))}
                            </div>
                            <button 
                                type="button" 
                                onClick={() => handleAddMinor(major)} 
                                style={{ padding: '2px 8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                + Add Minor ({major}{grouped[major].length > 0 ? Math.max(...grouped[major].map(r => { const m = Number(r.substring(1)); return isNaN(m) ? -1 : m; })) + 1 : 0})
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
