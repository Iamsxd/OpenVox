# GitHub setup for `Iamsxd/OpenVox`

This repository is ready to publish as a GitHub Pages project site.

## 1. Create the repository

Create a public repository named exactly:

```text
OpenVox
```

Expected repository URL:

```text
https://github.com/Iamsxd/OpenVox
```

## 2. Push the source

From the extracted project directory:

```bash
git init
git switch -c deploy/github-pages-zh
git add .
git commit -m "Publish static Chinese GitHub Pages edition"
git remote add origin https://github.com/Iamsxd/OpenVox.git
git push -u origin deploy/github-pages-zh
```

The repository root must contain `package.json`, `vite.config.ts`, `src/`, `public/` and `.github/`.

Do not upload `node_modules/` or a local `dist/` directory. They are intentionally excluded by `.gitignore`.

## 3. Enable Pages

Open:

```text
Repository -> Settings -> Pages
```

Choose **GitHub Actions** as the deployment source if it is not already selected.

The workflow in `.github/workflows/static.yml` then:

1. installs dependencies with `npm ci`;
2. resolves the Pages base from the real repository name;
3. runs lint and the full test suite;
4. builds the WebAssembly module and production application;
5. verifies static routes, PWA files, WASM and base paths;
6. uploads the `dist` directory as a Pages artifact;
7. deploys it.

For `Iamsxd/OpenVox`, the resulting public URL is expected to be:

```text
https://iamsxd.github.io/OpenVox/
```

## 4. Verify the first deployment

After the workflow succeeds, test at least:

```text
/
/studio/
/academy/
/instruments/
/track-lab/
/mixer/
/audio-lab/
/score/
/choir/
/settings/
```

Then run the manual device plan in `docs/MANUAL_TEST_PLAN.md` with a real microphone.

## 5. Optional repository settings

Recommended:

- enable Issues;
- enable Discussions when community support becomes useful;
- enable private vulnerability reporting under the Security settings;
- protect `main` after the initial publication and require the quality workflow for pull requests;
- keep GitHub Actions permissions at the repository default unless a workflow explicitly needs more.

The Pages deployment workflow already declares only the permissions needed for Pages deployment.
