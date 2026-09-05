import { useState } from 'react';
import { useAppState } from '../../store/useAppState';
import { getNormalizedPath } from '../../components/UrlManager';
import { 
    AlertTriangle, 
    Copy, 
    Check, 
    Home, 
    ArrowLeft, 
    Info 
} from 'lucide-react';

export function NotFound() {
    const { setActiveTab } = useAppState();
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const href = typeof window !== 'undefined' ? window.location.href : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const search = typeof window !== 'undefined' ? (window.location.search || '(none)') : '';
    const hash = typeof window !== 'undefined' ? (window.location.hash || '(none)') : '';
    const referrer = typeof document !== 'undefined' ? (document.referrer || '(direct navigation)') : '';
    const viteBase = import.meta.env.BASE_URL || '/';
    const normalized = typeof window !== 'undefined' ? getNormalizedPath() : '/';

    const baseMatch = pathname.match(/^\/(rework-tracker|rt)(\/|$)/i);
    const detectedSubpath = baseMatch ? baseMatch[0] : '(none detected in pathname)';

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(label);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCopyAll = () => {
        const diagnostics = [
            `=== Caddy / Proxy Redirect Diagnostics ===`,
            `Full URL:       ${href}`,
            `Origin:         ${origin}`,
            `Pathname:       ${pathname}`,
            `Search / Query: ${search}`,
            `Hash:           ${hash}`,
            `Referrer:       ${referrer}`,
            `Detected Base:  ${detectedSubpath}`,
            `Vite BASE_URL:  ${viteBase}`,
            `Normalized:     ${normalized}`,
            `Timestamp:      ${new Date().toISOString()}`
        ].join('\n');

        handleCopy(diagnostics, 'all');
    };

    const handleGoHome = () => {
        let base = viteBase;
        if (base.endsWith('/')) base = base.slice(0, -1);
        if (!base && baseMatch) {
            base = baseMatch[0].endsWith('/') ? baseMatch[0].slice(0, -1) : baseMatch[0];
        }
        window.history.pushState({}, '', `${base}/projects`);
        setActiveTab('projects');
    };

    return (
        <div style={{
            maxWidth: '850px',
            margin: '2rem auto',
            padding: '1rem',
            color: 'var(--text)'
        }}>
            {/* Main Alert Card */}
            <div style={{
                background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.85) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '16px',
                padding: '2.5rem',
                boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px -5px rgba(239, 68, 68, 0.15)',
                backdropFilter: 'blur(12px)'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '1.5rem' }}>
                    <div style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        padding: '12px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ef4444'
                    }}>
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#ffffff' }}>
                                404 — Page Not Found
                            </h1>
                            <span style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Redirect Issue
                            </span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                            The requested route was not recognized by the application router.
                        </p>
                    </div>
                </div>

                {/* Prominent URL Display Box */}
                <div style={{ marginBottom: '1.75rem' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <label style={{
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#94a3b8'
                        }}>
                            URL Caddy / Proxy Redirected:
                        </label>
                        <button
                            type="button"
                            onClick={() => handleCopy(href, 'url')}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                background: 'rgba(99, 102, 241, 0.15)',
                                border: '1px solid rgba(99, 102, 241, 0.4)',
                                color: '#a5b4fc',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: 500,
                                transition: 'all 0.15s ease'
                            }}
                        >
                            {copiedField === 'url' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                            {copiedField === 'url' ? 'Copied URL!' : 'Copy URL'}
                        </button>
                    </div>

                    <div style={{
                        backgroundColor: '#020617',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: '1rem',
                        color: '#38bdf8',
                        wordBreak: 'break-all',
                        lineHeight: 1.5,
                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.4)'
                    }}>
                        {href}
                    </div>
                </div>

                {/* Routing & Proxy Diagnostic Details */}
                <div style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    marginBottom: '1.75rem'
                }}>
                    <h3 style={{
                        margin: '0 0 1rem 0',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        color: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Info size={16} color="#60a5fa" />
                        URL &amp; Proxy Diagnostics
                    </h3>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '12px',
                        fontSize: '0.85rem'
                    }}>
                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Origin</span>
                            <span style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>{origin}</span>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Pathname</span>
                            <span style={{ fontFamily: 'monospace', color: '#facc15' }}>{pathname}</span>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Query (Search)</span>
                            <span style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>{search}</span>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Hash</span>
                            <span style={{ fontFamily: 'monospace', color: '#f1f5f9' }}>{hash}</span>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Vite Base URL</span>
                            <span style={{ fontFamily: 'monospace', color: '#a78bfa' }}>{viteBase}</span>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Normalized App Path</span>
                            <span style={{ fontFamily: 'monospace', color: '#34d399' }}>{normalized}</span>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Detected Subpath Match</span>
                            <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{detectedSubpath}</span>
                        </div>

                        <div style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.25)', borderRadius: '6px' }}>
                            <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Referrer (Redirect Origin)</span>
                            <span style={{ fontFamily: 'monospace', color: '#cbd5e1' }}>{referrer}</span>
                        </div>
                    </div>
                </div>

                {/* Helpful Caddy Base Path Tips */}
                <div style={{
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '10px',
                    padding: '1rem',
                    marginBottom: '2rem',
                    fontSize: '0.85rem',
                    color: '#c7d2fe',
                    lineHeight: 1.5
                }}>
                    <strong style={{ color: '#e0e7ff', display: 'block', marginBottom: '4px' }}>
                        💡 Caddy &amp; basePath Troubleshooting Tips:
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                        <li>
                            If using Caddy <code>handle /RT/* &#123; reverse_proxy localhost:5001 &#125;</code> (without stripping), Vite should be started with <code>npm run dev:caddy</code> (which sets <code>--base=/RT/</code>).
                        </li>
                        <li>
                            If using Caddy <code>handle_path /RT/* &#123; reverse_proxy localhost:5001 &#125;</code>, Caddy strips the <code>/RT/</code> prefix so requests hit Vite as <code>/</code>, requiring <code>BASE_PATH=/</code>.
                        </li>
                        <li>
                            For Docker / production environments, set environment variable <code>BASE_PATH=/RT/</code> before building.
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            onClick={handleGoHome}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: 'var(--accent, #6366f1)',
                                color: '#ffffff',
                                padding: '10px 18px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                transition: 'background-color 0.15s ease'
                            }}
                        >
                            <Home size={16} />
                            Return to Home
                        </button>

                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                color: '#e2e8f0',
                                padding: '10px 18px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                cursor: 'pointer',
                                fontWeight: 500,
                                fontSize: '0.9rem'
                            }}
                        >
                            <ArrowLeft size={16} />
                            Go Back
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={handleCopyAll}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'transparent',
                            color: '#94a3b8',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        {copiedField === 'all' ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                        {copiedField === 'all' ? 'Diagnostics Copied!' : 'Copy All Diagnostics'}
                    </button>
                </div>
            </div>
        </div>
    );
}
