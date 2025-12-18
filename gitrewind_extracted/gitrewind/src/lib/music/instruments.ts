// Instrument Factory for Tone.js
import * as Tone from 'tone';
import type { InstrumentType } from '@/types/parameters';

export interface InstrumentInstance {
  triggerAttackRelease: (note: string | number, duration: string | number, time?: number) => void;
  triggerAttack: (note: string | number, time?: number) => void;
  triggerRelease: (time?: number) => void;
  dispose: () => void;
  volume: Tone.Param<'decibels'>;
}

export function createInstrument(type: InstrumentType): InstrumentInstance {
  let synth: Tone.PolySynth | Tone.MonoSynth | Tone.FMSynth;

  switch (type) {
    case 'synth':
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.02,
          decay: 0.3,
          sustain: 0.4,
          release: 0.8,
        },
      });
      break;

    case 'piano':
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.005,
          decay: 0.5,
          sustain: 0.1,
          release: 1,
        },
      });
      break;

    case 'electricPiano':
      synth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 3,
        modulationIndex: 10,
        envelope: {
          attack: 0.01,
          decay: 0.3,
          sustain: 0.3,
          release: 0.8,
        },
        modulation: { type: 'sine' },
        modulationEnvelope: {
          attack: 0.2,
          decay: 0.3,
          sustain: 0.5,
          release: 0.8,
        },
      });
      break;

    case 'pad':
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: {
          attack: 0.5,
          decay: 0.5,
          sustain: 0.8,
          release: 2,
        },
      });
      break;

    case 'bass':
      synth = new Tone.MonoSynth({
        oscillator: { type: 'square' },
        envelope: {
          attack: 0.02,
          decay: 0.2,
          sustain: 0.5,
          release: 0.4,
        },
        filterEnvelope: {
          attack: 0.02,
          decay: 0.2,
          sustain: 0.5,
          release: 0.4,
          baseFrequency: 200,
          octaves: 2,
        },
      });
      break;

    case 'strings':
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: {
          attack: 0.3,
          decay: 0.3,
          sustain: 0.7,
          release: 1.5,
        },
      });
      break;

    case 'bells':
      synth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 8,
        modulationIndex: 2,
        envelope: {
          attack: 0.001,
          decay: 0.5,
          sustain: 0.1,
          release: 1.5,
        },
        modulation: { type: 'sine' },
        modulationEnvelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0,
          release: 0.5,
        },
      });
      break;

    case 'guitar':
      synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.005,
          decay: 0.3,
          sustain: 0.2,
          release: 0.6,
        },
      });
      break;

    default:
      synth = new Tone.PolySynth(Tone.Synth);
  }

  // Add reverb
  const reverb = new Tone.Reverb({ decay: 2, wet: 0.3 });
  synth.connect(reverb);
  reverb.toDestination();

  return {
    triggerAttackRelease: (note, duration, time) => {
      const noteStr = typeof note === 'number' ? Tone.Frequency(note, 'midi').toNote() : note;
      synth.triggerAttackRelease(noteStr, duration, time);
    },
    triggerAttack: (note, time) => {
      const noteStr = typeof note === 'number' ? Tone.Frequency(note, 'midi').toNote() : note;
      synth.triggerAttack(noteStr, time);
    },
    triggerRelease: (time) => {
      // MonoSynth requires a time, PolySynth is more flexible
      const releaseTime = time ?? Tone.now();
      synth.triggerRelease(releaseTime);
    },
    dispose: () => {
      synth.dispose();
      reverb.dispose();
    },
    volume: synth.volume,
  };
}

export function createDrumSynth(): {
  kick: Tone.MembraneSynth;
  hihat: Tone.MetalSynth;
  dispose: () => void;
} {
  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: {
      attack: 0.001,
      decay: 0.4,
      sustain: 0,
      release: 0.4,
    },
  }).toDestination();
  kick.volume.value = -6;

  const hihat = new Tone.MetalSynth({
    envelope: {
      attack: 0.001,
      decay: 0.1,
      release: 0.01,
    },
    harmonicity: 5.1,
    modulationIndex: 32,
    resonance: 4000,
    octaves: 1.5,
  }).toDestination();
  hihat.volume.value = -12;

  return {
    kick,
    hihat,
    dispose: () => {
      kick.dispose();
      hihat.dispose();
    },
  };
}
