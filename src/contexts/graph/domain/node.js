function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

function normalizeNonNegativeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
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
    parentIds: normalizeList(input.parentIds),
    votes: normalizeNonNegativeNumber(input.votes),
    average: normalizeNonNegativeNumber(input.average),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateNodeRecord(existingNode, input, { now } = {}) {
  if (!existingNode?.id) {
    throw new Error("An existing Node is required for an update.");
  }

  const updated = {
    ...existingNode,
    ...normalizeNodeInput(input),
    updatedAt: now ?? new Date().toISOString(),
  };

  if (Object.prototype.hasOwnProperty.call(input, "parentIds")) {
    updated.parentIds = normalizeList(input.parentIds);
  }

  if (Object.prototype.hasOwnProperty.call(input, "votes")) {
    updated.votes = normalizeNonNegativeNumber(input.votes);
  }

  if (Object.prototype.hasOwnProperty.call(input, "average")) {
    updated.average = normalizeNonNegativeNumber(input.average);
  }

  return updated;
}
