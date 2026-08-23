# Profiles and Identity

This bounded context covers users, identity, profiles, ownership/stewardship, and the way root Nodes are surfaced through a person's profile.

## Next planning actions

- Define the relationship among account identity, profile, Atlas contexts, and future community/organization membership concepts.
- Define profile lifecycle, privacy/visibility defaults, and stable identity facts that other bounded contexts can depend on.
- Define persistence ownership for users, profiles, and profile-to-root/context references.
- Define who may change profile data and what authority facts can be exposed to Graph or Moderation through contracts.
- Model authentication/profile flows without making Graph responsible for user/account storage.

Root status remains contextual: a profile can expose multiple root Nodes without requiring a separate RootNode class.