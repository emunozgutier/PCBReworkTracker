/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppState } from '../src/store/useAppState';
import { resolveQrUrl, getQrCapacity, getQrGridSize, QR_ERROR_CORRECTION_LEVELS } from '../src/components/UrlManager/qrHelper';

describe('QR Settings and URL Resolution Unit Tests', () => {
    beforeEach(() => {
        useAppState.getState().resetSettings();
    });

    it('should initialize with default QR code settings', () => {
        const state = useAppState.getState();
        expect(state.qrCodeUrlType).toBe('full');
        expect(state.qrCodeBaseUrlType).toBe('current');
        expect(state.qrCodeCustomBaseUrl).toBe('');
        expect(state.qrCodeErrorCorrection).toBe('L');
    });

    it('should update qrCodeUrlType, qrCodeBaseUrlType, and qrCodeCustomBaseUrl', () => {
        const store = useAppState.getState();
        store.setQrCodeUrlType('compressed');
        expect(useAppState.getState().qrCodeUrlType).toBe('compressed');

        store.setQrCodeBaseUrlType('custom');
        expect(useAppState.getState().qrCodeBaseUrlType).toBe('custom');

        store.setQrCodeCustomBaseUrl('https://my-custom-rework-hub.internal');
        expect(useAppState.getState().qrCodeCustomBaseUrl).toBe('https://my-custom-rework-hub.internal');
    });

    it('should update qrCodeErrorCorrection level (L, M, Q, H)', () => {
        const store = useAppState.getState();
        store.setQrCodeErrorCorrection('M');
        expect(useAppState.getState().qrCodeErrorCorrection).toBe('M');

        store.setQrCodeErrorCorrection('Q');
        expect(useAppState.getState().qrCodeErrorCorrection).toBe('Q');

        store.setQrCodeErrorCorrection('H');
        expect(useAppState.getState().qrCodeErrorCorrection).toBe('H');

        store.setQrCodeErrorCorrection('L');
        expect(useAppState.getState().qrCodeErrorCorrection).toBe('L');
    });

    it('should resolve full board URL correctly', () => {
        const result = resolveQrUrl('MAP-0001', 'MQ9', {
            urlType: 'full',
            baseUrlType: 'current'
        });

        expect(result.isCompressed).toBe(false);
        expect(result.path).toBe('/pcbs/MAP-0001/view');
        expect(result.url).toContain('/pcbs/MAP-0001/view');
    });

    it('should resolve compressed short code (3 or 4 chars) URL correctly', () => {
        // 3-character short code
        const res3 = resolveQrUrl('MAP-0001', 'MQ9', {
            urlType: 'compressed',
            baseUrlType: 'current'
        });
        expect(res3.isCompressed).toBe(true);
        expect(res3.path).toBe('/MQ9');
        expect(res3.url).toContain('/MQ9');

        // 4-character short code
        const res4 = resolveQrUrl('MAP-0002', 'A1B2', {
            urlType: 'compressed',
            baseUrlType: 'current'
        });
        expect(res4.isCompressed).toBe(true);
        expect(res4.path).toBe('/A1B2');
        expect(res4.url).toContain('/A1B2');
    });

    it('should fallback to full URL if compressed is requested but no short code exists', () => {
        const res = resolveQrUrl('MAP-0003', undefined, {
            urlType: 'compressed',
            baseUrlType: 'current'
        });
        expect(res.isCompressed).toBe(false);
        expect(res.path).toBe('/pcbs/MAP-0003/view');
    });

    it('should use custom domain when baseUrlType is custom and URL is provided', () => {
        const result = resolveQrUrl('MAP-0001', 'MQ9', {
            urlType: 'compressed',
            baseUrlType: 'custom',
            customBaseUrl: 'https://pcb.mycompany.com'
        });

        expect(result.isCustomBase).toBe(true);
        expect(result.domain).toBe('https://pcb.mycompany.com');
        expect(result.path).toBe('/MQ9');
        expect(result.url).toBe('https://pcb.mycompany.com/MQ9');
    });

    it('should sanitize trailing slashes on custom domain', () => {
        const result = resolveQrUrl('MAP-0001', 'MQ9', {
            urlType: 'full',
            baseUrlType: 'custom',
            customBaseUrl: 'https://pcb.mycompany.com///'
        });

        expect(result.domain).toBe('https://pcb.mycompany.com');
        expect(result.url).toBe('https://pcb.mycompany.com/pcbs/MAP-0001/view');
    });

    it('should accurately return grid sizes and capacities across versions and recovery levels', () => {
        // Version 1 is 21x21 (smallest)
        expect(getQrGridSize(1)).toBe(21);
        expect(getQrGridSize(2)).toBe(25);
        expect(getQrGridSize(3)).toBe(29);

        // Version 1 (21x21) capacities per recovery level
        expect(getQrCapacity(1, 'L')).toBe(17);
        expect(getQrCapacity(1, 'M')).toBe(14);
        expect(getQrCapacity(1, 'Q')).toBe(11);
        expect(getQrCapacity(1, 'H')).toBe(7);

        // Version 2 (25x25) capacity
        expect(getQrCapacity(2, 'L')).toBe(32);

        // Defined recovery level list
        expect(QR_ERROR_CORRECTION_LEVELS.length).toBe(4);
        expect(QR_ERROR_CORRECTION_LEVELS.map(l => l.level)).toEqual(['L', 'M', 'Q', 'H']);
    });

    it('should reset QR settings on resetSettings()', () => {
        const store = useAppState.getState();
        store.setQrCodeUrlType('compressed');
        store.setQrCodeBaseUrlType('custom');
        store.setQrCodeCustomBaseUrl('https://custom.domain');
        store.setQrCodeErrorCorrection('H');

        store.resetSettings();
        const state = useAppState.getState();
        expect(state.qrCodeUrlType).toBe('full');
        expect(state.qrCodeBaseUrlType).toBe('current');
        expect(state.qrCodeCustomBaseUrl).toBe('');
        expect(state.qrCodeErrorCorrection).toBe('L');
    });
});
