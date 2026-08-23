import { mountHierarchyExplorer } from "./hierarchyView.js";

export function mountPostPage(graph) {
  const elements = {
    storageCard: document.querySelector(".storage-card"),
    storageStatus: document.querySelector("#storage-status"),
    storageDetail: document.querySelector("#storage-detail"),
    message: document.querySelector("#post-message"),
    postView: document.querySelector("#post-view"),
  };

  function showMessage(text, isError = false) {
    elements.message.textContent = text;
    elements.message.classList.toggle("error", isError);
    elements.message.hidden = false;
  }

  async function initialize() {
    try {
      await graph.ready();
      const storage = graph.storageInfo();
      const storageDetail = `${storage.persistence}: ${storage.databaseName} · ${storage.objectStoreName}`;
      elements.storageCard.classList.add("ready");
      elements.storageCard.title = storageDetail;
      elements.storageStatus.textContent = "Local";
      elements.storageDetail.textContent = storageDetail;

      await mountHierarchyExplorer(graph, {
        host: elements.postView,
        showMessage,
      });
    } catch (error) {
      elements.storageCard.classList.add("error");
      elements.storageCard.title = error.message;
      elements.storageStatus.textContent = "Storage error";
      elements.storageDetail.textContent = error.message;
      showMessage(error.message, true);
    }
  }

  initialize();
}
