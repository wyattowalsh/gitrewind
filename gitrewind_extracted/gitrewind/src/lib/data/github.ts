// GitHub GraphQL Client
import { useDataStore } from '@/stores/data';
import type { RawActivityData } from './schemas';

const GITHUB_GRAPHQL_API = 'https://api.github.com/graphql';

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function graphqlFetch<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(GITHUB_GRAPHQL_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const json = await response.json() as GraphQLResponse<T>;

  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join(', '));
  }

  if (!json.data) {
    throw new Error('No data returned from GitHub API');
  }

  return json.data;
}

const USER_QUERY = `
  query UserProfile($login: String!) {
    user(login: $login) {
      login
      name
      avatarUrl
      createdAt
      bio
    }
  }
`;

const CONTRIBUTIONS_QUERY = `
  query ContributionData($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

const REPOSITORIES_QUERY = `
  query RepositoryContributions($login: String!, $first: Int!, $after: String) {
    user(login: $login) {
      repositoriesContributedTo(
        first: $first
        after: $after
        contributionTypes: [COMMIT, PULL_REQUEST]
        includeUserRepositories: true
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          nameWithOwner
          primaryLanguage {
            name
            color
          }
          stargazerCount
        }
      }
    }
  }
`;

interface UserResponse {
  user: {
    login: string;
    name: string | null;
    avatarUrl: string;
    createdAt: string;
    bio: string | null;
  };
}

interface ContributionsResponse {
  user: {
    contributionsCollection: {
      totalCommitContributions: number;
      totalPullRequestContributions: number;
      totalPullRequestReviewContributions: number;
      contributionCalendar: {
        totalContributions: number;
        weeks: Array<{
          contributionDays: Array<{
            date: string;
            contributionCount: number;
            contributionLevel: string;
          }>;
        }>;
      };
    };
  };
}

interface RepositoriesResponse {
  user: {
    repositoriesContributedTo: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      nodes: Array<{
        nameWithOwner: string;
        primaryLanguage: { name: string; color: string | null } | null;
        stargazerCount: number;
      }>;
    };
  };
}

export async function fetchGitHubData(
  token: string,
  username: string,
  year: number = new Date().getFullYear()
): Promise<RawActivityData> {
  const store = useDataStore.getState();

  // Stage 1: Fetch user profile
  store.setFetching('Fetching your profile...');
  store.setProgress(10, 'Fetching your profile...');

  const userResponse = await graphqlFetch<UserResponse>(
    token,
    USER_QUERY,
    { login: username }
  );

  // Stage 2: Fetch contribution data
  store.setProgress(30, 'Analyzing your commits...');

  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const contributionsResponse = await graphqlFetch<ContributionsResponse>(
    token,
    CONTRIBUTIONS_QUERY,
    { login: username, from, to }
  );

  // Stage 3: Fetch repositories
  store.setProgress(60, 'Mapping your repositories...');

  const allRepos: RepositoriesResponse['user']['repositoriesContributedTo']['nodes'] = [];
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const reposResponse: RepositoriesResponse = await graphqlFetch<RepositoriesResponse>(
      token,
      REPOSITORIES_QUERY,
      { login: username, first: 100, after: cursor }
    );

    allRepos.push(...reposResponse.user.repositoriesContributedTo.nodes);
    hasNextPage = reposResponse.user.repositoriesContributedTo.pageInfo.hasNextPage;
    cursor = reposResponse.user.repositoriesContributedTo.pageInfo.endCursor;

    // Limit to prevent excessive API calls
    if (allRepos.length >= 500) break;
  }

  store.setProgress(90, 'Building your symphony...');

  return {
    user: userResponse.user,
    contributionsCollection: contributionsResponse.user.contributionsCollection,
    repositoriesContributedTo: allRepos.map(repo => ({
      nameWithOwner: repo.nameWithOwner,
      primaryLanguage: repo.primaryLanguage ? {
        name: repo.primaryLanguage.name,
        color: repo.primaryLanguage.color ?? '#808080',
      } : null,
      stargazerCount: repo.stargazerCount,
    })),
    year,
    fetchedAt: new Date().toISOString(),
  };
}
