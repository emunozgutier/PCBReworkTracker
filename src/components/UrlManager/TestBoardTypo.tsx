import { useState } from 'react';
import { generateCRC, findClosestBoard } from './crc';
import { useStore } from '../../store/useStore';

export function TestBoardTypo() {
    const { goBack } = useStore();
    const [project, setProject] = useState('MAP');
    const [number, setNumber] = useState('0001');
    const [mistyped, setMistyped] = useState('');

    const baseName = `${project.toUpperCase()}-${number.padStart(4, '0')}`;
    const crc = generateCRC(baseName);
    const validBoardName = `${baseName}${crc}`;

    // Test the logic using ONLY this valid board as the available database
    const matchedBoard = findClosestBoard(mistyped, [{ board_number: validBoardName }]);

    return (
        <div style={{ padding: '2rem', backgroundColor: 'var(--bg-panel)', margin: '2rem auto', maxWidth: '800px', borderRadius: '12px', border: '1px dashed var(--accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ color: 'var(--accent)', margin: 0 }}>CRC Auto-Correct Sandbox</h2>
                <button onClick={goBack} style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--bg-element)', color: 'var(--text)', border: '1px solid var(--border)', cursor: 'pointer' }}>Close Sandbox</button>
            </div>
            
            <p style={{ color: 'var(--text-muted)' }}>Simulate generating a real board natively, and try to break the intelligent matcher with string typos below!</p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Project Code (3 letters)</label>
                    <input 
                        type="text" 
                        maxLength={3} 
                        value={project} 
                        onChange={e => setProject(e.target.value)} 
                        style={{ padding: '0.75rem', textTransform: 'uppercase', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-element)', color: 'var(--text)', width: '120px', fontSize: '1.1rem' }} 
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Board Number (4 digits)</label>
                    <input 
                        type="text" 
                        maxLength={4} 
                        value={number} 
                        onChange={e => setNumber(e.target.value.replace(/\D/g, ''))} 
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-element)', color: 'var(--text)', width: '120px', fontSize: '1.1rem' }} 
                    />
                </div>
            </div>

            <div style={{ margin: '2rem 0', fontSize: '1.3rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <strong>Intended Board Output: </strong>
                <span style={{ color: 'var(--text)', padding: '0.5rem', letterSpacing: '2px' }}>
                    {baseName}<span style={{ color: '#a855f7', fontWeight: 900 }}>{crc}</span>
                </span>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Simulate a User Router Typo:</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input 
                        type="text" 
                        value={mistyped}
                        onChange={e => setMistyped(e.target.value)}
                        placeholder={`Try typing M0P-0001${crc}`}
                        style={{ padding: '1rem', width: '100%', maxWidth: '400px', fontSize: '1.1rem', textTransform: 'uppercase', borderRadius: '8px', border: '1px solid var(--accent)', background: 'var(--bg-element)', color: 'var(--text)' }}
                    />
                </div>
            </div>

            {mistyped && (
                <div style={{ marginTop: '1.5rem', fontSize: '1.1rem', padding: '1.5rem', borderRadius: '8px', backgroundColor: matchedBoard ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${matchedBoard ? '#10b981' : '#ef4444'}` }}>
                    {matchedBoard ? (
                        <div style={{ color: '#10b981' }}>
                            ✅ <strong>Success!</strong> The URL Manager perfectly intercepted <strong>{mistyped.toUpperCase()}</strong> and algorithmically fixed it back to <strong style={{ color: '#a855f7' }}>{matchedBoard}</strong>
                        </div>
                    ) : (
                        <div style={{ color: '#ef4444' }}>
                            ❌ <strong>Failed!</strong> The URL Manager could not definitively rescue "{mistyped.toUpperCase()}". The string deviation is too massive or the Anchor Checksum is totally destroyed.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
