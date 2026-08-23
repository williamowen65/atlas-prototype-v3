# Product Experience

This area records user-facing Atlas behavior learned from the hierarchy prototype and turns those experiments into rewrite-oriented requirements.

## Documents

- [Hierarchy prototype lessons and decisions](hierarchy-prototype-notes.md)
- [Page and screen map](page-and-screen-map.md)

## Scope

Product Experience covers public navigation, hierarchy/feed representations, context preservation, mobile/desktop behavior, display controls, semantic zoom, and the information a user needs to understand where they are in the Atlas.

It should consume the Graph domain model rather than redefining it.

## Current priorities

- Convert prototype interaction knowledge into explicit product requirements.
- Keep styling experiments separate from required behavior.
- Make graph/tiled and feed/forum views projections of the same underlying Node data.
- Preserve orientation while users move from broad roots into very deep branches.
- Make public classification feel natural: users should look for where a contribution belongs before considering a new root.
- Treat affected locations and other default context parameters as reusable structured metadata around posts.
- Ensure narrow/mobile layouts reflow content without changing the conceptual behavior.
- Develop hierarchy-level overview zoom as an intentional Atlas interaction rather than relying on browser zoom.