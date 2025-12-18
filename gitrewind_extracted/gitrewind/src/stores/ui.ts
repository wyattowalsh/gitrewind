// UI Store
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type Theme = 'dark' | 'light' | 'system';
type ActivePanel = 'network' | 'music' | 'art' | null;

interface Modals {
  share: boolean;
  export: boolean;
  settings: boolean;
}

interface UIState {
  theme: Theme;
  activePanel: ActivePanel;
  modals: Modals;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
}

interface UIActions {
  setTheme: (theme: Theme) => void;
  setActivePanel: (panel: ActivePanel) => void;
  openModal: (modal: keyof Modals) => void;
  closeModal: (modal: keyof Modals) => void;
  closeAllModals: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  toggleMute: () => void;
}

export const useUIStore = create<UIState & UIActions>()(
  immer((set) => ({
    theme: 'dark',
    activePanel: null,
    modals: {
      share: false,
      export: false,
      settings: false,
    },
    isPlaying: false,
    currentTime: 0,
    duration: 90,
    volume: 0.8,
    isMuted: false,

    setTheme: (theme: Theme) => {
      set((state) => {
        state.theme = theme;
      });
    },

    setActivePanel: (panel: ActivePanel) => {
      set((state) => {
        state.activePanel = panel;
      });
    },

    openModal: (modal: keyof Modals) => {
      set((state) => {
        state.modals[modal] = true;
      });
    },

    closeModal: (modal: keyof Modals) => {
      set((state) => {
        state.modals[modal] = false;
      });
    },

    closeAllModals: () => {
      set((state) => {
        state.modals.share = false;
        state.modals.export = false;
        state.modals.settings = false;
      });
    },

    setIsPlaying: (isPlaying: boolean) => {
      set((state) => {
        state.isPlaying = isPlaying;
      });
    },

    setCurrentTime: (time: number) => {
      set((state) => {
        state.currentTime = time;
      });
    },

    setDuration: (duration: number) => {
      set((state) => {
        state.duration = duration;
      });
    },

    setVolume: (volume: number) => {
      set((state) => {
        state.volume = volume;
        if (volume > 0) state.isMuted = false;
      });
    },

    setMuted: (isMuted: boolean) => {
      set((state) => {
        state.isMuted = isMuted;
      });
    },

    toggleMute: () => {
      set((state) => {
        state.isMuted = !state.isMuted;
      });
    },
  }))
);
