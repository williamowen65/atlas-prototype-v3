# Atlas Node Data Model Notes

## Core realization

Atlas can use one recursive **Node** model instead of separate structural classes for Issue, Solution, Challenge, Question, Evidence, Implementation, and other semantic categories.

A Node's meaning is expressed through flexible data rather than inheritance.

```text
Node
  id
  type
  title
  description
  requestedChildTypes
  children / relationships
```

Examples of `type` values include `issue`, `solution`, `question`, `challenge`, `implementation`, `evidence`, `objection`, `support`, `cause`, and `example`. These are vocabulary, not application subclasses.

## Emergent ontology

Atlas should not require one fixed global ontology designed in advance. Vocabulary can emerge from how people actually structure a conversation. Different communities may use different terms for similar ideas, and later semantic analysis can help surface overlap, aliases, or possible consolidation without requiring the core application to encode every category.

The guiding principle is:

> Everything is a Node. A Node has flexible semantic meaning.

## Requested child types

A Node can declare what kinds of responses would be especially useful beneath it.

For example:

```text
Requested child types
- solution
- evidence
- challenge
```

These requests are solicitation metadata. A requested category should remain visible even when its current count is zero because the empty category communicates that contributions of that type are wanted.

The prototype explored both stricter and looser interpretations of this rule. The rewrite should explicitly decide whether requested child types are merely solicitation or also an attachment constraint. The architecture should not accidentally make that decision through UI code.

## Children and relationships

Nodes may have zero or many children. The graph model should also allow a Node to participate in more than one context without duplicating its underlying content.

That suggests separating:

- Node identity/content
- parent/child or typed relationship edges
- contextual relationship meaning

A relationship can carry semantics such as `supports`, `depends on`, `conflicts with`, `qualifies`, `helps address`, or `implemented by` without changing the Node's own type.

## Multiple roots

Atlas may have multiple profile roots and multiple public-facing roots. A root does not need a separate class; root status means the Node is being used as an entry point in a particular context.

The public hierarchy prototype suggests that top-level roots should be broad and comparatively stable. The product should generally encourage people to locate the correct branch rather than treating creation of a new root as the normal posting flow.

## Posts and structured context

Atlas is intended to integrate the hierarchy with a social-media-style public feed. A Node/post can contain flexible user content while also having default structured context fields.

Examples include:

- semantic type
- description
- vote/rating information
- requested child types
- affected locations
- explicit relationships

Structured context should help organize public contributions without replacing the post itself.

## Location is not hierarchy

Real-world problems recur in different places. Location should therefore be modeled as a contextual dimension rather than forcing geographic information into the parent/child hierarchy or treating it as a generic `relates to` link.

A single Node/post may have multiple affected locations.

Conceptually:

```text
Node 1 ---- 0..* AffectedLocation
```

Location can then support filtering, maps, local views, and geographic aggregation independently of the conceptual graph.

## Application and analysis services

A useful architecture direction is:

```text
Browser
   |
ASP.NET Core / C# application
   |
   +---- authoritative database
   |
   +---- background work / queue
   |
   +---- Python analysis service
             |
             +---- graph algorithms
             +---- embeddings
             +---- semantic similarity
             +---- clustering
             +---- AI-assisted analysis
```

The C# application remains authoritative for users, Nodes, permissions, transactions, persistence, roots, and ordinary web behavior. Python can handle analytical workloads that benefit from the graph/scientific/ML ecosystem.

The boundary should stay simple: stable identifiers, structured payloads, and no shared in-process state.

## Centralized validation and security

A generic Node boundary allows common handling for validation, authorization, persistence rules, safe rendering, and abuse prevention. Flexible type vocabulary is user-generated data, not executable application code.

Database safety should rely on parameterized queries / ORM protections rather than attempting to strip SQL-looking text from content.

## Rewrite principle

The old prototype is valuable as behavioral evidence, UI research, and a source of tests, but the next implementation should not preserve obsolete architecture merely to reuse code.

A coherent first core is:

```text
Node model
+
Persistence
+
Relationships / traversal
+
Requested child types
+
Generic Node experience
+
Multiple roots
+
Tests for those behaviors
```

Additional systems such as voting, profiles, moderation, notifications, advanced discovery, diagrams, and AI can be layered around that simpler foundation.