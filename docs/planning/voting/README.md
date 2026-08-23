# Voting

Voting is its own bounded/domain concern rather than a property that should dominate the generic Node model.

The rewrite still needs a concrete voting model.

## Next planning actions

- Define what a vote means and whether votes can change or be retracted.
- Define scoring/ranking semantics and where Strategy-based ranking algorithms belong.
- Define persistence, indexing, uniqueness, and whether a user may have one active vote per target.
- Define who may vote and how abuse is constrained.
- Model cast/change/remove/read-score flows.
- Keep raw vote records separate from derived ranking/aggregate importance so different visual/feed strategies can evolve.