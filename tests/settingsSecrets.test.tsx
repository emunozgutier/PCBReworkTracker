import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsSecrets } from '../src/Pages/SettingPage/SettingsSecrets';
import { useAppState } from '../src/store/useAppState';

describe('Settings Secrets Page (/settings/secrets)', () => {
    let container: HTMLDivElement | null = null;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        useAppState.setState({
            currentUserRole: 'Super User',
            currentUser: { id: 1, name: 'Admin', username: 'admin', is_super_user: true },
            page: 'settings_secrets',
            activeTab: 'settings'
        });
    });

    it('should render the secret database settings header and route badge', async () => {
        const onBackMock = vi.fn();
        const root = createRoot(container!);
        await act(async () => {
            root.render(<SettingsSecrets onBack={onBackMock} />);
        });

        expect(container?.textContent).toContain('/settings/secrets');
        expect(container?.textContent).toContain('Back to Settings');
        expect(container?.textContent).toContain('Database Management & Test Mode Settings');
    });

    it('should display backup folder management and DB mode options', async () => {
        const onBackMock = vi.fn();
        const root = createRoot(container!);
        await act(async () => {
            root.render(<SettingsSecrets onBack={onBackMock} />);
        });

        expect(container?.textContent).toContain('Database Backup Folder Location');
        expect(container?.textContent).toContain('Production DB');
        expect(container?.textContent).toContain('Demo DB');
        expect(container?.textContent).toContain('Empty DB');
    });

    it('should trigger onBack when Back to Settings button is clicked', async () => {
        const onBackMock = vi.fn();
        const root = createRoot(container!);
        await act(async () => {
            root.render(<SettingsSecrets onBack={onBackMock} />);
        });

        const backBtn = container?.querySelector('.back-button') as HTMLButtonElement;
        expect(backBtn).toBeDefined();
        await act(async () => {
            backBtn.click();
        });
        expect(onBackMock).toHaveBeenCalledTimes(1);
    });
});
