import { Search, X, Cpu, GitCommit } from 'lucide-react';

interface SearchProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    elements: Array<{ name: string; value?: string; package?: string }>;
    nets: string[];
    onSelect: (type: 'element' | 'net', name: string) => void;
    selectedItem: { type: 'element' | 'net'; name: string } | null;
}

export function BoardSearch({
    searchQuery,
    onSearchChange,
    elements,
    nets,
    onSelect,
    selectedItem
}: SearchProps) {
    const cleanQuery = searchQuery.trim().toLowerCase();

    // Filter elements and nets based on query
    const filteredElements = cleanQuery
        ? elements.filter(
              (el) =>
                  el.name.toLowerCase().includes(cleanQuery) ||
                  (el.value && el.value.toLowerCase().includes(cleanQuery)) ||
                  (el.package && el.package.toLowerCase().includes(cleanQuery))
          )
        : elements.slice(0, 15); // Show first 15 by default

    const filteredNets = cleanQuery
        ? nets.filter((net) => net.toLowerCase().includes(cleanQuery))
        : nets.slice(0, 15); // Show first 15 by default

    const hasResults = filteredElements.length > 0 || filteredNets.length > 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    placeholder="Search component or net..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (filteredElements.length > 0) {
                                onSelect('element', filteredElements[0].name);
                            } else if (filteredNets.length > 0) {
                                onSelect('net', filteredNets[0]);
                            }
                        }
                    }}
                    style={{
                        width: '100%',
                        padding: '10px 36px 10px 32px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-h)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent)';
                        e.target.style.boxShadow = '0 0 0 2px var(--accent-bg)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
                <Search
                    size={16}
                    color="var(--text-muted)"
                    style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                    }}
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            <div
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    paddingRight: '4px'
                }}
            >
                {/* Components / Elements list */}
                <div>
                    <h4
                        style={{
                            margin: '0 0 8px 0',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--accent)'
                        }}
                    >
                        Components {cleanQuery ? `(${filteredElements.length})` : ''}
                    </h4>
                    {filteredElements.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {filteredElements.map((el) => {
                                const isSelected =
                                    selectedItem?.type === 'element' && selectedItem?.name === el.name;
                                return (
                                    <div
                                        key={el.name}
                                        onClick={() => onSelect('element', el.name)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '8px 10px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: isSelected
                                                ? 'var(--accent-bg)'
                                                : 'rgba(255, 255, 255, 0.01)',
                                            border: isSelected
                                                ? '1px solid var(--accent)'
                                                : '1px solid transparent',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                            <Cpu size={14} color={isSelected ? 'var(--accent)' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {el.name}
                                            </span>
                                        </div>
                                        {el.value && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {el.value}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No matching components.
                        </p>
                    )}
                </div>

                {/* Nets list */}
                <div>
                    <h4
                        style={{
                            margin: '0 0 8px 0',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#818cf8'
                        }}
                    >
                        Nets / Signals {cleanQuery ? `(${filteredNets.length})` : ''}
                    </h4>
                    {filteredNets.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {filteredNets.map((net) => {
                                const isSelected =
                                    selectedItem?.type === 'net' && selectedItem?.name === net;
                                return (
                                    <div
                                        key={net}
                                        onClick={() => onSelect('net', net)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            padding: '8px 10px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            background: isSelected
                                                ? 'rgba(129, 140, 248, 0.15)'
                                                : 'rgba(255, 255, 255, 0.01)',
                                            border: isSelected
                                                ? '1px solid #818cf8'
                                                : '1px solid transparent',
                                            transition: 'all 0.15s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)';
                                        }}
                                    >
                                        <GitCommit size={14} color={isSelected ? '#818cf8' : 'var(--text-muted)'} style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 550, color: 'var(--text-h)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {net}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No matching nets.
                        </p>
                    )}
                </div>

                {!hasResults && cleanQuery && (
                    <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        No results found for "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}
