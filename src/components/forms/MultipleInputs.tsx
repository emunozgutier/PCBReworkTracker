import React, { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface MultipleInputsProps {
    value: string;
    onChange: (newValue: string) => void;
    placeholder?: string;
    usageCounts?: Record<string, number>;
}

export function MultipleInputs({ value, onChange, placeholder, usageCounts }: MultipleInputsProps) {
    const [inputValue, setInputValue] = useState('');

    // Parse the comma-separated value into an array of trimmed strings
    const items = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            addCurrentInput();
        } else if (e.key === 'Backspace' && inputValue === '' && items.length > 0) {
            // Remove the last item when backspace is pressed on empty input (only if it has 0 usage counts)
            const lastItem = items[items.length - 1];
            const count = usageCounts ? usageCounts[lastItem] || 0 : 0;
            if (count === 0) {
                removeItem(items.length - 1);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        if (val.includes(',')) {
            // Handle pasting of comma-separated values or typing a comma
            const parts = val.split(',').map(s => s.trim()).filter(Boolean);
            if (parts.length > 0) {
                const newItems = [...items, ...parts];
                // remove duplicates
                const uniqueItems = Array.from(new Set(newItems));
                onChange(uniqueItems.join(', '));
            }
            setInputValue(''); // Clear input
        } else {
            setInputValue(val); // Just update the typing state
        }
    };

    const addCurrentInput = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !items.includes(trimmed)) {
            const newItems = [...items, trimmed];
            onChange(newItems.join(', '));
        }
        setInputValue('');
    };

    const removeItem = (indexToRemove: number) => {
        const newItems = items.filter((_, idx) => idx !== indexToRemove);
        onChange(newItems.join(', '));
    };

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center',
            padding: '6px 12px',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            minHeight: '44px',
            transition: 'border-color 0.2s ease',
            cursor: 'text'
        }}
        onClick={(e) => {
            const input = e.currentTarget.querySelector('input');
            if (input) input.focus();
        }}>
            {items.map((item, idx) => {
                const count = usageCounts ? usageCounts[item] || 0 : 0;
                const isLocked = count > 0;

                return (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'var(--accent)',
                        padding: '4px 10px',
                        borderRadius: '16px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
                    }}>
                        <span>{item}</span>
                        {isLocked ? (
                            <span style={{ fontSize: '0.75rem', opacity: 0.8, marginLeft: '2px', cursor: 'help' }} title={`${count} PCBs currently using this configuration`}>
                                ({count})
                            </span>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeItem(idx);
                                }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '0',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    marginLeft: '2px'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                );
            })}
            <input
                type="text"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={addCurrentInput}
                placeholder={items.length === 0 ? placeholder : ''}
                style={{
                    flex: 1,
                    minWidth: '120px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text)',
                    fontSize: '1rem',
                    outline: 'none',
                    padding: '4px 0',
                    margin: 0
                }}
            />
        </div>
    );
}
