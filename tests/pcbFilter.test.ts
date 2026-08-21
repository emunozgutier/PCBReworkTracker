import { describe, it, expect } from 'vitest';
import { isNoPartRev, isNoPartCorner, matchRevision, matchCorner } from '../src/components/Filter/PcbFilter';

describe('PCB Filter NA Silicon Rev & Corner Tests', () => {
    const pcbWithPart = {
        id: 1,
        board_number: 'DIO-0001',
        project: 'Dione',
        silicon_rev: 'A0',
        silicon_corner: 'FF',
        product: 'Val A0 FF'
    };

    const pcbNoPartRevAndCorner = {
        id: 2,
        board_number: 'DIO-0002',
        project: 'Dione',
        silicon_rev: 'No part',
        silicon_corner: '',
        product: 'Val No part'
    };

    const pcbNullPart = {
        id: 3,
        board_number: 'DIO-0003',
        project: 'Dione',
        silicon_rev: '',
        silicon_corner: '',
        product: 'Val'
    };

    const pcbExplicitNaPart = {
        id: 4,
        board_number: 'DIO-0004',
        project: 'Dione',
        silicon_rev: 'NA',
        silicon_corner: 'NA',
        product: 'Val NA'
    };

    it('should correctly identify whether a PCB has no part installed for rev', () => {
        expect(isNoPartRev(pcbWithPart)).toBe(false);
        expect(isNoPartRev(pcbNoPartRevAndCorner)).toBe(true);
        expect(isNoPartRev(pcbNullPart)).toBe(true);
        expect(isNoPartRev(pcbExplicitNaPart)).toBe(true);
    });

    it('should correctly identify whether a PCB has no part installed for corner', () => {
        expect(isNoPartCorner(pcbWithPart)).toBe(false);
        expect(isNoPartCorner(pcbNoPartRevAndCorner)).toBe(true);
        expect(isNoPartCorner(pcbNullPart)).toBe(true);
        expect(isNoPartCorner(pcbExplicitNaPart)).toBe(true);
    });

    it('should match silicon rev with NA filter when no part installed', () => {
        expect(matchRevision(pcbWithPart, ['NA'])).toBe(false);
        expect(matchRevision(pcbWithPart, ['A0'])).toBe(true);
        expect(matchRevision(pcbWithPart, ['A0', 'NA'])).toBe(true);

        expect(matchRevision(pcbNoPartRevAndCorner, ['NA'])).toBe(true);
        expect(matchRevision(pcbNoPartRevAndCorner, ['A0'])).toBe(false);
        expect(matchRevision(pcbNoPartRevAndCorner, ['A0', 'NA'])).toBe(true);

        expect(matchRevision(pcbNullPart, ['NA'])).toBe(true);
        expect(matchRevision(pcbNullPart, ['A0'])).toBe(false);

        expect(matchRevision(pcbExplicitNaPart, ['NA'])).toBe(true);
        expect(matchRevision(pcbExplicitNaPart, ['A0'])).toBe(false);
    });

    it('should match silicon corner with NA filter when no part installed', () => {
        expect(matchCorner(pcbWithPart, ['NA'])).toBe(false);
        expect(matchCorner(pcbWithPart, ['FF'])).toBe(true);
        expect(matchCorner(pcbWithPart, ['FF', 'NA'])).toBe(true);

        expect(matchCorner(pcbNoPartRevAndCorner, ['NA'])).toBe(true);
        expect(matchCorner(pcbNoPartRevAndCorner, ['FF'])).toBe(false);
        expect(matchCorner(pcbNoPartRevAndCorner, ['FF', 'NA'])).toBe(true);

        expect(matchCorner(pcbNullPart, ['NA'])).toBe(true);
        expect(matchCorner(pcbNullPart, ['FF'])).toBe(false);

        expect(matchCorner(pcbExplicitNaPart, ['NA'])).toBe(true);
        expect(matchCorner(pcbExplicitNaPart, ['FF'])).toBe(false);
    });

    it('should allow all boards when no rev/corner filter is selected', () => {
        expect(matchRevision(pcbWithPart, [])).toBe(true);
        expect(matchRevision(pcbNoPartRevAndCorner, [])).toBe(true);
        expect(matchCorner(pcbWithPart, [])).toBe(true);
        expect(matchCorner(pcbNoPartRevAndCorner, [])).toBe(true);
    });
});
