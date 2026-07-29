import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAppState } from '../../store/useAppState';
import { generateCRC, getNatoWord } from '../../components/UrlManager/crc';

export function CheckSumCard() {
    const { crcFormat, setCrcFormat } = useAppState();
    const [calcInput, setCalcInput] = useState('MAP-0001');

    const cleanInput = calcInput.trim().toUpperCase();
    const previewBase = cleanInput || 'MAP-0001';
    const previewCrc = generateCRC(previewBase);
    const previewNato = getNatoWord(previewCrc);

    return (
        <div className="settings-main-card">
            <div className="settings-card-label">
                <ShieldCheck size={18} color="var(--accent)" />
                <span>CRC Checksum Calculator & Settings</span>
            </div>
            
            <p className="settings-description">
                Enter a base board name (e.g., PROJECT-NUMBER) to calculate its unique CRC checksum, and select your preferred display mode below.
            </p>
            
            <div className="calculator-input-container">
                <input 
                    type="text" 
                    value={calcInput}
                    onChange={e => setCalcInput(e.target.value)}
                    placeholder="e.g. MAP-0001"
                    className="calculator-input"
                />
            </div>

            <div className="settings-options-grid">
                {/* Option 1: Single Letter */}
                <div
                    className={`setting-choice-card ${crcFormat === 'letter' ? 'selected' : ''}`}
                    onClick={() => {
                        setCrcFormat('letter');
                    }}
                >
                    <div className="choice-card-top">
                        <span className="choice-title">Single Letter</span>
                        <div className="choice-radio">
                            {crcFormat === 'letter' && (
                                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                            )}
                        </div>
                    </div>

                    <div className="choice-example-badge">
                        <span className="example-code">
                            {previewBase}<span>{previewCrc}</span>
                        </span>
                    </div>
                </div>

                {/* Option 2: NATO Phonetic Word */}
                <div
                    className={`setting-choice-card ${crcFormat === 'nato' ? 'selected' : ''}`}
                    onClick={() => {
                        setCrcFormat('nato');
                    }}
                >
                    <div className="choice-card-top">
                        <span className="choice-title">NATO Phonetic Word</span>
                        <div className="choice-radio">
                            {crcFormat === 'nato' && (
                                <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffffff' }} />
                            )}
                        </div>
                    </div>

                    <div className="choice-example-badge">
                        <span className="example-tag">NATO:</span>
                        <span className="example-code">
                            {previewBase}<span>{previewNato}</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
