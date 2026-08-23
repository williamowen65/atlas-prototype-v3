# Atlas — Before Rewrite To-Do List

This checklist records the design work that should be clear enough before a clean Atlas rewrite begins. The goal is not to specify every future feature; it is to avoid beginning implementation with unresolved foundational assumptions.

## Domain model

- [ ] Finalize the generic `Node` model.
- [ ] Define requested-child-type semantics.
- [ ] Define parent/child and cross-branch relationship representation.
- [ ] Define multi-parent/shared-node behavior.
- [ ] Define profile roots and public roots.
- [ ] Keep semantic type vocabulary flexible rather than creating subclasses.
- [ ] Define affected-location metadata independently of hierarchy edges.

## Core behavior

- [ ] Define how Nodes gain children/relationships.
- [ ] Decide whether requested child types are solicitation, validation, or both.
- [ ] Keep requested categories visible when their count is zero where the product is soliciting contributions.
- [ ] Define dynamic type vocabulary behavior.
- [ ] Define shared-node context switching and navigation.
- [ ] Define hierarchy navigation, breadcrumb, scrolling, and end-of-branch behavior.
- [ ] Identify prototype interaction requirements that should become tests.

## Persistence

Investigate a model along the lines of:

```text
Node
NodeRelationship
RequestedChildType
AffectedLocation / NodeLocation
User
ProfileRoot
PublicRoot
Vote
```

Questions include indexing for traversal, version history, deletion/withdrawal, relationships, location queries, and cache invalidation.

## Application architecture

Current direction:

```text
Browser
   |
ASP.NET Core / C# application
   |
   +---- Database
   +---- Background work / queue
   +---- Python analysis service
```

- [ ] Define authoritative responsibilities.
- [ ] Define the C# ↔ Python contract.
- [ ] Decide which analysis operations are asynchronous.
- [ ] Keep analytical failure independent from basic Atlas availability.

## Key flows to document

- [ ] Create a root Node.
- [ ] Create a child Node.
- [ ] Add another parent / create convergence.
- [ ] Load a Node and its child categories.
- [ ] Navigate hierarchy and switch parent context.
- [ ] Add/change requested child types.
- [ ] Add affected locations.
- [ ] Create cross-branch relationships.
- [ ] Vote/rate a contribution.
- [ ] Publish/expose a public root.
- [ ] Queue and receive semantic analysis.

## Security and permissions

- [ ] Node creation/edit authority.
- [ ] Relationship creation/removal authority.
- [ ] Requested-child-type authority.
- [ ] Public-root authority.
- [ ] Moderation/deletion/withdrawal behavior.
- [ ] Input limits and formatting/sanitization.
- [ ] Parameterized DB access / ORM protections.
- [ ] Safe rendering expectations.
- [ ] C# ↔ Python authentication.
- [ ] Abuse/rate/traversal protections.

## Product surfaces

Candidate surfaces include:

```text
Public Atlas / home
Generic Node / hierarchy view
Feed view
Node detail page
User profile
User roots
Create / Edit Node
Authentication
Moderation / administration
```

- [ ] Decide first-milestone surfaces.
- [ ] Identify data required by each surface.
- [ ] Make graph/tiled and feed representations projections of the same underlying Node data.

## Prototype lessons to preserve

- [ ] Broad, stable public root taxonomy.
- [ ] Dense lower-level branching.
- [ ] Weighted node sizing with readability constraints.
- [ ] Text wrapping/scaling within geometric cells.
- [ ] Connectors that visibly cross node/card boundaries.
- [ ] Inter-layer context cards.
- [ ] Consistent auto-scroll to newly revealed context.
- [ ] Explicit leaf/end-of-branch state.
- [ ] Mobile/desktop behavioral consistency.
- [ ] User-selectable themes and legend.
- [ ] Draggable floating display control.
- [ ] Hierarchy overview zoom with readable labels.
- [ ] Location metadata as a separate dimension.

## Old-code/test review

Classify old implementation pieces as `KEEP CONCEPT`, `REUSE CODE`, `REWRITE`, `DELETE`, or `UNSURE`.

Classify tests as `PRESERVE BEHAVIOR`, `REWRITE FOR NEW MODEL`, `OBSOLETE`, or `UNSURE`.

## Minimum rewrite milestone

A candidate first milestone:

```text
Generic Node model
+
Persistence
+
Relationship traversal
+
Requested child types
+
Affected-location shape
+
Generic Node view
+
Multiple roots
+
Tests
```

Advanced visualization, AI, ranking, moderation, and other systems should be introduced only when required to validate the architecture or after the basic model is coherent.