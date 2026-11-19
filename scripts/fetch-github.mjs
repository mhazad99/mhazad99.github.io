// Downloads your public GitHub profile and repositories into src/data/github.json.
// Runs before every build. If GitHub can't be reached, the last saved copy is used.

import { writeFile } from 'node:fs/promises';
import config from '../site.config.mjs';

const OUT = new URL('../src/data/github.json', import.meta.url);
const user = config.githubUser;
const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': `${user}-website`,
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function get(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

try {
  const profile = await get(`/users/${user}`);
  const repos = await get(`/users/${user}/repos?per_page=100&type=owner&sort=pushed`);
  const data = {
    fetchedAt: new Date().toISOString(),
    profile: {
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      company: profile.company,
      avatar: profile.avatar_url,
      url: profile.html_url,
    },
    repos: repos.map((r) => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      homepage: r.homepage || null,
      language: r.language,
      topics: r.topics || [],
      stars: r.stargazers_count,
      pushedAt: r.pushed_at,
      fork: r.fork,
      archived: r.archived,
    })),
  };
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
  console.log(`Synced ${data.repos.length} repositories from github.com/${user}`);
} catch (err) {
  console.warn(`Could not reach GitHub (${err.message}). Using the saved copy.`);
}
