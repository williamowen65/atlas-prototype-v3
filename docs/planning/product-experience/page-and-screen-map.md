# Page and Screen Map

## Purpose

Identify first-class Atlas product surfaces and their data needs without prematurely locking visual implementation.

## Candidate surfaces

```text
Public Atlas / home
Generic Node / hierarchy view
Generic Node / feed view
Full Node / post page
User profile
User root Nodes
Create Node
Edit Node
Authentication
Moderation / administration
```

## Public Atlas / home

The public entry should expose broad stable root categories and make it natural to start exploring rather than creating a new root.

Potential data needs:

- public root Nodes;
- ranking/aggregate importance;
- issue/solution type metadata;
- child counts;
- optional location/filter context;
- current display preference (feed/graph, theme, overview zoom).

## Generic Node / hierarchy view

The tiled hierarchy is one projection of a Node's context and descendants.

It needs:

- current route/breadcrumbs;
- sibling set for each contextual layer;
- selected Node per layer;
- child Nodes for the next layer;
- ranking/weight inputs;
- concise descriptions and stats;
- relationship/connector information;
- affected-location summary where relevant.

## Generic Node / feed view

The same conceptual layer can be rendered as a conventional ranked social feed. Stronger ranking signals raise cards toward the top rather than making spatial tiles larger.

A feed card should support two clear navigation choices:

1. **Graph children** — select this Node as hierarchy context and show its child layer in graph/tiled mode.
2. **Open Node page** — open the full content/detail surface for this Node/post.

The feed and graph are different views of the same Node data rather than different object models.

## Full Node / post page

The upper area can show:

- user-defined semantic type;
- title;
- author/context information as appropriate;
- vote/rating metadata;
- affected locations;
- flexible ordered content blocks (text, image, data, etc.);
- relationship/context information.

Below the post detail, users can navigate child contribution categories and choose either feed or graph presentation.

## Create Node

Creation should remain one conceptual experience whether the new Node begins as:

- a profile/public root;
- a child of an existing Node;
- a shared/convergence Node with multiple parents.

The normal case starts with the current parent context. The UI can expose **+ Add another parent** rather than inventing a separate relationship-node creation mode.

Each incoming parent relationship may need its own semantic meaning such as `supports`, `contradicts`, `qualifies`, or `complicates`. Relationship meaning remains separate from the new Node's own `type` and content.

Creation should also be able to attach one or more affected locations when geographically relevant.

## Edit Node

Editing must respect ownership/permission rules and distinguish changes to:

- Node content;
- semantic type;
- requested child/contribution types;
- affected locations;
- relationship metadata;
- moderation/visibility state where applicable.

## Profile and root surfaces

Profiles may expose multiple root Nodes and contextual participation in public Nodes. Root status is contextual; it should not require a separate `RootNode` domain class.

## Moderation / administration

Eventually this surface will need to expose reports, moderation state, governance actions, relationship abuse, audit/history context, and public-root governance without redefining ordinary Node semantics.

## Cross-cutting interaction requirements

- Breadcrumbs remain horizontally scrollable on overflow.
- Deep selection auto-scrolls to the selected context card/next layer.
- Leaf selection shows an explicit end-of-branch region.
- Internal layer pan/zoom does not move inter-layer context UI.
- Hierarchy overview zoom is separate from layer-local zoom.
- Display tools are accessible without crowding the main mobile header.
- Mobile reflows content without changing the navigation model.

## Open questions

- Which surfaces are required for the first rewrite milestone?
- Does clicking a feed card body open the Node page, while explicit controls handle graph navigation?
- Which ranking strategy powers feed ordering and graph area?
- How are public versus private/profile roots exposed?
- How much structured context appears directly on a post versus in secondary detail UI?
- What location picker/map interaction is appropriate for multi-location posts?
- Which display preferences should persist per user versus locally per browser?