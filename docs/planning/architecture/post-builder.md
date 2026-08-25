# Post Builder Architecture

## Purpose

Atlas is expected to support rich posts assembled from blocks such as text, images, video, polls, charts, citations, and relationships to other Nodes. This creates two related construction problems:

1. the client needs to help a person gradually compose an editable draft;
2. the server needs to construct an authoritative Post that satisfies Atlas domain and security rules.

Both sides may use builder-like code, but they have different responsibilities. A visual feature called a “post builder” does not automatically mean that its implementation uses the Gang of Four Builder pattern.

## Construction flow

```mermaid
flowchart LR
    A["Visual post editor"] --> B["Frontend draft"]
    B --> C["API request"]
    C --> D["Backend validation"]
    D --> E["Domain Post builder"]
    E --> F["Saved post"]
```

The frontend builds the post the user is requesting. The backend builds the Post that Atlas is actually willing to accept and store.

## Frontend draft builder

The frontend construction model should support the editing experience:

- adding, removing, and reordering content blocks;
- editing a partially complete post;
- previewing the result;
- autosaving and restoring drafts;
- changing a block from one supported type to another where appropriate;
- displaying validation guidance before submission;
- serializing the draft into the API request schema.

A fluent Builder API is one possible implementation:

```javascript
const draft = new PostBuilder()
  .setTitle("Improving public transit")
  .addText("Here is my proposal...")
  .addPoll(["Support", "Oppose"])
  .linkNode("climate-adaptation")
  .build();
```

However, ordinary UI state management may be clearer if the frontend mostly performs incremental edits. The architectural requirement is a well-defined draft model, not a mandatory `PostBuilder` class.

Frontend validation improves usability but is not authoritative. A client can be outdated, faulty, or bypassed.

## Backend domain builder

The ASP.NET Core application is the authoritative layer. It must independently validate the request and construct the domain object using trusted context and server-owned values.

A conceptual C# API might look like:

```csharp
Post post = new PostBuilder()
    .WithAuthor(currentUser)
    .WithTitle(request.Title)
    .WithBlocks(validatedBlocks)
    .WithRelationships(validatedRelationships)
    .CreatedAt(clock.UtcNow)
    .WithStatus(PostStatus.Draft)
    .Build();
```

The backend construction process may enforce rules such as:

- a Post must have an authenticated author;
- a Post must contain at least one allowed content block;
- titles and blocks must satisfy size and content constraints;
- polls must have a valid question and valid options;
- citations and media must use supported shapes;
- referenced Nodes and relationships must exist and be permitted;
- server-controlled values such as author, timestamps, ownership, and initial status cannot be supplied authoritatively by the browser;
- only valid combinations of blocks and metadata can produce a Post.

The Builder pattern is most valuable here if Post construction has many optional components, required invariants, or multiple creation paths. If construction remains simple, a named factory method or application service may communicate the intent with less machinery.

## Boundary between frontend and backend

The frontend and backend should not share a Builder implementation. They should share an explicit contract:

- API request and response schemas;
- supported block-type identifiers;
- validation limits needed for immediate UI feedback;
- versioning or compatibility rules for draft payloads;
- stable error codes that the editor can associate with particular fields or blocks.

The backend must reconstruct and validate the Post rather than deserialize the request directly into an already-valid domain entity.

## Recommended direction

- Model the frontend as an editable `PostDraft` composed of ordered block drafts.
- Use UI actions or reducer-style updates for incremental editing; introduce a frontend Builder only if it makes creation workflows clearer.
- Accept a dedicated create/update request DTO at the API boundary.
- Validate and normalize every submitted block on the backend.
- Keep domain invariants inside the authoritative application/domain layer.
- Introduce a backend Builder when the number of optional components and construction rules makes constructors or factory methods difficult to read.
- Preserve server ownership of identity, authorship, timestamps, permissions, and lifecycle state.

## Open decisions

- Which content block types belong in the first post-builder release?
- Are Node relationships themselves blocks, separate post metadata, or both for different purposes?
- Can drafts contain temporarily invalid or incomplete blocks?
- Where are draft autosaves stored: browser, server, or both?
- How are block schemas versioned as new block types are introduced?
- Does publishing construct a new immutable revision, or transition the existing draft?
