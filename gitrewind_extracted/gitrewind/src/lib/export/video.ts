// Video Export using MediaRecorder
import { eventBus } from '@/lib/core/events';

export interface VideoExportOptions {
  canvas: HTMLCanvasElement;
  duration: number;  // in seconds
  fps?: number;
  mimeType?: string;
}

export async function exportVideo(options: VideoExportOptions): Promise<Blob> {
  const { canvas, duration, fps = 30, mimeType = 'video/webm' } = options;

  return new Promise((resolve, reject) => {
    // Check if MediaRecorder is supported
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      reject(new Error(`${mimeType} is not supported`));
      return;
    }

    eventBus.emit('export:start', { format: 'video-webm' });

    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 5000000, // 5 Mbps
    });

    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);

      eventBus.emit('export:complete', { format: 'video-webm', blob, url });
      resolve(blob);
    };

    recorder.onerror = (e) => {
      eventBus.emit('export:error', { format: 'video-webm', error: new Error('Recording failed') });
      reject(e);
    };

    // Start recording
    recorder.start();

    // Update progress
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      eventBus.emit('export:progress', { format: 'video-webm', progress: progress * 100 });
    }, 100);

    // Stop after duration
    setTimeout(() => {
      clearInterval(progressInterval);
      recorder.stop();
    }, duration * 1000);
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
