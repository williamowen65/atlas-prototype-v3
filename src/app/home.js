const cacheBust = Date.now();

const [{ createGraphContext }, { mountRouteCollectionPage }] = await Promise.all([
  import(`../contexts/graph/index.js?preview=${cacheBust}`),
  import(`../contexts/graph/ui/routeCollectionPage.js?preview=${cacheBust}`),
]);

const graph = createGraphContext();
const host = document.querySelector("#route-root-graph");
const message = document.querySelector("#route-message");

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle("error", isError);
  message.hidden = false;
}

mountRouteCollectionPage(graph, { host, showMessage });
