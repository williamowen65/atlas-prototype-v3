# Atlas Planning

This directory is the planning/documentation home for `atlas-prototype-v3`. It consolidates the planning notes that were previously kept in the Semantic Zooming / Hierarchical Aggregation prototype repository and the product decisions discovered while iterating on that prototype.

The purpose is to keep product, graph-model, interaction, and rewrite decisions next to the repository that will use them. These Markdown files are intentionally organized so they can later be copied into the GitHub Wiki with minimal restructuring.

## Documents

- [Atlas node data model](atlas-node-data-model.md)
- [Before-rewrite checklist](before-rewrite-todo.md)
- [Next prototype specification](next-prototype-spec.md)
- [Graph core behavior](graph/core-behavior-spec.md)
- [Product experience](product-experience/README.md)
- [Hierarchy prototype lessons and decisions](product-experience/hierarchy-prototype-notes.md)
- [Page and screen map](product-experience/page-and-screen-map.md)

## Current planning direction

Atlas should be built around a generic recursive Node model rather than separate structural classes for Issue, Solution, Question, Challenge, and similar concepts. Semantic meaning should be data (`type` and related metadata), while the application works with a consistent Node abstraction.

The hierarchy prototype has also established several product principles:

- Root categories should be broad and relatively stable so people look for where their contribution belongs rather than immediately creating a new root.
- Specificity should emerge deeper in the hierarchy, where issue and solution branches may become very dense.
- The same graph data should support both spatial/hierarchical and feed-style social-media presentations.
- Location is a separate contextual dimension, not merely another `relates to` edge.
- A post/node may have multiple affected locations.
- Inter-layer context cards should preserve orientation as users descend the hierarchy.
- Mobile and desktop should share the same semantic behavior even when presentation reflows.
- Semantic/overview zoom should let users see more of the hierarchy while keeping important labels readable.
- Leaf nodes should visibly communicate that no sub-issues or sub-solutions have been created yet rather than appearing broken or empty.

## Planning coverage

The earlier planning workspace used approximate documentation-coverage estimates rather than implementation-progress estimates. The last recorded rough coverage was:

| Area | Approx. planning coverage |
| --- | ---: |
| Graph and Content Model | 80% |
| Architecture | 65% |
| Product Experience | 35% |
| Rewrite Execution | 35% |
| Notifications | 30% |
| Voting | 20% |
| Profiles and Identity | 20% |
| Security | 20% |
| Moderation | 10% |

These numbers mean how much of the design surface has been deliberately explored and documented, not how complete the implementation is.

## Minimum design package

For a substantive Atlas bounded context, planning should eventually cover:

1. Domain model / UML
2. Behavioral rules
3. Persistence shape
4. Permissions / ownership
5. Key flows
6. Open decisions
7. Client-code / use-case sketches

The point is to make uncertainty visible before implementation instead of letting architecture emerge accidentally from UI experiments.