// Transform raw GitHub data to ActivityModel
import type { ActivityModel, LanguageStats, MonthlyActivity, DayActivity } from '@/types/activity';
import type { RawActivityData } from './schemas';
import { getLanguageColor } from '@/lib/utils/color';

function levelToNumber(level: string): 0 | 1 | 2 | 3 | 4 {
  switch (level) {
    case 'NONE': return 0;
    case 'FIRST_QUARTILE': return 1;
    case 'SECOND_QUARTILE': return 2;
    case 'THIRD_QUARTILE': return 3;
    case 'FOURTH_QUARTILE': return 4;
    default: return 0;
  }
}

function computeLongestStreak(dailyActivity: Map<string, DayActivity>): number {
  const sortedDays = Array.from(dailyActivity.entries())
    .sort(([a], [b]) => a.localeCompare(b));

  let longest = 0;
  let current = 0;

  for (const [, day] of sortedDays) {
    if (day.commits > 0) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
}

function computeBusiestDayOfWeek(dailyActivity: Map<string, DayActivity>): number {
  const dayTotals: number[] = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

  for (const [dateStr, day] of dailyActivity) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    dayTotals[dayOfWeek] = (dayTotals[dayOfWeek] ?? 0) + day.commits;
  }

  let busiestDay = 0;
  let maxCommits = 0;

  for (let i = 0; i < 7; i++) {
    if (dayTotals[i]! > maxCommits) {
      maxCommits = dayTotals[i]!;
      busiestDay = i;
    }
  }

  return busiestDay;
}

function computeBusiestMonth(monthlyActivity: MonthlyActivity[]): number {
  let busiestMonth = 0;
  let maxCommits = 0;

  for (const month of monthlyActivity) {
    if (month.commits > maxCommits) {
      maxCommits = month.commits;
      busiestMonth = month.month;
    }
  }

  return busiestMonth;
}

function computeConsistencyScore(dailyActivity: Map<string, DayActivity>): number {
  const totalDays = dailyActivity.size;
  if (totalDays === 0) return 0;

  let activeDays = 0;
  for (const day of dailyActivity.values()) {
    if (day.commits > 0) activeDays++;
  }

  return activeDays / totalDays;
}

function computeWeekdayVsWeekend(dailyActivity: Map<string, DayActivity>): number {
  let weekdayCommits = 0;
  let weekendCommits = 0;

  for (const [dateStr, day] of dailyActivity) {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekendCommits += day.commits;
    } else {
      weekdayCommits += day.commits;
    }
  }

  if (weekendCommits === 0) return 1;
  return weekdayCommits / weekendCommits;
}

export function transformToActivityModel(raw: RawActivityData): ActivityModel {
  // Build daily activity map
  const dailyActivity = new Map<string, DayActivity>();

  for (const week of raw.contributionsCollection.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      dailyActivity.set(day.date, {
        date: day.date,
        commits: day.contributionCount,
        level: levelToNumber(day.contributionLevel),
      });
    }
  }

  // Compute monthly activity
  const monthlyTotals: number[] = new Array(12).fill(0) as number[];

  for (const [dateStr, day] of dailyActivity) {
    const month = new Date(dateStr).getMonth();
    monthlyTotals[month] = (monthlyTotals[month] ?? 0) + day.commits;
  }

  const maxMonthly = Math.max(...monthlyTotals, 1);
  const monthlyActivity: MonthlyActivity[] = monthlyTotals.map((commits, month) => ({
    month,
    commits,
    normalizedActivity: commits / maxMonthly,
  }));

  // Compute language stats
  const languageCounts: Record<string, number> = {};

  for (const repo of raw.repositoriesContributedTo) {
    if (repo.primaryLanguage) {
      const lang = repo.primaryLanguage.name;
      languageCounts[lang] = (languageCounts[lang] ?? 0) + 1;
    }
  }

  const totalLangRepos = Object.values(languageCounts).reduce((a, b) => a + b, 0);
  const languages: LanguageStats[] = Object.entries(languageCounts)
    .map(([name, count]) => ({
      name,
      color: getLanguageColor(name),
      percentage: (count / totalLangRepos) * 100,
      commits: count,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 10);

  // Compute active days
  let activeDays = 0;
  for (const day of dailyActivity.values()) {
    if (day.commits > 0) activeDays++;
  }

  const totalCommits = raw.contributionsCollection.totalCommitContributions;
  const totalPRs = raw.contributionsCollection.totalPullRequestContributions;
  const totalReviews = raw.contributionsCollection.totalPullRequestReviewContributions;

  return {
    user: {
      login: raw.user.login,
      name: raw.user.name,
      avatarUrl: raw.user.avatarUrl,
      memberSince: new Date(raw.user.createdAt),
    },

    year: raw.year,

    totals: {
      commits: totalCommits,
      pullRequests: totalPRs,
      reviews: totalReviews,
      additions: 0, // Not available without additional API calls
      deletions: 0,
      activeDays,
      longestStreak: computeLongestStreak(dailyActivity),
      repositories: raw.repositoriesContributedTo.length,
    },

    patterns: {
      busiestDayOfWeek: computeBusiestDayOfWeek(dailyActivity),
      busiestHour: 14, // Would need commit timestamps for accurate data
      busiestMonth: computeBusiestMonth(monthlyActivity),
      consistencyScore: computeConsistencyScore(dailyActivity),
      weekdayVsWeekend: computeWeekdayVsWeekend(dailyActivity),
    },

    languages,
    collaborators: [], // Would need additional API calls for collaborator data
    dailyActivity,
    monthlyActivity,
  };
}
