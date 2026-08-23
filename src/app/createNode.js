const cacheBust = Date.now();

const [{ createGraphContext }, { mountCreateNodePage }] = await Promise.all([
  import(`../contexts/graph/index.js?preview=${cacheBust}`),
  import(`../contexts/graph/ui/createNodePage.js?preview=${cacheBust}`),
]);

const graph = createGraphContext();
mountCreateNodePage(graph);
