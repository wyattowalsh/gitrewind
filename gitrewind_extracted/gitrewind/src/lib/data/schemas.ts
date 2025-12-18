// Zod schemas for data validation
import { z } from 'zod';

export const UserSchema = z.object({
  login: z.string(),
  name: z.string().nullable(),
  avatarUrl: z.string(),
  createdAt: z.string(),
  bio: z.string().nullable(),
});

export const ContributionDaySchema = z.object({
  date: z.string(),
  contributionCount: z.number(),
  contributionLevel: z.string(),
});

export const ContributionWeekSchema = z.object({
  contributionDays: z.array(ContributionDaySchema),
});

export const ContributionCalendarSchema = z.object({
  totalContributions: z.number(),
  weeks: z.array(ContributionWeekSchema),
});

export const ContributionsCollectionSchema = z.object({
  totalCommitContributions: z.number(),
  totalPullRequestContributions: z.number(),
  totalPullRequestReviewContributions: z.number(),
  contributionCalendar: ContributionCalendarSchema,
});

export const LanguageSchema = z.object({
  name: z.string(),
  color: z.string().nullable(),
});

export const RepositorySchema = z.object({
  nameWithOwner: z.string(),
  primaryLanguage: LanguageSchema.nullable(),
  stargazerCount: z.number(),
});

export const RawActivityDataSchema = z.object({
  user: UserSchema,
  contributionsCollection: ContributionsCollectionSchema,
  repositoriesContributedTo: z.array(RepositorySchema),
  year: z.number(),
  fetchedAt: z.string(),
});

export type RawActivityData = z.infer<typeof RawActivityDataSchema>;
