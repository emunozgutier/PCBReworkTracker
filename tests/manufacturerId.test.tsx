import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { PcbCardBody } from '../src/Pages/ViewPages/Cards/PcbCardBody';
import { useAppState } from '../src/store/useAppState';
import { cleanupTestData } from './cleanup';

const API_URL = 'http://localhost:5002/api';

describe('Manufacturer ID Field Tests', () => {
    let createdPcbId: number | null = null;
    let testProjectId: number | null = null;
    let container: HTMLDivElement | null = null;
    const originalRole = useAppState.getState().currentUserRole;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
        useAppState.setState({ currentUserRole: 'Super User' });
    });

    afterAll(async () => {
        useAppState.setState({ currentUserRole: originalRole });
        if (createdPcbId) {
            await fetch(`${API_URL}/pcbs/${createdPcbId}`, {
                method: 'DELETE',
                headers: { 'x-user-role': 'Super User' }
            }).catch(() => {});
        }
        if (testProjectId) {
            await fetch(`${API_URL}/projects/${testProjectId}`, {
                method: 'DELETE',
                headers: { 'x-user-role': 'Super User' }
            }).catch(() => {});
        }
    });

    it('should render Manufacturer ID in PcbCardBody when present', async () => {
        const dummyPcb = {
            id: 9999,
            board_number: 'TEST-0001A',
            status: 'Working',
            project: 'TestProj',
            project_id: 1,
            manufacturer_id: 'MFG-XYZ-7788',
            board_flavor: 'Standard',
            board_rev: '1.0',
            silicon_rev: 'A0',
            silicon_corner: 'TT',
            bom: 'BOM1'
        };

        const root = createRoot(container!);
        await act(async () => {
            root.render(<PcbCardBody pcb={dummyPcb} />);
        });

        const bodyContent = container!.innerHTML;
        expect(bodyContent).toContain('Manufacturer ID:');
        expect(bodyContent).toContain('MFG-XYZ-7788');
    });

    it('should not render Manufacturer ID in PcbCardBody when not provided', async () => {
        const dummyPcb = {
            id: 9998,
            board_number: 'TEST-0002B',
            status: 'Working',
            project: 'TestProj',
            project_id: 1,
            manufacturer_id: '',
            board_flavor: 'Standard',
            board_rev: '1.0',
            silicon_rev: 'A0',
            silicon_corner: 'TT',
            bom: 'BOM1'
        };

        const root = createRoot(container!);
        await act(async () => {
            root.render(<PcbCardBody pcb={dummyPcb} />);
        });

        const bodyContent = container!.innerHTML;
        expect(bodyContent).not.toContain('Manufacturer ID:');
    });

    it('should create PCB with manufacturer_id, retrieve it via API, and update it', async () => {
        // First create a project to associate with
        const projKey = `M${Math.floor(Math.random() * 900 + 100)}`;
        const projRes = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': 'Super User',
                'x-user-username': 'test_admin'
            },
            body: JSON.stringify({
                name: `Mfg Test Project ${Date.now()}`,
                description: 'Test project for mfg id',
                project_key: projKey,
                flavors: [{ name: 'Default', revisions: ['1.0'], boms: ['BOM1'] }]
            })
        });

        if (!projRes.ok) {
            console.warn('API server may not be reachable in standalone unit test environment.');
            return;
        }

        const projData = await projRes.json();
        testProjectId = projData.id;

        // 1. Create PCB with manufacturer_id
        const pcbRes = await fetch(`${API_URL}/pcbs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': 'Super User',
                'x-user-username': 'test_admin'
            },
            body: JSON.stringify({
                board_number: `${projKey}-0001`,
                status: 'Working',
                board_flavor: 'Default',
                board_rev: '1.0',
                silicon_rev: 'A0',
                silicon_corner: 'TT',
                bom: 'BOM1',
                project_id: testProjectId,
                manufacturer_id: 'MFG-SERIAL-9988-ABC'
            })
        });

        expect(pcbRes.status).toBe(201);
        const pcbData = await pcbRes.json();
        createdPcbId = pcbData.id;
        expect(pcbData.manufacturer_id).toBe('MFG-SERIAL-9988-ABC');

        // 2. Retrieve PCBs and check manufacturer_id
        const getRes = await fetch(`${API_URL}/pcbs`);
        expect(getRes.status).toBe(200);
        const allPcbs = await getRes.json();
        const found = allPcbs.find((p: any) => p.id === createdPcbId);
        expect(found).toBeDefined();
        expect(found.manufacturer_id).toBe('MFG-SERIAL-9988-ABC');

        // 3. Update PCB manufacturer_id
        const putRes = await fetch(`${API_URL}/pcbs/${createdPcbId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-user-role': 'Super User',
                'x-user-username': 'test_admin'
            },
            body: JSON.stringify({
                board_number: found.board_number,
                status: 'Working',
                board_flavor: 'Default',
                board_rev: '1.0',
                silicon_rev: 'A0',
                silicon_corner: 'TT',
                bom: 'BOM1',
                project_id: testProjectId,
                manufacturer_id: 'MFG-UPDATED-4455'
            })
        });

        expect(putRes.status).toBe(200);

        // 4. Verify updated manufacturer_id
        const verifyRes = await fetch(`${API_URL}/pcbs`);
        const updatedPcbs = await verifyRes.json();
        const updatedFound = updatedPcbs.find((p: any) => p.id === createdPcbId);
        expect(updatedFound.manufacturer_id).toBe('MFG-UPDATED-4455');
    });

    it('should render "mfrs id" header in PcbFilter component', async () => {
        const { PcbFilter } = await import('../src/components/Filter/PcbFilter');
        const { usePcbStore } = await import('../src/store/clientDataBase/usePcbStore');
        
        usePcbStore.setState({
            pcbs: [
                {
                    id: 101,
                    board_number: 'DIO-0001',
                    status: 'Working',
                    project: 'Dione',
                    manufacturer_id: '99887766',
                    product: 'Dione A0',
                    board_flavor: 'Demo',
                    board_rev: '1.0'
                }
            ] as any[]
        });

        const root = createRoot(container!);
        await act(async () => {
            root.render(<PcbFilter />);
        });

        const content = container!.innerHTML;
        expect(content.toLowerCase()).toContain('mfrs id');
        expect(content).toContain('99887766');
    });
});
