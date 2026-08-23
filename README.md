# atlas-prototype-v3

Planning and product documentation is maintained under [`docs/planning/`](docs/planning/README.md).

The planning set includes the generic Atlas Node model, rewrite checklist, next-prototype specification, graph behavior, product surface map, and the interaction/product lessons learned from the semantic-zoom hierarchy prototype.

## Preview deployment workflow

This repository uses a dedicated `preview` branch plus GitHub Actions to provide one stable GitHub Pages preview site for in-progress Jira work.

The `preview` branch is **not** a development branch. Feature work continues on Jira-linked branches such as `PTT-58-Create-and-locally-persist-Graph-Nodes`.

### Activating a branch for preview

To preview a feature branch, point `preview` at that feature branch's current commit once. That establishes which branch the preview site is following.

After that, the workflow in [`.github/workflows/preview-pages.yml`](.github/workflows/preview-pages.yml) automatically keeps `preview` synchronized while that same feature branch continues to receive commits:

```text
PTT-58 feature branch:  A ── B ── C
                        │    │    │
preview:                A ── B ── C
                                  │
                                  └─ GitHub Pages deployment
```

On each push to a `PTT-*` branch, the workflow checks whether `preview` points to that branch's previous commit. If it does, that branch is considered the active preview source. The workflow advances `preview` to the new commit and deploys that exact feature commit to GitHub Pages in the same workflow run.

Pushes to other Jira branches do not change the preview unless `preview` was already following them.

### Switching the active preview

To switch to another Jira branch, manually move `preview` to that branch's current commit once. From then on, new commits to that branch automatically advance and redeploy the preview.

Example:

```text
PTT-58 ───────●

PTT-61 ─────────────●
                     ↑
preview ─────────────┘
```

The `preview` branch may be force-updated because it is only a movable pointer to the code currently being previewed. `main` remains the source of truth for accepted work and planning documentation.

### GitHub Pages setting

Repository **Settings → Pages → Build and deployment → Source** should be set to **GitHub Actions**. The preview workflow uploads the static repository contents and deploys them to the repository's single GitHub Pages URL.
