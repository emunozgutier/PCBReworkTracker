/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppState } from '../src/store/useAppState';
import { formatCrc, getNatoWord } from '../src/components/UrlManager/crc';
import { getBiggestRevision } from '../src/Pages/AddPages/AddPcb';

describe('Global Settings Store Unit Tests', () => {
    beforeEach(() => {
        // Reset settings before each test
        useAppState.getState().resetSettings();
    });

    it('should initialize with default crcFormat of "letter"', () => {
        const state = useAppState.getState();
        expect(state.crcFormat).toBe('letter');
    });

    it('should set crcFormat to "nato"', () => {
        const store = useAppState.getState();
        store.setCrcFormat('nato');

        expect(useAppState.getState().crcFormat).toBe('nato');
    });

    it('should toggle crcFormat between "letter" and "nato"', () => {
        const store = useAppState.getState();
        expect(store.crcFormat).toBe('letter');

        store.toggleCrcFormat();
        expect(useAppState.getState().crcFormat).toBe('nato');

        useAppState.getState().toggleCrcFormat();
        expect(useAppState.getState().crcFormat).toBe('letter');
    });

    it('should reset settings to default values', () => {
        const store = useAppState.getState();
        store.setCrcFormat('nato');
        expect(useAppState.getState().crcFormat).toBe('nato');

        store.resetSettings();
        expect(useAppState.getState().crcFormat).toBe('letter');
    });

    it('should format CRC characters properly using formatCrc and getNatoWord helpers', () => {
        expect(getNatoWord('G')).toBe('Golf');
        expect(getNatoWord('k')).toBe('Kilo');

        expect(formatCrc('G', 'letter')).toBe('G');
        expect(formatCrc('G', 'nato')).toBe('Golf');
    });

    it('should pick the biggest silicon revision correctly where C0 > B1 > B0 > A2', () => {
        expect(getBiggestRevision(['A2', 'B0', 'B1', 'C0'])).toBe('C0');
        expect(getBiggestRevision(['B0', 'B1'])).toBe('B1');
        expect(getBiggestRevision(['A2', 'B0'])).toBe('B0');
        expect(getBiggestRevision(['A2'])).toBe('A2');
        expect(getBiggestRevision([])).toBe('');
    });
});
