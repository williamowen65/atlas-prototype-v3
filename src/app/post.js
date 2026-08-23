const cacheBust = Date.now();

const [{ createGraphContext }, { mountPostPage }] = await Promise.all([
  import(`../contexts/graph/index.js?preview=${cacheBust}`),
  import(`../contexts/graph/ui/postPage.js?preview=${cacheBust}`),
]);

const graph = createGraphContext();
mountPostPage(graph);
