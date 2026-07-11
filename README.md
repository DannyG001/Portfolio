# Terminal Security Portfolio

An interactive, terminal-styled cybersecurity portfolio. The whole page behaves like a shell:
visitors type commands (or click the buttons) to explore, and each project ships a small
self-contained demo that animates the *concept* behind it. Pure static HTML/CSS/JS — no build
step, no backend, nothing leaves the browser.

## Run locally
Just open `index.html` in a browser. Or serve it (recommended, matches hosting):

```bash
python -m http.server 8000
# then visit http://localhost:8000
```

## Commands
`help` · `about` · `whoami` · `skills` · `projects` · `open <id>` · `contact` · `clear`
(plus a couple of easter eggs). ↑/↓ recalls command history.

## Interactive demos (built)
- `open portscan` — animated nmap-style port scan (open/closed/filtered, SYN vs connect).
- `open logdetect` — live auth-log stream with a tunable brute-force detection rule.
- `open passwd` — password entropy + crack-time estimate (MD5 vs bcrypt).

Planned (concept stubs): SQL injection sandbox, CTF writeups, honeypot explainer, phishing analyzer.

## Make it yours
- **Identity / contact:** edit the `IDENTITY` object at the top of `js/commands.js`
  (name, email, GitHub, LinkedIn, resume path). Also update the `YOUR_NAME` strings in
  `index.html` and the prompt in `js/terminal.js`.
- **Skills:** edit the `SKILLS` array in `js/commands.js`.
- **Projects:** edit the `PROJECTS` array in `js/projects.js`. Adding a real project is a data
  edit; set `status` to `done`/`progress`/`planned` and, for built demos, point `mount` at a
  render function in `projects/`.
- Drop your resume at `assets/resume.pdf`.

## Deploy free on GitHub Pages (auto-deploys on merge)
This repo ships a GitHub Actions workflow (`.github/workflows/deploy.yml`) that publishes the
site to GitHub Pages automatically on every push/merge to `main`. No build step — it uploads
the static files as-is.

**One-time setup:**
1. Create a repo and push these files to the `main` branch.
2. Repo → **Settings → Pages → Build and deployment → Source: `GitHub Actions`**.
   (Do *not* pick "Deploy from a branch" — the workflow handles it.)
3. Push to `main` (or click *Run workflow* on the Actions tab). Watch the **Actions** tab; when
   the *Deploy to GitHub Pages* job finishes, the live URL is printed in the job summary.

After that, every merge to `main` redeploys automatically. Site goes live at
`https://<user>.github.io/<repo>/` (or `https://<user>.github.io/` if you name the repo
`<user>.github.io`). All asset paths are relative, so it works in a subpath.

`.nojekyll` is included so Pages serves every file verbatim (no Jekyll processing).

> Note: the workflow triggers on the `main` branch. If your default branch is `master`, edit the
> `branches:` line in `.github/workflows/deploy.yml`.

## Notes
- Animations respect the OS "reduce motion" setting and the in-page `motion:` toggle.
- Every demo is illustrative and runs client-side — no real scanning or network activity.
