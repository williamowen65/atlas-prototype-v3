# Notifications

Notifications should be a separate bounded context so Atlas domains can announce that something happened without knowing how a user will ultimately be notified.

Conceptually:

```text
Domain action
    |
    v
Domain event
    |
    +----> Notification subscriber / handler
    +----> Other subscribers
```

For example, Graph may publish `NodeEdited` without knowing whether the eventual user-facing effect is an in-app notification, email, push notification, grouped digest, or no notification.

## Next planning actions

- Define notification and preference entities, recipient references, delivery state, and read state.
- Decide which events notify which recipients and when similar events are grouped or suppressed.
- Define durable delivery attempts, retries, idempotency, and provider adapters.
- Define user control over viewing, dismissing, marking read, and delivery preferences.
- Model event-to-in-app/external-provider flows.