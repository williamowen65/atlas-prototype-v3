# Hierarchy Prototype — Lessons and Product Decisions

This note records the product thinking discovered while iterating on the Semantic Zooming with Hierarchical Aggregation prototype. It is intentionally written as planning documentation rather than implementation notes so the behavior can survive a rewrite even if the rendering architecture changes completely.

## 1. Public root taxonomy

The public Atlas should not feel like a blank taxonomy where every new user invents another root. The top level should contain a relatively small set of broad public concerns that are intentionally stable.

The desired user question is:

> Where does what I am posting belong in this existing Atlas?

not:

> What new root should I create?

There can eventually be new roots, but many ideas that initially look like roots can be nested under broader existing concepts. Root creation should therefore be exceptional compared with ordinary classification/posting.

The lower levels are intentionally different. As users narrow a subject, the number of meaningful issues and solutions can expand dramatically. Dense deep branches are expected and desirable.

Examples from the prototype included biodiversity splitting into species- and place-specific issues, microplastic pollution splitting into drinking water, food, textiles, tire wear, wastewater, marine/freshwater contamination and more, and local habitat restoration splitting into many concrete restoration approaches.

## 2. Atlas as social media / public think tank

The hierarchy is not meant to replace a social feed. It gives public posts a navigable conceptual structure.

A Node/post can have flexible content—text, images, data, or other blocks—while also carrying structured context. The graph is therefore a way to organize and aggregate public thought rather than a separate encyclopedia maintained only by editors.

A user should be able to move between:

- a conventional ranked feed;
- a graphical/tiled representation of the same layer;
- a full Node/post page;
- deeper child layers.

These should be different projections/navigation modes over the same data.

## 3. Broad descriptions, specific children

Descriptions on hierarchy cards should explain an issue or solution in as few words as practical and at the broadest useful level.

Specific details should generally be represented in child Nodes instead of turning the parent description into a long summary of everything beneath it.

This helps a parent remain a useful umbrella while the branch becomes increasingly specific.

## 4. Affected locations

Location is a separate dimension from both hierarchy and semantic relationships.

A problem can repeat in different places, and one issue can affect many places at once. Therefore a post/Node should be able to carry multiple affected locations.

This is different from `relates to`:

- `relates to` describes a conceptual connection between ideas;
- `affected locations` describes geographic scope/context.

Location should eventually support local filtering, geographic aggregation, maps, and other spatial views without requiring a duplicate hierarchy for every place.

Affected locations are an example of a **default structured parameter** Atlas can provide around otherwise flexible post content. As the product evolves, additional default context parameters can be added when they consistently help people understand issues/solutions.

## 5. Weighted node sizing needs readability constraints

The prototype uses weighted tiled/Voronoi cells to communicate relative importance. Raw aggregate differences can become visually extreme: one deep branch can consume most of a layer and squeeze another legitimate sibling into a tiny sliver.

Ranking should remain visible, but layout weighting should be compressed/capped enough that sibling Nodes remain readable and interactable.

The goal is not equal sizing. It is a readable visual ranking.

## 6. Text belongs to the cell geometry

Text cannot be laid over a geometric cell as if the cell were an ordinary rectangular HTML box.

The label system should understand the available polygon width at each line. It should:

- prepend the semantic icon as part of the text block;
- wrap the title according to the available shape;
- reserve room for metadata;
- scale the whole text/icon block down when necessary;
- avoid simply hiding text or icons when space becomes tight.

This behavior matters especially on mobile and at overview zoom levels.

## 7. Inter-layer context cards

After a Node is selected, a compact information card is shown in the whitespace after its layer and before the next layer.

Useful content includes:

- Issue / Solution type
- Node name
- concise description
- affected-location count for issues where applicable
- vote count
- average rating
- number of direct sub-issues
- number of direct sub-solutions

The card should occupy reserved inter-layer space rather than obscure the graph.

The geometry of the card must be tied to the fixed boundary of a layer, not to the internal zoom/pan transform of that layer's contents.

## 8. Consistent card spacing across breakpoints

Mobile stats may wrap into multiple lines while desktop stats remain on one line. That internal reflow should not accidentally change the intended visual relationship between the card and its adjacent layers.

The desktop treatment established the preferred visual spacing: a compact card floating within the inter-layer whitespace. Mobile should preserve that same spacing concept while allowing its content to wrap internally.

## 9. Selected hierarchy connector

A visual connector helps users see the selected route through the hierarchy.

The line should target Node perimeters rather than centroids. Markers should show meaningful transitions:

1. where the line exits the selected parent Node;
2. where it enters the inter-layer card;
3. where it exits the inter-layer card;
4. where it enters the selected Node in the next layer.

The dots and line must be generated from the same current geometry. When a layer is panned or zoomed, every connector marker must update with the path instead of remaining at a stale screen position.

## 10. Auto-scroll behavior

Selecting a Node with children should automatically move the hierarchy so the user sees the selected Node's context card near the top of the useful viewport and the beginning of its child layer beneath it.

The target is the **inter-layer context**, not simply the center of the selected Node or the center of the child layer.

Desktop and mobile should follow the same reading order even if their header heights differ.

## 11. Leaf / end-of-branch behavior

Clicking a leaf must not feel like a broken interaction.

The empty next-layer region should explicitly state that no sub-issues or sub-solutions have been created for the selected issue/solution yet. It should repeat the selected branch name and use the same auto-scroll behavior as a Node that has children.

This communicates both:

- the user reached the current end of the branch; and
- the branch can still grow.

The message needs a constrained/mobile-safe text container with padding, wrapping, and a subtle styled border.

## 12. Breadcrumbs

Breadcrumbs show the current route through the graph. When the route is too wide, the breadcrumb container should remain horizontally scrollable rather than clipping or compressing the hierarchy path into unreadability.

The current/deepest crumb should be kept visible as the path grows.

## 13. Display tools

Theme and legend controls were moved out of the crowded mobile header into a floating half-pill tools control.

Desired behavior:

- default position: bottom-right;
- user can drag it vertically;
- user can carry it across the viewport to dock on the left;
- position can persist locally;
- clicking opens the display panel;
- dragging should not accidentally trigger the panel.

This display surface is also the natural place for hierarchy-level zoom controls.

## 14. Themes

The prototype deliberately allows users to choose presentation rather than imposing one permanent visual style.

Themes should affect visual presentation—color, contrast, surfaces, typography treatment—without changing data or graph semantics.

Theme changes should be visibly named in the tools panel so interaction bugs can be distinguished from styling bugs.

## 15. Hierarchy-level overview zoom

Browser zoom revealed a useful product mode: seeing several layers and their relationships simultaneously.

Atlas should implement this itself instead of depending on browser zoom.

A useful first set of discrete stops is:

- Wide overview
- Overview
- Standard
- Detail

The hierarchy geometry—layers, gaps, cards, connectors—scales as one system. Important text should use a **moderated inverse/counter scale** so it remains more readable than pure geometric scaling would make it, without staying so large that labels overwhelm tiny cells.

At very wide zoom, later semantic-zoom rules may intentionally hide secondary metadata and preserve titles/type rather than allowing text to disappear unpredictably because it no longer fits.

## 16. Internal layer pan/zoom versus hierarchy zoom

There are two different transforms:

1. **Layer-local pan/zoom** — lets a user inspect the contents of one tiled layer.
2. **Hierarchy overview zoom** — changes how much of the overall vertical graph is visible.

These should remain conceptually separate. Inter-layer cards and hierarchy spacing belong to world/layer geometry and should not drift because a single layer is internally zoomed.

## 17. Mobile-first behavioral consistency

The prototype repeatedly exposed bugs where desktop and mobile used different magic numbers or layout assumptions.

The preferred rule for a rewrite is:

> Same semantic layout behavior; breakpoint-specific reflow only where necessary.

For example, stats may reflow into a grid on mobile, but the card remains the same conceptual object in the same hierarchy gap. Text may wrap differently, but it should not be clipped or silently removed.

## 18. Asset/deployment lesson

The GitHub Pages prototype used an explicit asset list in its deployment workflow. New CSS/JS files worked locally but failed or appeared stale when the workflow did not include them or when individual imports retained old cache keys.

For the rewrite, avoid manually maintaining multiple independent lists of frontend assets if the build system can produce one deployable artifact automatically. Cache busting should apply to actual JS/CSS assets, not only the top-level page URL.

## 19. What the prototype is proving

The current prototype is most valuable as evidence that Atlas can support a public structure where:

- broad concerns remain understandable at the top;
- public contributions become increasingly specific with depth;
- issues and solutions coexist in the same graph model;
- ranking can be spatial rather than only feed ordering;
- navigation preserves context;
- users can see both local detail and larger structure;
- geographic context exists alongside conceptual structure;
- the same underlying data can eventually power both graph and social-feed experiences.

These are the lessons worth carrying forward. The specific JavaScript/D3 implementation should remain replaceable.