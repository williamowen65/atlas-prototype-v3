const cacheBust = Date.now();

const [{ createGraphContext }, { mountNodeManager }] = await Promise.all([
  import(`../contexts/graph/index.js?preview=${cacheBust}`),
  import(`../contexts/graph/ui/nodeManager.js?preview=${cacheBust}`),
]);

const graph = createGraphContext();
mountNodeManager(graph);
