import { create } from 'zustand';

export interface BoardViewerState {
    visibleLayers: Set<number>;
    searchQuery: string;
    selectedItem: { type: 'element' | 'net'; name: string } | null;
    pan: { x: number; y: number };
    scale: number;
    
    setVisibleLayers: (layers: Set<number>) => void;
    toggleLayer: (layerNumber: number) => void;
    toggleAllLayers: (visible: boolean) => void;
    setSearchQuery: (query: string) => void;
    setSelectedItem: (item: { type: 'element' | 'net'; name: string } | null) => void;
    setPan: (pan: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
    setScale: (scale: number | ((prev: number) => number)) => void;
    resetView: () => void;
}

export const useBoardViewer = create<BoardViewerState>((set) => ({
    visibleLayers: new Set([20, 1, 16, 21, 22, 45]),
    searchQuery: '',
    selectedItem: null,
    pan: { x: 0, y: 0 },
    scale: 1,

    setVisibleLayers: (layers) => set({ visibleLayers: layers }),
    toggleLayer: (layerNumber) => set((state) => {
        const next = new Set(state.visibleLayers);
        if (next.has(layerNumber)) {
            next.delete(layerNumber);
        } else {
            next.add(layerNumber);
        }
        return { visibleLayers: next };
    }),
    toggleAllLayers: (visible) => set({
        visibleLayers: visible ? new Set([20, 1, 16, 21, 22, 45]) : new Set()
    }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedItem: (item) => set({ selectedItem: item }),
    setPan: (pan) => set((state) => ({
        pan: typeof pan === 'function' ? pan(state.pan) : pan
    })),
    setScale: (scale) => set((state) => ({
        scale: typeof scale === 'function' ? scale(state.scale) : scale
    })),
    resetView: () => set({ pan: { x: 0, y: 0 }, scale: 1, selectedItem: null, searchQuery: '' })
}));
