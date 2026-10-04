// Live profile data via the GitHub GraphQL API, reduced to what the panels show.
// Repositories are restricted to PUBLIC: a personal token can see private ones,
// and their names must never end up on the profile.

import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const CACHE = new URL('../../.cache/github.json', import.meta.url);

const QUERY = `query($login: String!) {
  user(login: $login) {
    login name createdAt
    followers { totalCount }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100, orderBy: {field: PUSHED_AT, direction: DESC}) {
      totalCount
      nodes {
        name description url stargazerCount forkCount pushedAt isArchived
        primaryLanguage { name }
        languages(first: 12, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name } } }
      }
    }
    contributionsCollection {
      totalCommitContributions totalPullRequestContributions totalIssueContributions
      totalPullRequestReviewContributions restrictedContributionsCount
      commitContributionsByRepository(maxRepositories: 25) { repository { name isPrivate } contributions { totalCount } }
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
  }
}`;

function resolveToken() {
  const env = process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (env) return env;
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

async function query(login) {
  const token = resolveToken();
  if (!token) throw new Error('No GitHub token (set GITHUB_TOKEN or run `gh auth login`)');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': `${login}-profile` },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  const body = await res.json();
  if (!res.ok || body.errors) throw new Error(`GraphQL: ${JSON.stringify(body.errors ?? body).slice(0, 300)}`);
  return body.data.user;
}

export async function loadProfile(config) {
  let user;
  try {
    user = await query(config.login);
    await mkdir(new URL('.', CACHE), { recursive: true });
    await writeFile(CACHE, JSON.stringify(user));
  } catch (err) {
    console.warn(`⚠ ${err.message} — falling back to cached data`);
    user = JSON.parse(await readFile(CACHE, 'utf8'));
  }
  return shape(user, config);
}

function shape(user, config) {
  // The profile repo itself is build tooling; keep it out of the stats.
  const repos = user.repositories.nodes.filter((r) => r.name.toLowerCase() !== config.login.toLowerCase());
  const excluded = new Set(config.excludeLanguages ?? []);

  const bytes = new Map();
  for (const r of repos) {
    for (const { size, node } of r.languages.edges) {
      if (!excluded.has(node.name)) bytes.set(node.name, (bytes.get(node.name) ?? 0) + size);
    }
  }
  const totalBytes = [...bytes.values()].reduce((a, b) => a + b, 0) || 1;
  const languages = [...bytes]
    .map(([name, size]) => ({ name, share: size / totalBytes }))
    .sort((a, b) => b.share - a.share);

  const c = user.contributionsCollection;
  const days = c.contributionCalendar.weeks.flatMap((w) => w.contributionDays).map((d) => ({ date: d.date, count: d.contributionCount }));
  const weeks = c.contributionCalendar.weeks.map((w) => ({
    start: w.contributionDays[0].date,
    count: w.contributionDays.reduce((a, d) => a + d.contributionCount, 0),
  }));
  const commitsByRepo = c.commitContributionsByRepository
    .filter((r) => !r.repository.isPrivate)
    .map((r) => ({ name: r.repository.name, commits: r.contributions.totalCount }));

  return {
    login: user.login,
    name: user.name,
    since: user.createdAt.slice(0, 4),
    followers: user.followers.totalCount,
    repos: repos.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stargazerCount,
      forks: r.forkCount,
      pushedAt: r.pushedAt,
      language: r.primaryLanguage?.name ?? null,
      archived: r.isArchived,
    })),
    repoCount: repos.length,
    stars: repos.reduce((a, r) => a + r.stargazerCount, 0),
    languages,
    contributions: {
      total: c.contributionCalendar.totalContributions,
      commits: c.totalCommitContributions,
      prs: c.totalPullRequestContributions,
      issues: c.totalIssueContributions,
      reviews: c.totalPullRequestReviewContributions,
      private: c.restrictedContributionsCount,
    },
    days,
    weeks,
    commitsByRepo,
    ...activity(days),
    syncedAt: new Date().toISOString().slice(0, 10),
  };
}

function activity(days) {
  let longest = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // A streak survives until today ends, so an empty "today" doesn't break it.
  let current = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) current++;
    else if (i !== days.length - 1) break;
  }
  const sum = (from, to) => days.slice(Math.max(0, days.length - to), days.length - from).reduce((a, d) => a + d.count, 0);
  const peak = days.reduce((best, d) => (d.count > best.count ? d : best), { count: 0, date: null });
  return {
    streak: { current, longest },
    peak,
    activeDays: days.filter((d) => d.count > 0).length,
    last30: sum(0, 30),
    prev30: sum(30, 60),
  };
}
