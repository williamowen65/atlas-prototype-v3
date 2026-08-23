# Moderation

This bounded context covers moderation, reporting, abuse handling, content governance, and the effect of moderation on shared graph content and user-created vocabulary.

## Next planning actions

- Define reports, moderation cases/actions, status transitions, and references to users, Nodes, relationships, or contexts without taking ownership of those domain objects.
- Define moderation actions and distinguish removal/redaction from ordinary author withdrawal.
- Define who can moderate what and how community/organization authority is represented.
- Preserve durable moderation/audit history.
- Model report → review → action → appeal/restoration flows.
- Explicitly consider shared Nodes and relationships: moderation of one piece of content may affect multiple visible routes through the graph.