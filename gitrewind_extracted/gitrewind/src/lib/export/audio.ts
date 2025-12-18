// Audio Export using Tone.js Recorder
import * as Tone from 'tone';
import { eventBus } from '@/lib/core/events';

export interface AudioExportOptions {
  duration: number; // in seconds
  format?: 'wav' | 'webm';
}

let recorder: Tone.Recorder | null = null;
let isRecording = false;

/**
 * Initialize the audio recorder
 * Must be called after Tone.js audio context is started
 */
export function initAudioRecorder(): Tone.Recorder {
  if (!recorder) {
    recorder = new Tone.Recorder();
    // Connect to the master output
    Tone.getDestination().connect(recorder);
  }
  return recorder;
}

/**
 * Start recording audio
 */
export async function startAudioRecording(): Promise<void> {
  if (isRecording) {
    console.warn('Already recording audio');
    return;
  }

  const rec = initAudioRecorder();
  await rec.start();
  isRecording = true;
  eventBus.emit('export:start', { format: 'audio-wav' });
}

/**
 * Stop recording and return the audio blob
 */
export async function stopAudioRecording(): Promise<Blob> {
  if (!recorder || !isRecording) {
    throw new Error('Not currently recording');
  }

  const blob = await recorder.stop();
  isRecording = false;

  eventBus.emit('export:complete', {
    format: 'audio-wav',
    blob,
    url: URL.createObjectURL(blob),
  });

  return blob;
}

/**
 * Export audio for a specified duration
 * This records the audio output from Tone.js while playback happens
 */
export async function exportAudio(options: AudioExportOptions): Promise<Blob> {
  const { duration } = options;

  return new Promise((resolve, reject) => {
    const rec = initAudioRecorder();

    eventBus.emit('export:start', { format: 'audio-wav' });

    // Start recording
    rec
      .start()
      .then(() => {
        isRecording = true;

        // Update progress
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min(elapsed / duration, 1);
          eventBus.emit('export:progress', {
            format: 'audio-wav',
            progress: progress * 100,
          });
        }, 100);

        // Stop after duration
        setTimeout(async () => {
          clearInterval(progressInterval);

          try {
            const blob = await rec.stop();
            isRecording = false;

            eventBus.emit('export:complete', {
              format: 'audio-wav',
              blob,
              url: URL.createObjectURL(blob),
            });

            resolve(blob);
          } catch (err) {
            eventBus.emit('export:error', {
              format: 'audio-wav',
              error: err instanceof Error ? err : new Error('Recording failed'),
            });
            reject(err);
          }
        }, duration * 1000);
      })
      .catch((err) => {
        eventBus.emit('export:error', {
          format: 'audio-wav',
          error: err instanceof Error ? err : new Error('Failed to start recording'),
        });
        reject(err);
      });
  });
}

/**
 * Check if audio recording is currently in progress
 */
export function isAudioRecording(): boolean {
  return isRecording;
}

/**
 * Dispose of the recorder
 */
export function disposeAudioRecorder(): void {
  if (recorder) {
    recorder.dispose();
    recorder = null;
    isRecording = false;
  }
}
