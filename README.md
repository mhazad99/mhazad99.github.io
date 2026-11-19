# mhazad99.github.io

My personal website. It rebuilds by itself every time something is pushed to `main`, and once a day.

## Updating the site

| I want to… | Do this |
|---|---|
| Show a GitHub repo on the site | Add the topic `portfolio` to the repo on GitHub (gear icon next to "About"). Until any repo has this topic, all my own repos are shown. |
| Hide a repo | Add its name to `hide` in `site.config.mjs`. |
| Change a project's title or description | Edit the `github:` part of `src/data/projects.yaml`. |
| Add a paper, talk, dataset or non-GitHub project | Add an entry under `other:` in `src/data/projects.yaml`. |
| Change my name, bio or links | Edit `site.config.mjs`. |
| Edit my Snooz work (categories and items) | Edit `src/data/work.yaml`. |
| Edit research, publications, experience, education | Edit `src/data/cv.yaml`. |
| Track commits in another repo I contribute to | Add it to `contributions` in `site.config.mjs`. |
| Rebuild right now | Actions tab → "Build and publish site" → Run workflow. |

All of these can be done on github.com with the pencil icon. No local setup needed.

## Moving to my own domain (e.g. mhazad.com)

1. Buy the domain (e.g. Cloudflare Registrar).
2. Add a file `public/CNAME` containing just `mhazad.com`.
3. In `astro.config.mjs`, change `site` to `'https://mhazad.com'`.
4. At the registrar, add the DNS records from GitHub's guide:
   https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
5. Repo Settings → Pages: enter the domain, then tick "Enforce HTTPS".
6. Verify the domain under your GitHub account settings → Pages to protect it from takeover.

`mhazad99.github.io` will then redirect to the new domain automatically.

## Working locally (optional)

```
npm install
npm run dev
```

## Note

GitHub pauses scheduled workflows in a public repo after 60 days with no commits.
The site stays online; only the daily refresh stops. Any commit, or the
"Enable workflow" button in the Actions tab, turns it back on.
