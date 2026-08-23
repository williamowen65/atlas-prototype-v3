export function indexNodes(nodes = []) {
  return new Map(nodes.map((node) => [node.id, node]));
}

export function childrenFor(parentId, nodes = []) {
  return nodes.filter((node) => Array.isArray(node.parentIds) && node.parentIds.includes(parentId));
}

export function rootsFor(nodes = []) {
  const index = indexNodes(nodes);
  return nodes.filter((node) => !(node.parentIds ?? []).some((parentId) => index.has(parentId)));
}

export function defaultPathForNode(nodeId, nodes = []) {
  const index = indexNodes(nodes);
  const path = [];
  const visited = new Set();
  let current = index.get(nodeId);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    const parent = (current.parentIds ?? []).map((id) => index.get(id)).find(Boolean);
    current = parent ?? null;
  }

  return path;
}

export function resolvePathIds(pathIds = [], selectedId, nodes = []) {
  const index = indexNodes(nodes);
  if (!Array.isArray(pathIds) || pathIds.length === 0) return null;
  if (pathIds[pathIds.length - 1] !== selectedId) return null;

  const path = [];
  for (let i = 0; i < pathIds.length; i += 1) {
    const node = index.get(pathIds[i]);
    if (!node) return null;
    if (i > 0 && !(node.parentIds ?? []).includes(pathIds[i - 1])) return null;
    path.push(node);
  }
  return path;
}

export function childTypeSummaries(node, nodes = []) {
  const summaries = new Map();

  for (const requestedType of node?.requestedChildTypes ?? []) {
    const type = String(requestedType ?? "").trim();
    if (!type) continue;
    const key = type.toLowerCase();
    summaries.set(key, { type, count: 0, requested: true });
  }

  for (const child of childrenFor(node?.id, nodes)) {
    const type = String(child.type ?? "").trim();
    if (!type) continue;
    const key = type.toLowerCase();
    const summary = summaries.get(key) ?? { type, count: 0, requested: false };
    summary.count += 1;
    summaries.set(key, summary);
  }

  return Array.from(summaries.values());
}

export function aggregateWeight(nodeId, nodes = [], visited = new Set()) {
  if (visited.has(nodeId)) return 0;
  const nextVisited = new Set(visited);
  nextVisited.add(nodeId);
  const node = nodes.find((candidate) => candidate.id === nodeId);
  if (!node) return 1;

  const children = childrenFor(nodeId, nodes);
  const votes = Number(node.votes ?? 0);
  const descendantWeight = children.reduce(
    (sum, child) => sum + aggregateWeight(child.id, nodes, nextVisited),
    0,
  );

  return Math.max(1, Math.sqrt(Math.max(0, votes)) + 1 + descendantWeight * 0.45);
}

export function postHrefForPath(path = [], childType = null) {
  const selected = path[path.length - 1];
  if (!selected) return "./index.html";
  const params = new URLSearchParams();
  params.set("id", selected.id);
  params.set("path", path.map((node) => node.id).join("/"));
  if (childType) params.set("childType", childType);
  return `./post.html?${params.toString()}`;
}
