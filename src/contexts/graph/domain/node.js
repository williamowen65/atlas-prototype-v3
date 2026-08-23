function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

export function normalizeNodeInput(input) {
  const title = String(input.title ?? "").trim();
  const type = String(input.type ?? "").trim();

  if (!title) {
    throw new Error("A Node title is required.");
  }

  if (!type) {
    throw new Error("A semantic Node type is required.");
  }

  return {
    title,
    type,
    description: String(input.description ?? "").trim(),
    requestedChildTypes: normalizeList(input.requestedChildTypes),
    affectedLocations: normalizeList(input.affectedLocations),
  };
}

export function createNodeRecord(input, { id, now } = {}) {
  const normalized = normalizeNodeInput(input);
  const timestamp = now ?? new Date().toISOString();

  return {
    id: id ?? crypto.randomUUID(),
    ...normalized,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateNodeRecord(existingNode, input, { now } = {}) {
  if (!existingNode?.id) {
    throw new Error("An existing Node is required for an update.");
  }

  return {
    ...existingNode,
    ...normalizeNodeInput(input),
    updatedAt: now ?? new Date().toISOString(),
  };
}
