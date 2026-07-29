import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { TopSettingPage } from '../src/Pages/SettingPage/TopSettingPage';
import { useGlobalSettings } from '../src/store/useGlobalSettings';
import { useAppState } from '../src/store/useAppState';
import { act } from 'react';

describe('TopSettingPage Permissions Checkbox Toggle', () => {
    let container: HTMLDivElement | null = null;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        
        // Reset settings state
        useGlobalSettings.setState({ allowGuestMinorRework: false });
        useAppState.setState({ currentUserRole: 'Super User' });
    });

    it('should visually toggle checkbox when clicked and save successfully', async () => {
        const root = createRoot(container!);
        await act(async () => {
            root.render(<TopSettingPage />);
        });

        // Find the Guest column cell for "Add Low Priority"
        // Let's search inside the rows for one containing "Add Low Priority"
        const rows = Array.from(document.querySelectorAll('tr'));
        const row = rows.find(r => r.textContent?.includes('Add Low Priority'));
        expect(row).toBeDefined();

        // Guest column is the 4th cell (idx 3) in this row (View, Add High, Add Low - wait, Add Low has no resource-cell, so cells are: Action, Super User, User, Guest)
        const cells = row!.querySelectorAll('td');
        expect(cells.length).toBe(4);
        const guestCell = cells[3]; // Guest checkbox cell

        // Inspect checkbox icon class (initiallyDenied-cb)
        let svg = guestCell.querySelector('svg');
        expect(svg?.classList.contains('denied-cb')).toBe(true);

        // Click the checkbox cell
        await act(async () => {
            guestCell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        // Verify that it toggled visually to allowed-cb
        svg = guestCell.querySelector('svg');
        expect(svg?.classList.contains('allowed-cb')).toBe(true);

        // Find and click the "Save Changes" button
        const saveBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Save Changes'));
        expect(saveBtn).toBeDefined();

        await act(async () => {
            saveBtn!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        // Verify that the global settings store was updated
        expect(useGlobalSettings.getState().allowGuestMinorRework).toBe(true);

        root.unmount();
    });
});
