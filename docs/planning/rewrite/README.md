# Rewrite Execution

This planning area covers how the rewrite is executed: what to reuse from the old application, which tests describe enduring behavior, and what the smallest coherent first rewrite milestone should contain.

## Next planning actions

- Deliberately classify old application pieces as reusable code, reusable concept/reference, rewrite, or delete rather than copying architecture wholesale.
- Classify existing tests into enduring behavior, new-model rewrite, obsolete implementation coupling, or uncertain.
- Define the smallest coherent vertical slice that proves the generic Node/relationship architecture.
- Order dependencies so Graph, identity/security boundaries, persistence, and minimum UI contracts are coherent before optional domains are layered on.

A candidate first milestone is:

```text
Generic Node model
+
Persistence
+
Relationships / traversal
+
Requested child types
+
Affected-location shape
+
Generic Node/post view
+
Multiple roots
+
Tests
```

The old hierarchy prototype should remain a behavioral test/reference source for navigation, context preservation, mobile behavior, dense lower-level content, end-of-branch handling, graph/feed projections, and overview zoom rather than an implementation template.