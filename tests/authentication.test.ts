import { describe, it, expect, afterAll, beforeAll } from 'vitest';

const API_URL = 'http://localhost:5002/api';

describe('Authentication & Session Cookie API tests', () => {
    let sessionToken: string;
    let normalUserToken: string;
    let superUserId: number;
    let normalUserId: number;
    let projectId: number;
    let pcbId: number;

    let superUsername: string;
    let normalUsername: string;

    beforeAll(async () => {
        // Run cleanup to clear any leftover test data
        await fetch(`${API_URL}/test/cleanup`, { method: 'POST' });
    });

    it('should setup test owners in database', async () => {
        superUsername = `vitest_super_${Date.now()}`;
        const resSuper = await fetch(`${API_URL}/owners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Vitest Super User',
                username: superUsername,
                email: 'super@vitest.test',
                crc_format: 'letter'
            })
        });
        const superOwner = await resSuper.json();
        superUserId = superOwner.id;

        // Elevate to Super User
        await fetch(`${API_URL}/owners/${superUserId}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'Super User' })
        });

        // Create a normal user
        normalUsername = `vitest_normal_${Date.now()}`;
        const resUser = await fetch(`${API_URL}/owners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Vitest Normal User',
                username: normalUsername,
                email: 'normal@vitest.test',
                crc_format: 'letter'
            })
        });
        const userData = await resUser.json();
        normalUserId = userData.id;

        expect(resUser.status).toBe(201);
    });

    it('should generate a 1-week session token upon successful OTP verification', async () => {
        // Verify OTP for super user (no OTP configured -> succeeds without code)
        const resVerify = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: superUsername,
                token: null
            })
        });
        
        expect(resVerify.status).toBe(200);
        const data = await resVerify.json();
        expect(data.valid).toBe(true);
        expect(data.token).toBeDefined();
        expect(data.user.role).toBe('Super User');
        sessionToken = data.token;

        // Verify OTP for normal user
        const resVerifyUser = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: normalUsername,
                token: null
            })
        });
        const dataUser = await resVerifyUser.json();
        normalUserToken = dataUser.token;
        expect(dataUser.user.role).toBe('User');
    });
    it('should allow Super User to create a project', async () => {
        const uniqueSuffix = Date.now();
        const randKeyNum = Math.floor(Math.random() * 9) + 1; // VT1 - VT9
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({
                name: 'Vitest Auth Project ' + uniqueSuffix,
                description: 'Testing session authentication',
                revisions: 'A0',
                project_key: 'VT' + randKeyNum,
                number_format: 'decimal',
                flavors: []
            })
        });
        if (res.status !== 201) {
            console.log("PROJECT FAILURE STATUS:", res.status, await res.text());
        }
        expect(res.status).toBe(201);
        const data = await res.json();
        projectId = data.id;
    });

    it('should block Guest from creating a project', async () => {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-Role': 'Guest' // Explicitly pass Guest header
            },
            body: JSON.stringify({
                name: 'Guest Project',
                description: 'Should fail',
                revisions: 'A0',
                project_key: 'VT',
                number_format: 'decimal',
                flavors: []
            })
        });
        expect(res.status).toBe(403);
    });

    it('should allow Super User or User to create a PCB', async () => {
        const res = await fetch(`${API_URL}/pcbs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': normalUserToken
            },
            body: JSON.stringify({
                project_id: projectId,
                board_number: '1234',
                board_flavor: 'FlavorA',
                silicon_rev: 'A0',
                owner_id: normalUserId
            })
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        pcbId = data.id;
    });

    it('should block User from updating a PCB they do not own', async () => {
        // Create another PCB owned by Super User
        const resPcb2 = await fetch(`${API_URL}/pcbs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({
                project_id: projectId,
                board_number: '5678',
                board_flavor: 'FlavorA',
                silicon_rev: 'A0',
                owner_id: superUserId
            })
        });
        const pcb2Data = await resPcb2.json();
        const pcb2Id = pcb2Data.id;

        // Try to update pcb2 as normal user (who does not own it)
        const resUpdate = await fetch(`${API_URL}/pcbs/${pcb2Id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': normalUserToken
            },
            body: JSON.stringify({
                board_number: '5678',
                status: 'Failed'
            })
        });
        expect(resUpdate.status).toBe(403);
    });

    it('should allow User to update a PCB they own', async () => {
        const resUpdate = await fetch(`${API_URL}/pcbs/${pcbId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': normalUserToken
            },
            body: JSON.stringify({
                board_number: '1234',
                status: 'Completed',
                owner_id: normalUserId
            })
        });
        expect(resUpdate.status).toBe(200);
    });

    afterAll(async () => {
        // Cleanup test owners and projects
        await fetch(`${API_URL}/test/cleanup`, { method: 'POST' });
        
        // Custom cleanup for our test owners
        if (normalUserId) await fetch(`${API_URL}/owners/${normalUserId}`, { method: 'DELETE' });
        if (superUserId) await fetch(`${API_URL}/owners/${superUserId}`, { method: 'DELETE' });
    });
});
