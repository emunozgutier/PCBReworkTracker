import { useState } from 'react';
import { generateCRC, findClosestBoard, levenshteinDistance } from './crc';
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
            
            <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Simulate generating a real board natively, and try to break the intelligent matcher with string typos below!</p>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Project Code (3 letters)</label>
                    <input 
                        type="text" 
                        maxLength={3} 
                        value={project} 
                        onChange={e => setProject(e.target.value)} 
                        style={{ padding: '0.75rem', textTransform: 'uppercase', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-element)', color: 'var(--text)', width: '120px', fontSize: '1.1rem', textAlign: 'center' }} 
                    />
                </div>
                <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Board Number (4 digits)</label>
                    <input 
                        type="text" 
                        maxLength={4} 
                        value={number} 
                        onChange={e => setNumber(e.target.value.replace(/\D/g, ''))} 
                        style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-element)', color: 'var(--text)', width: '120px', fontSize: '1.1rem', textAlign: 'center' }} 
                    />
                </div>
            </div>

            <div style={{ margin: '2rem 0', fontSize: '1.3rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <strong>Intended Board Output: </strong>
                <span style={{ color: 'var(--text)', padding: '0.5rem', letterSpacing: '2px' }}>
                    {baseName}<span style={{ color: '#a855f7', fontWeight: 900 }}>{crc}</span>
                </span>
            </div>

            <div style={{ marginTop: '2.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Simulate a User Router Typo:</label>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <input 
                        type="text" 
                        value={mistyped}
                        onChange={e => setMistyped(e.target.value)}
                        placeholder={`Try typing M0P-0001${crc}`}
                        style={{ padding: '1rem', width: '100%', maxWidth: '400px', fontSize: '1.1rem', textTransform: 'uppercase', borderRadius: '8px', border: '1px solid var(--accent)', background: 'var(--bg-element)', color: 'var(--text)', textAlign: 'center' }}
                    />
                </div>
            </div>

            {mistyped && (() => {
                const typedUpper = mistyped.toUpperCase();
                const matchDist = levenshteinDistance(typedUpper, validBoardName);
                const hasCrcBonus = typedUpper.length > 2 && validBoardName.slice(-1) === typedUpper.slice(-1);
                const finalScore = hasCrcBonus ? matchDist - 2 : matchDist;

                return (
                    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ fontSize: '1.1rem', padding: '1.5rem', borderRadius: '8px', backgroundColor: typedUpper === validBoardName ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${typedUpper === validBoardName ? '#10b981' : '#ef4444'}` }}>
                            {typedUpper === validBoardName ? (
                                <div style={{ color: '#10b981' }}>
                                    ✅ <strong>Input Status: OK!</strong> The URL naturally matches the exact mathematically generated board string.
                                </div>
                            ) : (
                                <div style={{ color: '#ef4444' }}>
                                    ❌ <strong>Input Status: BAD!</strong> The URL explicitly contains physical typos, missing data, or a corrupted CRC validator.
                                </div>
                            )}
                        </div>

                        <div style={{ fontSize: '1.1rem', padding: '1.5rem', borderRadius: '8px', backgroundColor: matchedBoard ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${matchedBoard ? '#10b981' : '#ef4444'}` }}>
                            {matchedBoard ? (
                                <div style={{ color: '#10b981', marginBottom: '1rem' }}>
                                    🛠️ <strong>Router Auto-Corrector: SUCCESS!</strong> The URL Manager mathematically recognized your intent and magically fixed it back to <strong style={{ color: '#a855f7' }}>{matchedBoard}</strong>!
                                </div>
                            ) : (
                                <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
                                    💥 <strong>Router Auto-Corrector: FAILED!</strong> The URL Manager could not definitively rescue "{typedUpper}". The physical deviation is too massive or the Anchor Checksum is totally destroyed.
                                </div>
                            )}

                            <div style={{ marginTop: '1rem', padding: '1rem', fontSize: '0.95rem', backgroundColor: 'var(--bg-panel)', borderRadius: '6px', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: 'monospace' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--text)' }}>Engine Telemetry:</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px' }}>
                                    <span>Base Deviation:</span> <span>{matchDist} edits</span>
                                    <span>CRC Anchor Bonus:</span> <span style={{ color: hasCrcBonus ? '#10b981' : '#ef4444' }}>{hasCrcBonus ? '-2 (Match)' : '0 (Mismatched)'}</span>
                                    <strong>Final Penalty:</strong> <strong style={{ color: finalScore <= 3 ? '#10b981' : '#ef4444' }}>{finalScore} (Threshold: ≤ 3)</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
