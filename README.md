# atlas-prototype-v3

Planning and product documentation is maintained under [`docs/planning/`](docs/planning/README.md).

The planning set includes the generic Atlas Node model, rewrite checklist, next-prototype specification, graph behavior, product surface map, and the interaction/product lessons learned from the semantic-zoom hierarchy prototype.

## PTT-58 — local Graph Node prototype

The PTT-58 branch adds the first implementation slice of the Graph bounded context.

### What it demonstrates

- a `src/contexts/graph` boundary with domain, application, infrastructure, UI, and fixture concerns;
- an `src/app` composition entry point;
- generic Graph Nodes whose semantic `type` is data;
- create, edit, and per-Node delete controls;
- clear-all local data control;
- IndexedDB persistence that survives a page refresh in the same browser;
- a toggleable raw JSON view so stored records can be inspected directly;
- repeatable JSON sample fixtures that can be loaded from the UI;
- no server-side database or backend dependency.

### Run locally

Because the app uses browser ES modules and loads a JSON fixture, serve the repository over HTTP instead of opening `index.html` as a `file://` URL.

For example, from the repository root:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

The same static files are suitable for GitHub Pages. IndexedDB data belongs to the browser/origin where the prototype is running; it is not committed to Git or synchronized between devices.

### IndexedDB details

- Database: `atlas-prototype-v3`
- Object store: `graphNodes`
- Persistence adapter: `src/contexts/graph/infrastructure/indexedDbNodeRepository.js`

Client/UI code reaches storage through the public Graph context API exported from `src/contexts/graph/index.js` rather than using IndexedDB directly.
