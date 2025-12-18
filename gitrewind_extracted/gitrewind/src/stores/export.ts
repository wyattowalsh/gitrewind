// Export Store - Manages canvas references for export functionality
import { create } from 'zustand';

interface ExportStore {
  artCanvas: HTMLCanvasElement | null;
  networkCanvas: HTMLCanvasElement | null;
  setArtCanvas: (canvas: HTMLCanvasElement | null) => void;
  setNetworkCanvas: (canvas: HTMLCanvasElement | null) => void;
  getCompositeCanvas: () => HTMLCanvasElement | null;
}

export const useExportStore = create<ExportStore>((set, get) => ({
  artCanvas: null,
  networkCanvas: null,

  setArtCanvas: (canvas) => set({ artCanvas: canvas }),
  setNetworkCanvas: (canvas) => set({ networkCanvas: canvas }),

  // Get a composite canvas combining art and network layers
  getCompositeCanvas: () => {
    const { artCanvas, networkCanvas } = get();

    // If we only have art canvas, return it
    if (artCanvas && !networkCanvas) {
      return artCanvas;
    }

    // If we have both, composite them
    if (artCanvas && networkCanvas) {
      const composite = document.createElement('canvas');
      composite.width = artCanvas.width;
      composite.height = artCanvas.height;

      const ctx = composite.getContext('2d');
      if (!ctx) return artCanvas;

      // Draw art background
      ctx.drawImage(artCanvas, 0, 0);

      // Draw network on top (it has transparent background)
      ctx.drawImage(
        networkCanvas,
        0,
        0,
        networkCanvas.width,
        networkCanvas.height,
        0,
        0,
        composite.width,
        composite.height
      );

      return composite;
    }

    return artCanvas ?? networkCanvas;
  },
}));
