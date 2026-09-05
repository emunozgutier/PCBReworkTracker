import { describe, it, expect, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { NotFound } from '../src/Pages/WrongPage/NotFound';
import { getNormalizedPath } from '../src/components/UrlManager';
import { useAppState } from '../src/store/useAppState';

describe('NotFound Page & URL Diagnostics', () => {
    let container: HTMLDivElement | null = null;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    it('should normalize paths correctly for Caddy /RT/ and GitHub Pages /rework-tracker/ subpaths', () => {
        // Test with simulated window location
        window.history.replaceState({}, '', '/RT/unknown-redirect?query=123');
        expect(getNormalizedPath()).toBe('/unknown-redirect');

        window.history.replaceState({}, '', '/rework-tracker/some/deep/path');
        expect(getNormalizedPath()).toBe('/some/deep/path');

        window.history.replaceState({}, '', '/direct-path');
        expect(getNormalizedPath()).toBe('/direct-path');
    });

    it('should render NotFound component and output the exact redirected URL', async () => {
        const testUrl = 'http://localhost:3000/RT/caddy-redirected-path?source=caddy#debug';
        window.history.replaceState({}, '', '/RT/caddy-redirected-path?source=caddy#debug');

        const root = createRoot(container!);
        await act(async () => {
            root.render(<NotFound />);
        });

        // Verify page header
        expect(container?.textContent).toContain('404 — Page Not Found');
        expect(container?.textContent).toContain('URL Caddy / Proxy Redirected:');

        // Verify URL box displays the pathname and search
        expect(container?.textContent).toContain('/RT/caddy-redirected-path?source=caddy#debug');
        expect(container?.textContent).toContain('/RT/caddy-redirected-path');
        expect(container?.textContent).toContain('?source=caddy');

        // Verify diagnostic labels are rendered
        expect(container?.textContent).toContain('Origin');
        expect(container?.textContent).toContain('Pathname');
        expect(container?.textContent).toContain('Query (Search)');
        expect(container?.textContent).toContain('Vite Base URL');
        expect(container?.textContent).toContain('Normalized App Path');
        expect(container?.textContent).toContain('/caddy-redirected-path');

        // Verify Action buttons
        expect(container?.textContent).toContain('Return to Home');
        expect(container?.textContent).toContain('Copy URL');
        expect(container?.textContent).toContain('Copy All Diagnostics');
    });

    it('should allow setting page to not_found in useAppState', () => {
        useAppState.getState().setPage('not_found');
        expect(useAppState.getState().page).toBe('not_found');
    });
});
