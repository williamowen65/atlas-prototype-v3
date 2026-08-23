# Graph — Core Behavior Specification

## Purpose

Describe Atlas graph behavior independently of framework, database, or visualization implementation.

## Nodes

- A Node can have zero or many children.
- A Node may participate in more than one parent context through explicit relationships without duplicating its underlying identity/content.
- A Node has flexible semantic type data rather than a semantic subclass.
- A Node may request particular child/contribution types.
- Type vocabulary can evolve with the conversation.

## Child categories

- Requested child categories can remain visible when their count is zero if the category represents a solicitation for contributions.
- Existing unrequested semantic types may need to appear when real contributions of that type exist; the exact policy is still a domain decision.
- The UI should show separate issue and solution child counts where those labels are meaningful rather than a generic `children` count.

## Roots

- Multiple roots can exist on profiles and in the public Atlas.
- Root status does not require a different Node class.
- Public root categories should be broad and comparatively stable so users normally classify contributions under existing branches.

## Traversal and navigation

- Ordinary hierarchy traversal must not recurse indefinitely.
- Non-hierarchical relationships may form cycles; traversal/rendering must detect already-visited Nodes.
- Multi-parent/shared Nodes must preserve one underlying identity.
- The current parent route is contextual navigation state, not a different copy of the Node.
- Breadcrumbs should expose current route/depth and remain horizontally scrollable on narrow screens.

## Selected hierarchy behavior

When a Node is selected:

1. Preserve its layer as selected context.
2. Render a compact information card in the gap after that layer.
3. Render the next child layer, or an explicit empty/end state for a leaf.
4. Auto-scroll so the selected context card and beginning of the next region are visible consistently.
5. Draw the hierarchy connector through the selected route.

A leaf follows the same flow except the next region says that no sub-issues/sub-solutions have been created yet.

## Geometry and pan/zoom

Each displayed layer has a fixed frame in hierarchy/world coordinates. Internal layer content may have its own pan/zoom transform.

Anything that belongs *between layers*—context cards, layer spacing, hierarchy connector crossings—must use the fixed layer frame, not the transformed bounding box of the panned/zoomed contents.

The line and all connector dots must be recomputed from the same coordinate system after pan/zoom.

## Weighted layout

Area can represent aggregate importance/ranking, but weight differences should be compressed enough to maintain readable/touchable sibling cells. Ranking should remain visible without allowing a dominant branch to make another legitimate sibling nearly disappear.

## Labels

Node labels should be fitted to actual polygon geometry.

- semantic icon is part of the label flow;
- title wraps to available width;
- metadata follows beneath;
- if a cell becomes tight, the whole label block scales down to fit;
- content should not simply disappear because the cell is small.

## Location

Affected locations are structured Node/post metadata, not parent/child hierarchy and not merely a generic `related to` relationship. A single Node can affect multiple locations.

## Strategy seams

Algorithmic choices that are expected to evolve should be kept outside Node invariants where practical. Candidate strategies include:

- traversal policy;
- ranking/weight calculation;
- recommendation/related-node discovery;
- clustering/semantic analysis.

The domain specifies what remains valid; strategies decide how an algorithmic choice is made.

## Open questions

- Is `requestedChildTypes` solicitation only, attachment validation, or configurable by context?
- What relationship semantics belong directly on edges?
- How should multi-parent context selection appear in the product?
- What ranking inputs determine feed ordering versus tile area?
- How are location precision, scope, and privacy represented?
- Which hierarchy interactions are core product behavior versus optional presentation enhancements?