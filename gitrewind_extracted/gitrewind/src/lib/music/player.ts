// Music Player - Handles playback control
import * as Tone from 'tone';
import type { UnifiedParameters } from '@/types/parameters';
import type { Composition, ScheduledNote } from './composer';
import { composeMusic } from './composer';
import { createInstrument, type InstrumentInstance } from './instruments';
import { eventBus } from '@/lib/core/events';

export class MusicPlayer {
  private composition: Composition | null = null;
  private instruments: Map<string, InstrumentInstance> = new Map();
  private scheduledEvents: number[] = [];
  private beatCallback: number | null = null;
  private isPlaying = false;
  private startTime = 0;

  constructor() {
    // Initialize instruments lazily
  }

  async initialize(params: UnifiedParameters): Promise<void> {
    // Dispose existing instruments
    this.dispose();

    // Create composition
    this.composition = composeMusic(params);

    // Set tempo
    Tone.getTransport().bpm.value = this.composition.bpm;

    // Create instruments for each type used
    const instrumentTypes = new Set<string>();
    for (const section of this.composition.sections) {
      for (const note of section.notes) {
        instrumentTypes.add(note.instrument);
      }
    }

    for (const type of instrumentTypes) {
      this.instruments.set(type, createInstrument(type as any));
    }

    // Schedule all notes
    for (const section of this.composition.sections) {
      for (const note of section.notes) {
        const instrument = this.instruments.get(note.instrument);
        if (!instrument) continue;

        const eventId = Tone.getTransport().schedule((time) => {
          instrument.triggerAttackRelease(note.note, note.duration, time);
        }, note.time);

        this.scheduledEvents.push(eventId);
      }
    }

    // Schedule beat events
    const beatDuration = 60 / this.composition.bpm;
    let beatCount = 0;

    this.beatCallback = Tone.getTransport().scheduleRepeat((time) => {
      const measure = Math.floor(beatCount / 4);
      const beat = beatCount % 4;

      eventBus.emit('music:beat', {
        beat: beatCount,
        measure,
        subdivision: beat,
        time: Tone.getTransport().seconds,
      });

      beatCount++;
    }, beatDuration);

    eventBus.emit('music:ready', undefined);
  }

  async play(): Promise<void> {
    if (this.isPlaying) return;

    // Ensure audio context is started
    await Tone.start();

    Tone.getTransport().start();
    this.isPlaying = true;
    this.startTime = Date.now();

    eventBus.emit('music:play', undefined);

    // Schedule end event
    if (this.composition) {
      setTimeout(() => {
        if (this.isPlaying) {
          this.stop();
          eventBus.emit('music:complete', undefined);
        }
      }, this.composition.totalDuration * 1000);
    }
  }

  pause(): void {
    if (!this.isPlaying) return;

    Tone.getTransport().pause();
    this.isPlaying = false;

    eventBus.emit('music:pause', undefined);
  }

  stop(): void {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
    this.isPlaying = false;

    eventBus.emit('music:stop', undefined);
  }

  seek(position: number): void {
    const wasPlaying = this.isPlaying;

    if (wasPlaying) {
      Tone.getTransport().pause();
    }

    Tone.getTransport().seconds = position;

    if (wasPlaying) {
      Tone.getTransport().start();
    }

    eventBus.emit('music:seek', { position });
  }

  getCurrentTime(): number {
    return Tone.getTransport().seconds;
  }

  getDuration(): number {
    return this.composition?.totalDuration ?? 90;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  setVolume(volume: number): void {
    Tone.getDestination().volume.value = volume <= 0 ? -Infinity : 20 * Math.log10(volume);
  }

  dispose(): void {
    this.stop();

    // Clear scheduled events
    for (const eventId of this.scheduledEvents) {
      Tone.getTransport().clear(eventId);
    }
    this.scheduledEvents = [];

    if (this.beatCallback !== null) {
      Tone.getTransport().clear(this.beatCallback);
      this.beatCallback = null;
    }

    // Dispose instruments
    for (const instrument of this.instruments.values()) {
      instrument.dispose();
    }
    this.instruments.clear();

    this.composition = null;
  }
}

// Singleton instance
let playerInstance: MusicPlayer | null = null;

export function getMusicPlayer(): MusicPlayer {
  if (!playerInstance) {
    playerInstance = new MusicPlayer();
  }
  return playerInstance;
}
