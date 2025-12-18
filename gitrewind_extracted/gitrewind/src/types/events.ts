// Event Types for Git Rewind
import type { ActivityModel } from './activity';
import type { UnifiedParameters } from './parameters';
import type { GraphNode } from './graph';

export interface UserProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
}

export interface BeatEvent {
  beat: number;
  measure: number;
  subdivision: number;
  time: number;
}

export interface MusicSection {
  name: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro';
  startTime: number;
  duration: number;
  energy: number;
}

export type ArtStyle = 'constellation' | 'flowField' | 'circuit' | 'nebula';
export type ExportFormat = 'video-webm' | 'video-mp4' | 'audio-wav' | 'image-png';

export interface RawActivityData {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    createdAt: string;
    bio: string | null;
  };
  contributionCalendar: {
    totalContributions: number;
    weeks: Array<{
      contributionDays: Array<{
        date: string;
        contributionCount: number;
        contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
      }>;
    }>;
  };
  repositoriesContributedTo: Array<{
    nameWithOwner: string;
    primaryLanguage: { name: string; color: string } | null;
    stargazerCount: number;
  }>;
  year: number;
  fetchedAt: string;
}

export type EventMap = {
  // Authentication
  'auth:initiated': { provider: 'github' };
  'auth:success': { token: string; user: UserProfile };
  'auth:error': { error: Error };
  'auth:logout': undefined;

  // Data Pipeline
  'data:fetch:start': { source: string };
  'data:fetch:progress': { source: string; progress: number; stage: string };
  'data:fetch:complete': { source: string; data: RawActivityData };
  'data:fetch:error': { source: string; error: Error };
  'data:transform:complete': { model: ActivityModel };

  // Parameters
  'params:computing': undefined;
  'params:ready': { params: UnifiedParameters };
  'params:updated': { params: Partial<UnifiedParameters>; source: string };

  // Music
  'music:loading': undefined;
  'music:ready': undefined;
  'music:play': undefined;
  'music:pause': undefined;
  'music:stop': undefined;
  'music:seek': { position: number };
  'music:beat': BeatEvent;
  'music:section': { section: MusicSection; index: number };
  'music:complete': undefined;

  // Art
  'art:ready': undefined;
  'art:style:change': { style: ArtStyle };

  // Network
  'network:ready': undefined;
  'network:node:hover': { node: GraphNode | null };
  'network:node:click': { node: GraphNode };

  // Export
  'export:start': { format: ExportFormat };
  'export:progress': { format: ExportFormat; progress: number };
  'export:complete': { format: ExportFormat; blob: Blob; url: string };
  'export:error': { format: ExportFormat; error: Error };
};
