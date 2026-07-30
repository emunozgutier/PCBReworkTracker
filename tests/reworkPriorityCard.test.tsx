import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ReworkPriorityCard } from '../src/Pages/SettingPage/ReworkPriorityCard';
import { useAppState } from '../src/store/useAppState';
import { usePriorityStore } from '../src/store/clientDataBase/usePriorityStore';
import { act } from 'react';

describe('ReworkPriorityCard Edit and Save Flow', () => {
    let container: HTMLDivElement | null = null;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        
        // Reset stores to default state
        useAppState.setState({ currentUserRole: 'Super User' });
        usePriorityStore.getState().resetPriorities();
    });

    it('should edit a priority classification locally, display diff in review modal, and persist on confirm save', async () => {
        const root = createRoot(container!);
        await act(async () => {
            root.render(<ReworkPriorityCard />);
        });

        // Find the select element for "Silicon Swap"
        // Initially it should be "High"
        const selects = Array.from(document.querySelectorAll('select'));
        expect(selects.length).toBe(4); // Silicon Swap, Major Rework, Minor Rework, Resistor Swap
        const siliconSwapSelect = selects[0];
        expect(siliconSwapSelect.value).toBe('High');

        // Change select value to "Low"
        await act(async () => {
            siliconSwapSelect.value = 'Low';
            siliconSwapSelect.dispatchEvent(new Event('change', { bubbles: true }));
        });

        // Verify select displays updated local state
        expect(siliconSwapSelect.value).toBe('Low');

        // Verify that the store has not changed yet (persisted only on save)
        expect(usePriorityStore.getState().priorities['Silicon Swap']).toBe('High');

        // Click "Save Changes" to open review modal
        const saveBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Save Changes'));
        expect(saveBtn).toBeDefined();

        await act(async () => {
            saveBtn!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        // Verify review comparison modal is open and has diff text
        const bodyContent = document.body.innerHTML;
        expect(bodyContent).toContain('Silicon Swap: High Priority -&gt; Low Priority');

        // Find and click the "Confirm & Save" button inside the review popup
        const confirmBtn = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent?.includes('Confirm & Save'));
        expect(confirmBtn).toBeDefined();

        await act(async () => {
            confirmBtn!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });

        // Verify that the store was updated
        expect(usePriorityStore.getState().priorities['Silicon Swap']).toBe('Low');

        root.unmount();
    });
});
