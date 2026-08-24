import test from "node:test";
import assert from "node:assert/strict";

import { createNodeRecord, normalizeNodeInput, updateNodeRecord } from "../src/contexts/graph/domain/node.js";

test("normalizes comma-separated Graph Node metadata", () => {
  const result = normalizeNodeInput({
    title: "  Transit access  ",
    type: " issue ",
    description: "  Improve connections  ",
    requestedChildTypes: "solution, evidence",
    affectedLocations: "Tacoma, Gig Harbor",
  });

  assert.deepEqual(result, {
    title: "Transit access",
    type: "issue",
    description: "Improve connections",
    requestedChildTypes: ["solution", "evidence"],
    affectedLocations: ["Tacoma", "Gig Harbor"],
  });
});

test("creates a generic Node record without semantic subclasses", () => {
  const node = createNodeRecord(
    { title: "A question", type: "question", requestedChildTypes: ["answer"] },
    { id: "node-1", now: "2026-08-23T18:00:00.000Z" },
  );

  assert.equal(node.id, "node-1");
  assert.equal(node.type, "question");
  assert.deepEqual(node.requestedChildTypes, ["answer"]);
  assert.deepEqual(node.parentIds, []);
  assert.equal(node.votes, 0);
  assert.equal(node.average, 0);
  assert.deepEqual(node.metadata, {});
  assert.equal(node.createdAt, node.updatedAt);
});

test("creates a two-parent relationship Node with a relationship keyword", () => {
  const node = createNodeRecord(
    {
      title: "A relationship",
      type: "relationship",
      requestedChildTypes: ["challenge"],
      parentIds: ["parent-1", "parent-2"],
      votes: 12,
      average: 4.5,
      metadata: {
        relationshipType: "helps-address",
        relationshipLabel: "helps address",
        sourceId: "parent-1",
        targetId: "parent-2",
      },
    },
    { id: "node-child", now: "2026-08-23T18:00:00.000Z" },
  );

  assert.deepEqual(node.parentIds, ["parent-1", "parent-2"]);
  assert.equal(node.votes, 12);
  assert.equal(node.average, 4.5);
  assert.equal(node.metadata.relationshipType, "helps-address");
  assert.equal(node.metadata.sourceId, "parent-1");
  assert.equal(node.metadata.targetId, "parent-2");
});

test("rejects relationship Nodes that could become roots or have only one parent", () => {
  const base = {
    title: "A relationship",
    type: "relationship",
    requestedChildTypes: ["challenge"],
    metadata: { relationshipType: "relates-to" },
  };

  assert.throws(
    () => createNodeRecord({ ...base, parentIds: [] }),
    /exactly two different parent Nodes/i,
  );
  assert.throws(
    () => createNodeRecord({ ...base, parentIds: ["parent-1"] }),
    /exactly two different parent Nodes/i,
  );
  assert.throws(
    () => createNodeRecord({ ...base, parentIds: ["parent-1", "parent-1"] }),
    /exactly two different parent Nodes/i,
  );
  assert.throws(
    () => createNodeRecord({ ...base, parentIds: ["parent-1", "parent-2"], metadata: {} }),
    /relationship keyword is required/i,
  );
});

test("updates mutable Node data while preserving identity, creation time, and internal metadata", () => {
  const existing = createNodeRecord(
    {
      title: "Original",
      type: "issue",
      requestedChildTypes: ["solution"],
      parentIds: ["parent-1"],
      votes: 3,
      average: 4.2,
      metadata: { rootRole: "issue" },
    },
    { id: "node-2", now: "2026-08-23T18:00:00.000Z" },
  );

  const updated = updateNodeRecord(
    existing,
    {
      title: "Updated",
      type: "solution",
      requestedChildTypes: ["evidence"],
      affectedLocations: ["Puget Sound"],
    },
    { now: "2026-08-23T19:00:00.000Z" },
  );

  assert.equal(updated.id, "node-2");
  assert.equal(updated.createdAt, "2026-08-23T18:00:00.000Z");
  assert.equal(updated.updatedAt, "2026-08-23T19:00:00.000Z");
  assert.equal(updated.title, "Updated");
  assert.equal(updated.type, "solution");
  assert.deepEqual(updated.requestedChildTypes, ["evidence"]);
  assert.deepEqual(updated.affectedLocations, ["Puget Sound"]);
  assert.deepEqual(updated.parentIds, ["parent-1"]);
  assert.equal(updated.votes, 3);
  assert.equal(updated.average, 4.2);
  assert.deepEqual(updated.metadata, { rootRole: "issue" });
});

test("requires title, semantic type, and at least one requested feedback type", () => {
  assert.throws(
    () => normalizeNodeInput({ title: "", type: "issue", requestedChildTypes: ["solution"] }),
    /title is required/i,
  );
  assert.throws(
    () => normalizeNodeInput({ title: "Valid", type: "", requestedChildTypes: ["solution"] }),
    /type is required/i,
  );
  assert.throws(
    () => normalizeNodeInput({ title: "Valid", type: "issue", requestedChildTypes: [] }),
    /requested feedback type is required/i,
  );
});
