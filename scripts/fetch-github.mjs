// Downloads public GitHub data into src/data/github.json before every build:
// my profile, my own repositories, and my commits in other repositories.
// Anything GitHub can't provide right now keeps its last saved value.

import { readFile, writeFile } from 'node:fs/promises';
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
  return { body: await res.json(), link: res.headers.get('link') || '' };
}

let saved = {};
try { saved = JSON.parse(await readFile(OUT, 'utf8')); } catch {}
const data = { ...saved };
let changed = false;

try {
  const { body: profile } = await get(`/users/${user}`);
  const { body: repos } = await get(`/users/${user}/repos?per_page=100&type=owner&sort=pushed`);
  data.profile = {
    name: profile.name,
    bio: profile.bio,
    location: profile.location,
    company: profile.company,
    avatar: profile.avatar_url,
    url: profile.html_url,
  };
  data.repos = repos.map((r) => ({
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
  }));
  changed = true;
  console.log(`Synced ${data.repos.length} repositories from github.com/${user}`);
} catch (err) {
  console.warn(`Could not read github.com/${user} (${err.message}). Using the saved copy.`);
}

// My commits in other people's repositories.
const old = Object.fromEntries((saved.contributions || []).map((c) => [c.repo, c]));
data.contributions = [];
for (const full of config.contributions || []) {
  const entry = { ...(old[full] || { repo: full, url: `https://github.com/${full}` }) };
  try {
    const { body: repo } = await get(`/repos/${full}`);
    const { body: commits, link } = await get(`/repos/${full}/commits?author=${user}&per_page=1`);
    const last = link.match(/[?&]page=(\d+)>; rel="last"/);
    entry.description = repo.description;
    entry.url = repo.html_url;
    entry.myCommits = last ? Number(last[1]) : commits.length;
    entry.lastCommit = commits[0]?.commit?.author?.date || entry.lastCommit || null;
    changed = true;
  } catch (err) {
    console.warn(`Could not read ${full} (${err.message}). Using the saved copy.`);
  }
  data.contributions.push(entry);
}

if (changed) {
  data.fetchedAt = new Date().toISOString();
  await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
}
