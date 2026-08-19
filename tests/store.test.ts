import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cleanupTestData } from './cleanup';
import { useProjectStore } from '../src/store/clientDataBase/useProjectStore';
import { usePcbStore } from '../src/store/clientDataBase/usePcbStore';
import { useOwnerStore } from '../src/store/clientDataBase/useOwnerStore';
import { useTagStore } from '../src/store/clientDataBase/useTagStore';
import { useReworkStore } from '../src/store/clientDataBase/useReworkStore';
import { useAppState } from '../src/store/useAppState';

describe('Store and Database Integration Tests', () => {
    let projectId: number;
    let projectId2: number;
    let pcbId: number;
    let ownerId: number;
    let tagId: number;

    const uniqueSuffix = Date.now();
    const testProjectName = `VitestUniqueProject${uniqueSuffix}`;
    const testProjectName2 = `VitestProjectTwo${uniqueSuffix}`;
    const testPcbName = `VITEST-PCB-${uniqueSuffix}`;
    const testOwnerName = `Vitest Owner ${uniqueSuffix}`;
    const testTagName = `VITEST-TAG-${uniqueSuffix}`;

    beforeAll(() => {
        useAppState.getState().setCurrentUser(null, 'Super User');
    });

    it('should add a project', async () => {
        const store = useProjectStore.getState();
        const success = await store.addProject({
            name: testProjectName,
            description: 'A test project',
            revisions: 'A1',
            project_key: 'VTT'
        });
        expect(success).toBe(true);
        const updatedStore = useProjectStore.getState();
        expect(updatedStore.error).toBeNull();
        
        const added = updatedStore.projects.find(p => p.name.toLowerCase() === testProjectName.toLowerCase());
        expect(added).toBeDefined();
        if (added) projectId = added.id;
    });

    it('should fail to add a project with the same name (case-insensitive)', async () => {
        const store = useProjectStore.getState();
        const success = await store.addProject({
            name: testProjectName.toLowerCase(),
            description: 'Duplicate',
            revisions: 'A1',
            project_key: 'VVV'
        });
        expect(success).toBe(false);
        const updatedStore = useProjectStore.getState();
        expect(String(updatedStore.error)).toMatch(/already exists|UNIQUE constraint failed/i);
    });

    it('should add an owner (user)', async () => {
        const store = useOwnerStore.getState();
        const success = await store.addOwner({ name: testOwnerName, username: `vitest_owner_${uniqueSuffix}` });
        expect(success).toBe(true);
        
        const updatedStore = useOwnerStore.getState();
        const added = updatedStore.owners.find(o => o.name === testOwnerName);
        expect(added).toBeDefined();
        if (added) ownerId = added.id;
    });

    it('should fail to add an owner with the same name (case-insensitive)', async () => {
        const store = useOwnerStore.getState();
        const success = await store.addOwner({ name: testOwnerName.toLowerCase(), username: `vitest_owner_dup_${uniqueSuffix}` });
        expect(success).toBe(false);
    });

    it('should add a PCB', async () => {
        const store = usePcbStore.getState();
        const success = await store.addPcb({
            board_number: testPcbName,
            status: 'In Progress',
            board_flavor: 'Flavor1',
            board_rev: 'A',
            silicon_rev: 'A0',
            silicon_corner: 'TT',
            project_id: projectId,
            owner_id: ownerId
        });
        if (!success) {
            console.log("addPcb failed with store error:", usePcbStore.getState().error);
        }
        expect(success).toBe(true);
        
        const updatedStore = usePcbStore.getState();
        const added = updatedStore.pcbs.find(p => p.project_id === projectId);
        expect(added).toBeDefined();
        if (added) pcbId = added.id;
    });

    it('should fail to add a PCB with the same board_number in the SAME project (case-insensitive)', async () => {
        const store = usePcbStore.getState();
        const success = await store.addPcb({
            board_number: testPcbName.toLowerCase(),
            status: 'Done',
            board_flavor: 'Flavor1',
            board_rev: 'A',
            silicon_rev: 'A0',
            silicon_corner: 'TT',
            project_id: projectId,
            owner_id: ownerId
        });
        expect(success).toBe(false);
    });

    it('should add a PCB with the same board_number to a DIFFERENT project', async () => {
        const projectStore = useProjectStore.getState();
        const randKey = 'V' + Math.floor(Math.random() * 90 + 10);
        await projectStore.addProject({
            name: testProjectName2,
            description: 'Second project',
            revisions: 'A1',
            project_key: randKey
        });
        const p2 = useProjectStore.getState().projects.find(p => p.name.toLowerCase() === testProjectName2.toLowerCase());
        expect(p2).toBeDefined();
        if (p2) projectId2 = p2.id;

        const store = usePcbStore.getState();
        const success = await store.addPcb({
            board_number: testPcbName, // Same board number
            status: 'Done',
            board_flavor: 'Flavor1',
            board_rev: 'A',
            silicon_rev: 'A0',
            silicon_corner: 'TT',
            project_id: projectId2, // Different project
            owner_id: ownerId
        });
        expect(success).toBe(true);
    });

    it('should fail to delete a Project if it has PCBs (Foreign Key restriction)', async () => {
        const store = useProjectStore.getState();
        const success = await store.deleteProject(projectId);
        expect(success).toBe(false);
        const updatedStore = useProjectStore.getState();
        expect(String(updatedStore.error)).toMatch(/Failed to delete/i);
    });

    it('should add a tag', async () => {
        const store = useTagStore.getState();
        const success = await store.addTag({ name: testTagName, color: '#000' });
        expect(success).toBe(true);
        
        const updatedStore = useTagStore.getState();
        const added = updatedStore.tags.find(t => t.name === testTagName);
        expect(added).toBeDefined();
        if (added) tagId = added.id;
    });

    it('should fail to add a tag with the same name (case-insensitive)', async () => {
        const store = useTagStore.getState();
        const success = await store.addTag({ name: testTagName.toLowerCase(), color: '#fff' });
        expect(success).toBe(false);
    });

    it('should add a rework', async () => {
        const store = useReworkStore.getState();
        const success = await store.addRework({
            pcb_id: pcbId,
            title: 'Test Rework',
            description: 'Vitest test description',
            owner_id: ownerId ? ownerId.toString() : null
        });
        if (!success) {
            console.log("addRework failed with store error:", useReworkStore.getState().error);
        }
        expect(success).toBe(true);
    });

    afterAll(async () => {
        try {
            await cleanupTestData();
        } catch (e) {
            console.error('Failed to run database cleanup:', e);
        }
    });
});
