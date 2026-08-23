# Atlas — Next Prototype Specification

## Purpose

The next implementation should be a clean reimplementation of the useful ideas discovered through the hierarchy prototype, not a continuation of accumulated prototype architecture.

The previous prototype is a behavioral and visual reference. Preserve behaviors that still make sense under the simpler model; do not preserve implementation machinery merely because it exists.

## Core model

At the fundamental level, everything is a Node. A Node has flexible semantic `type` data rather than belonging to a hard-coded Issue/Solution class hierarchy.

A minimal conceptual shape:

```js
{
  id,
  type,
  title,
  description,
  requestedChildTypes,
  affectedLocations,
  // general metadata
}
```

Relationships between existing Nodes should be explicit graph data rather than special subclasses.

## Root taxonomy

The public Atlas should begin with a deliberately broad set of root categories. The normal user mental model should be:

> Where does this contribution belong in the existing Atlas?

rather than:

> I should create a new root.

New roots can remain possible as an exceptional/governance behavior, but root creation should not be the default posting path.

The deeper hierarchy is expected to become much more specific and abundant. At lower levels, a broad issue can naturally explode into many distinct public concerns and solution proposals.

## Social-media integration

Atlas is also a social feed/public think tank. Each Node can correspond to or link to a post with richer content. The hierarchy supplies structured context and navigation around that content.

The same Node/layer data should be usable in at least two presentations:

1. **Graph / tiled hierarchy mode** — weight/ranking is represented spatially.
2. **Feed / forum mode** — ranking is represented through ordering in a conventional social feed.

These are projections of the same graph, not separate content models.

## Requested child types

A Node may explicitly state what kinds of contributions it is looking for. Requested categories should remain visible at zero count when their emptiness communicates an invitation to contribute.

The rewrite should explicitly decide whether requested child types are merely solicitation or also an attachment constraint. Do not let the UI accidentally become the domain rule.

## Location

Affected location is a first-class contextual parameter and should remain separate from hierarchy and generic semantic relationships.

A Node/post may have multiple affected locations.

Location should eventually support filtering, geographic exploration, maps, and repeated instances of conceptually similar problems in different places.

## Hierarchy interaction requirements learned from the prototype

### Layers and context

- Selecting a Node reveals its next child layer.
- The selected hierarchy remains visible as contextual layers while descending.
- A compact detail card occupies the white space between a selected layer and the next layer.
- Cards summarize type, title, concise description, votes/rating, affected locations where relevant, and separate issue/solution child counts.
- Context cards should be positioned from fixed layer geometry, not from the pan/zoom transform of the contents inside a layer.

### Auto-scroll

After selecting a Node, scrolling should expose the inter-layer context card and the beginning of the newly revealed layer in a consistent position.

A leaf Node should use the same scrolling behavior. Instead of silently having no next layer, the next-layer region should show an explicit end state such as:

> End of this branch — No sub-issues or sub-solutions have been created for this issue/solution yet.

The end state should repeat the selected branch name so orientation is preserved.

### Connectors

The selected hierarchy is connected by a visible line. Connection markers should appear where the path:

- exits a selected parent Node,
- enters the inter-layer context card,
- exits the context card,
- enters the next selected Node.

Dots and lines must be calculated from the same geometry so they remain synchronized while a layer is panned or zoomed.

### Cell labels

Labels need to understand available polygon geometry. Text and its semantic icon should be laid out together, wrap when needed, and scale down as a unit when a cell becomes tight rather than disappearing.

Node weighting should preserve ranking without allowing one very large branch to crush valid siblings into unreadable slivers.

### Mobile and desktop

The behavior should remain the same across breakpoints. CSS can reflow descriptions/stats, but card-to-layer spacing and navigation semantics should remain intentional and consistent.

### Themes and display tools

Theme/legend/display settings live in a floating half-pill control. It defaults to the lower-right edge, but users can drag it vertically and dock it on the other side of the screen. Theme choice, legend visibility, and useful display preferences can be persisted locally.

### Overview zoom

Atlas should provide hierarchy-level zoom rather than relying on browser zoom. Useful initial stops are:

- Wide overview
- Overview
- Standard
- Detail

The hierarchy geometry scales together, while labels use a moderated counter-scale so zooming out increases information density without making all text unreadable or allowing fixed-size labels to overwhelm tiny cells.

Future semantic zoom can intentionally reduce secondary metadata at very wide views rather than letting content disappear accidentally.

## Layout architecture

Prefer normal document/CSS layout wherever possible. The prototype showed that independently calculated heights, transforms, fixed controls, and corrective scrolling can create subtle bugs.

D3 should focus on visualization geometry. Application logic decides what belongs in a layer; the renderer decides how that layer is drawn.

## Relationships and shared Nodes

Cross-links can use extensible relationship vocabulary such as:

- supports
- conflicts with
- depends on
- helps address
- evidence for
- implemented by
- related to

A cross-link should not require copying the underlying Node. Shared Nodes may be reachable from multiple contexts while retaining one identity.

## Implementation order

A useful clean-room progression is:

1. Basic page shell and scrolling.
2. Generic Node structure and relationships.
3. Root taxonomy and a simple selected-Node view.
4. Dynamic child categories and zero-count solicitation states.
5. Child filtering/traversal.
6. Feed projection of a layer.
7. D3 tiled projection of the same layer.
8. Breadcrumb/context navigation.
9. Inter-layer cards and consistent scroll behavior.
10. Explicit relationships/shared-node navigation.
11. Affected-location metadata and filtering shape.
12. Themes/display tools.
13. Hierarchy-wide overview zoom.
14. Advanced ranking/analysis/AI only after the base model is stable.

## Guiding principle

Atlas should provide enough structure for public collective problem-solving without requiring the designers to predict every category, relationship, place, or kind of contribution people will eventually create.