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
    { title: "A question", type: "question" },
    { id: "node-1", now: "2026-08-23T18:00:00.000Z" },
  );

  assert.equal(node.id, "node-1");
  assert.equal(node.type, "question");
  assert.deepEqual(node.requestedChildTypes, []);
  assert.equal(node.createdAt, node.updatedAt);
});

test("updates mutable Node data while preserving identity and creation time", () => {
  const existing = createNodeRecord(
    { title: "Original", type: "issue" },
    { id: "node-2", now: "2026-08-23T18:00:00.000Z" },
  );

  const updated = updateNodeRecord(
    existing,
    { title: "Updated", type: "solution", affectedLocations: ["Puget Sound"] },
    { now: "2026-08-23T19:00:00.000Z" },
  );

  assert.equal(updated.id, "node-2");
  assert.equal(updated.createdAt, "2026-08-23T18:00:00.000Z");
  assert.equal(updated.updatedAt, "2026-08-23T19:00:00.000Z");
  assert.equal(updated.title, "Updated");
  assert.equal(updated.type, "solution");
  assert.deepEqual(updated.affectedLocations, ["Puget Sound"]);
});

test("requires title and semantic type", () => {
  assert.throws(() => normalizeNodeInput({ title: "", type: "issue" }), /title is required/i);
  assert.throws(() => normalizeNodeInput({ title: "Valid", type: "" }), /type is required/i);
});
