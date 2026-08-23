# Architecture

This planning area covers runtime component boundaries and implementation choices rather than Atlas domain semantics.

Current direction uses an ASP.NET Core / C# application as the authoritative application layer and a separate Python analysis service for graph, semantic, clustering, embedding, and AI workloads.

Client-code/use-case sketches should be used during planning to test whether bounded-context contracts remain readable and encapsulated before persistence and infrastructure details leak into callers.

## Next planning actions

- Choose event dispatch and transaction behavior, including when durable messaging is necessary.
- Define the C# ↔ Python contract: synchronous requests versus async jobs/events, payloads, failures, and timeouts.
- Finalize deployment/runtime topology for ASP.NET, Python analysis, database, cache, and workers.
- Keep public contracts grounded in caller needs rather than exposing persistence/infrastructure internals.
- Prefer independently replaceable analysis components over shared in-process state.