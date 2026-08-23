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

// Preserve the contextual response appearances from Semantic Zooming commit
// 9e748de. A shared relationship Node can belong to different response tabs
// depending on which parent route is being viewed.
const referenceResponseTypeByParent = {
  "relationship-surplus-food-helps-homelessness": {
    "solution-redirect-surplus-food": "yay",
    "root-homelessness": "solution",
  },
  "relationship-social-media-implemented-by-atlas": {
    "solution-social-media-collective-problem-solving": "implementation",
    "root-atlas-public-think-tank": "connection",
  },
};

export function responseTypeForParent(child, parentId) {
  const explicit = child?.metadata?.responseTypeByParent?.[parentId];
  if (explicit) return String(explicit).trim();

  const referenced = referenceResponseTypeByParent[child?.id]?.[parentId];
  if (referenced) return referenced;

  return String(child?.type ?? "").trim();
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
    const type = responseTypeForParent(child, node.id);
    if (!type) continue;
    const key = type.toLowerCase();
    const summary = summaries.get(key) ?? { type, count: 0, requested: false };
    summary.count += 1;
    summaries.set(key, summary);
  }

  return Array.from(summaries.values());
}

export function childrenForType(parentId, type, nodes = []) {
  const wanted = String(type ?? "").trim().toLowerCase();
  return childrenFor(parentId, nodes).filter(
    (child) => responseTypeForParent(child, parentId).toLowerCase() === wanted,
  );
}

// Match commit 9e748de: polygon area reflects only the node's own support,
// not descendant count/depth. With the recovered demo's zeroed voting data,
// siblings therefore start with equal weight.
export function aggregateWeight(nodeId, nodes = []) {
  const node = nodes.find((candidate) => candidate.id === nodeId);
  if (!node) return 1;
  const votes = Math.max(1, Number(node.votes ?? 0) || 1);
  const average = Math.max(0.5, Math.min(5, Number(node.average ?? 0) || 3));
  return Math.max(1, votes * (0.35 + (0.65 * average) / 5));
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
