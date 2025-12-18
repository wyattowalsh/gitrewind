// Activity Types for Git Rewind

export interface RawUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  createdAt: string;
  bio: string | null;
}

export interface RawContributionCalendar {
  totalContributions: number;
  weeks: Array<{
    contributionDays: Array<{
      date: string;
      contributionCount: number;
      contributionLevel: 'NONE' | 'FIRST_QUARTILE' | 'SECOND_QUARTILE' | 'THIRD_QUARTILE' | 'FOURTH_QUARTILE';
    }>;
  }>;
}

export interface RawRepository {
  nameWithOwner: string;
  primaryLanguage: { name: string; color: string } | null;
  stargazerCount: number;
}

export interface RawActivityData {
  user: RawUser;
  contributionCalendar: RawContributionCalendar;
  repositoriesContributedTo: RawRepository[];
  year: number;
  fetchedAt: string;
}

export interface LanguageStats {
  name: string;
  color: string;
  percentage: number;
  commits: number;
}

export interface CollaboratorStats {
  login: string;
  avatarUrl: string;
  interactions: number;
  sharedRepos: string[];
}

export interface DayActivity {
  date: string;
  commits: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface MonthlyActivity {
  month: number;
  commits: number;
  normalizedActivity: number;
}

export interface ActivityModel {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    memberSince: Date;
  };

  year: number;

  totals: {
    commits: number;
    pullRequests: number;
    reviews: number;
    additions: number;
    deletions: number;
    activeDays: number;
    longestStreak: number;
    repositories: number;
  };

  patterns: {
    busiestDayOfWeek: number;
    busiestHour: number;
    busiestMonth: number;
    consistencyScore: number;
    weekdayVsWeekend: number;
  };

  languages: LanguageStats[];
  collaborators: CollaboratorStats[];
  dailyActivity: Map<string, DayActivity>;
  monthlyActivity: MonthlyActivity[];
}
