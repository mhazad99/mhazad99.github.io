// Downloads public GitHub data into src/data/github.json before every build:
// my profile, my own repositories, and my commits in other repositories.
// Anything GitHub can't provide right now keeps its last saved value.

import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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

// Counts my commits on every branch by downloading the repository's history
// (commit list only, no file contents). Returns null if git isn't available.
const authors = (config.commitAuthors || []).map((a) => a.toLowerCase());
const isMine = (email, name) =>
  authors.some((a) => email.toLowerCase().includes(a) || name.toLowerCase() === a);

async function countWithGit(full) {
  const dir = await mkdtemp(join(tmpdir(), 'repo-'));
  try {
    execFileSync('git', ['clone', '--quiet', '--bare', '--filter=blob:none',
      `https://github.com/${full}.git`, dir], { stdio: 'ignore', timeout: 120000 });
    const log = execFileSync('git', ['-C', dir, 'log', '--all', '--format=%ae%x09%an%x09%aI'],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const mine = log.split('\n').filter(Boolean).map((l) => l.split('\t'))
      .filter(([email, name]) => isMine(email, name));
    if (!mine.length) return { count: 0, last: null };
    const last = mine.map((m) => m[2]).sort().at(-1);
    return { count: mine.length, last };
  } catch {
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// My commits in other people's repositories.
const old = Object.fromEntries((saved.contributions || []).map((c) => [c.repo, c]));
data.contributions = [];
for (const full of config.contributions || []) {
  const entry = { ...(old[full] || { repo: full, url: `https://github.com/${full}` }) };
  try {
    const git = await countWithGit(full);
    if (git) {
      entry.myCommits = git.count;
      entry.lastCommit = git.last || entry.lastCommit || null;
      entry.allBranches = true;
      changed = true;
    }
    const { body: repo } = await get(`/repos/${full}`);
    entry.description = repo.description;
    entry.url = repo.html_url;
    if (!git) {
      // Fallback: GitHub's own count, which only includes the main branch.
      const { body: commits, link } = await get(`/repos/${full}/commits?author=${user}&per_page=1`);
      const last = link.match(/[?&]page=(\d+)>; rel="last"/);
      entry.myCommits = last ? Number(last[1]) : commits.length;
      entry.lastCommit = commits[0]?.commit?.author?.date || entry.lastCommit || null;
      entry.allBranches = false;
    }
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
