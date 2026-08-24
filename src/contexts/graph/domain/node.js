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

function normalizeMetadata(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return { ...value };
}

function validateRelationshipShape(type, parentIds, metadata) {
  if (String(type).toLowerCase() !== "relationship") return;

  const uniqueParents = [...new Set(parentIds)];
  if (uniqueParents.length !== 2 || parentIds.length !== 2) {
    throw new Error("A relationship Node must connect exactly two different parent Nodes.");
  }

  const relationshipType = String(metadata.relationshipType ?? "").trim();
  if (!relationshipType) {
    throw new Error("A relationship keyword is required.");
  }

  if (metadata.sourceId && !uniqueParents.includes(String(metadata.sourceId))) {
    throw new Error("The relationship source must be one of its two parent Nodes.");
  }

  if (metadata.targetId && !uniqueParents.includes(String(metadata.targetId))) {
    throw new Error("The relationship target must be one of its two parent Nodes.");
  }
}

export function normalizeNodeInput(input) {
  const title = String(input.title ?? "").trim();
  const type = String(input.type ?? "").trim();
  const requestedChildTypes = normalizeList(input.requestedChildTypes);
  const parentIds = normalizeList(input.parentIds);
  const metadata = normalizeMetadata(input.metadata);

  if (!title) {
    throw new Error("A Node title is required.");
  }

  if (!type) {
    throw new Error("A semantic Node type is required.");
  }

  if (requestedChildTypes.length === 0) {
    throw new Error("At least one requested feedback type is required.");
  }

  validateRelationshipShape(type, parentIds, metadata);

  return {
    title,
    type,
    description: String(input.description ?? "").trim(),
    requestedChildTypes,
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
    metadata: normalizeMetadata(input.metadata),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function updateNodeRecord(existingNode, input, { now } = {}) {
  if (!existingNode?.id) {
    throw new Error("An existing Node is required for an update.");
  }

  const effectiveInput = {
    ...input,
    parentIds: Object.prototype.hasOwnProperty.call(input, "parentIds")
      ? input.parentIds
      : existingNode.parentIds,
    metadata: Object.prototype.hasOwnProperty.call(input, "metadata")
      ? input.metadata
      : existingNode.metadata,
  };

  const updated = {
    ...existingNode,
    ...normalizeNodeInput(effectiveInput),
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

  if (Object.prototype.hasOwnProperty.call(input, "metadata")) {
    updated.metadata = normalizeMetadata(input.metadata);
  }

  return updated;
}
