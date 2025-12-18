// Image Export
import { eventBus } from '@/lib/core/events';

export interface ImageExportOptions {
  canvas: HTMLCanvasElement;
  format?: 'png' | 'jpeg';
  quality?: number;  // 0-1 for jpeg
}

export async function exportImage(options: ImageExportOptions): Promise<Blob> {
  const { canvas, format = 'png', quality = 0.95 } = options;

  return new Promise((resolve, reject) => {
    eventBus.emit('export:start', { format: 'image-png' });

    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          eventBus.emit('export:complete', { format: 'image-png', blob, url });
          resolve(blob);
        } else {
          const error = new Error('Failed to create image blob');
          eventBus.emit('export:error', { format: 'image-png', error });
          reject(error);
        }
      },
      mimeType,
      quality
    );
  });
}
