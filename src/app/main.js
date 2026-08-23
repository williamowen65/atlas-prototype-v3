import { createGraphContext } from "../contexts/graph/index.js";
import { mountNodeManager } from "../contexts/graph/ui/nodeManager.js";

const graph = createGraphContext();
mountNodeManager(graph);
