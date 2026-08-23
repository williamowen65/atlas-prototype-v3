import test from "node:test";
import assert from "node:assert/strict";

import {
  aggregateWeight,
  childTypeSummaries,
  childrenForType,
  defaultPathForNode,
  resolvePathIds,
  responseTypeForParent,
} from "../src/contexts/graph/application/hierarchyProjection.js";

const nodes = [
  { id: "root-a", type: "issue", title: "Root A", requestedChildTypes: ["solution"], parentIds: [], votes: 0, average: 0 },
  { id: "root-b", type: "issue", title: "Root B", requestedChildTypes: ["solution"], parentIds: [], votes: 0, average: 0 },
  { id: "solution-a", type: "solution", title: "Solution A", requestedChildTypes: ["challenge", "implementation"], parentIds: ["root-a"], votes: 0, average: 0 },
  {
    id: "shared",
    type: "relationship",
    title: "Shared",
    requestedChildTypes: ["challenge"],
    parentIds: ["solution-a", "root-b"],
    votes: 0,
    average: 0,
    metadata: { responseTypeByParent: { "solution-a": "yay", "root-b": "solution" } },
  },
  { id: "challenge-a", type: "challenge", title: "Challenge", requestedChildTypes: ["solution"], parentIds: ["shared"], votes: 0, average: 0 },
  { id: "question-a", type: "question", title: "Question", requestedChildTypes: ["answer"], parentIds: ["solution-a"], votes: 0, average: 0 },
];

test("builds a default hierarchy path using the first valid parent route", () => {
  assert.deepEqual(
    defaultPathForNode("shared", nodes).map((node) => node.id),
    ["root-a", "solution-a", "shared"],
  );
});

test("accepts an alternate valid route for a shared node", () => {
  const resolved = resolvePathIds(["root-b", "shared"], "shared", nodes);
  assert.deepEqual(resolved.map((node) => node.id), ["root-b", "shared"]);
});

test("rejects a route that does not follow parent links", () => {
  assert.equal(resolvePathIds(["root-a", "shared"], "shared", nodes), null);
});

test("child type summaries use the contextual response type for shared nodes", () => {
  assert.equal(responseTypeForParent(nodes[3], "solution-a"), "yay");
  assert.equal(responseTypeForParent(nodes[3], "root-b"), "solution");

  assert.deepEqual(childTypeSummaries(nodes[2], nodes), [
    { type: "challenge", count: 0, requested: true },
    { type: "implementation", count: 0, requested: true },
    { type: "yay", count: 1, requested: false },
    { type: "question", count: 1, requested: false },
  ]);

  assert.deepEqual(childrenForType("solution-a", "yay", nodes).map((node) => node.id), ["shared"]);
});

test("aggregate weight follows direct support rather than descendant count", () => {
  assert.equal(aggregateWeight("root-a", nodes), aggregateWeight("solution-a", nodes));
  assert.equal(aggregateWeight("solution-a", nodes), aggregateWeight("question-a", nodes));

  const supported = [...nodes, { id: "supported", type: "issue", title: "Supported", requestedChildTypes: ["solution"], parentIds: [], votes: 100, average: 5 }];
  assert.ok(aggregateWeight("supported", supported) > aggregateWeight("root-a", supported));
});
