# atlas-prototype-v3

Planning and product documentation is maintained under [`docs/planning/`](docs/planning/README.md).

The planning set includes the generic Atlas Node model, rewrite checklist, next-prototype specification, graph behavior, product surface map, and the interaction/product lessons learned from the semantic-zoom hierarchy prototype.

## Preview deployment workflow

This repository uses a dedicated `preview` branch as the single GitHub Pages deployment target for in-progress work.

The `preview` branch is **not** a development branch and should not be used for implementation. Feature work continues on Jira-linked branches such as `PTT-58-Create-and-locally-persist-Graph-Nodes`.

When a feature or bounded context needs to be viewed in the browser, move the `preview` branch to that feature branch's current commit. GitHub Pages then serves that code from the repository's one preview site. Later, `preview` can be repointed to a different Jira branch without merging that work into `main`.

Example workflow:

```text
Jira Story
   ↓
Jira-created GitHub feature branch
   ↓
implementation / commits
   ↓
move `preview` to the feature branch commit
   ↓
view through GitHub Pages
   ↓
move `preview` again when another branch needs review
```

The `preview` branch may be force-updated because its purpose is only to represent the code currently being previewed. `main` remains the source of truth for accepted work and planning documentation.
