function commaList(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function createPill(text, extraClass = "") {
  const pill = document.createElement("span");
  pill.className = `pill ${extraClass}`.trim();
  pill.textContent = text;
  return pill;
}

export function mountNodeManager(graph) {
  const elements = {
    storageCard: document.querySelector(".storage-card"),
    storageStatus: document.querySelector("#storage-status"),
    storageDetail: document.querySelector("#storage-detail"),
    form: document.querySelector("#node-form"),
    formTitle: document.querySelector("#form-title"),
    nodeId: document.querySelector("#node-id"),
    title: document.querySelector("#node-title"),
    type: document.querySelector("#node-type"),
    description: document.querySelector("#node-description"),
    requestedChildTypes: document.querySelector("#node-requested-child-types"),
    affectedLocations: document.querySelector("#node-affected-locations"),
    submit: document.querySelector("#submit-node"),
    cancelEdit: document.querySelector("#cancel-edit"),
    nodeCount: document.querySelector("#node-count"),
    nodeList: document.querySelector("#node-list"),
    toggleRaw: document.querySelector("#toggle-raw"),
    rawPanel: document.querySelector("#raw-data-panel"),
    rawData: document.querySelector("#raw-data"),
    clearAll: document.querySelector("#clear-all"),
    loadFixtures: document.querySelector("#load-fixtures"),
    message: document.querySelector("#message"),
  };

  let messageTimer;

  function showMessage(text, isError = false) {
    clearTimeout(messageTimer);
    elements.message.textContent = text;
    elements.message.classList.toggle("error", isError);
    elements.message.hidden = false;
    messageTimer = setTimeout(() => {
      elements.message.hidden = true;
    }, 4200);
  }

  function readForm() {
    return {
      title: elements.title.value,
      type: elements.type.value,
      description: elements.description.value,
      requestedChildTypes: elements.requestedChildTypes.value,
      affectedLocations: elements.affectedLocations.value,
    };
  }

  function resetForm() {
    elements.form.reset();
    elements.nodeId.value = "";
    elements.formTitle.textContent = "Create Node";
    elements.submit.textContent = "Create Node";
    elements.cancelEdit.hidden = true;
  }

  function renderNodeCard(node) {
    const card = document.createElement("article");
    card.className = "node-card";

    const body = document.createElement("div");
    const heading = document.createElement("h3");
    heading.textContent = node.title;
    body.appendChild(heading);

    const meta = document.createElement("div");
    meta.className = "node-meta";
    meta.appendChild(createPill(node.type, "type"));

    for (const requestedType of node.requestedChildTypes ?? []) {
      meta.appendChild(createPill(`requests: ${requestedType}`));
    }

    for (const location of node.affectedLocations ?? []) {
      meta.appendChild(createPill(`location: ${location}`));
    }
    body.appendChild(meta);

    if (node.description) {
      const description = document.createElement("p");
      description.className = "node-description";
      description.textContent = node.description;
      body.appendChild(description);
    }

    const id = document.createElement("div");
    id.className = "node-id";
    id.textContent = `id: ${node.id}`;
    body.appendChild(id);

    const actions = document.createElement("div");
    actions.className = "node-actions";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "button button-secondary button-small";
    edit.textContent = "Edit";
    edit.addEventListener("click", () => beginEdit(node.id));

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "button button-danger button-small";
    remove.textContent = "Delete";
    remove.addEventListener("click", () => deleteNode(node));

    actions.append(edit, remove);
    card.append(body, actions);
    return card;
  }

  async function refresh() {
    const nodes = await graph.listNodes();
    elements.nodeCount.textContent = String(nodes.length);
    elements.rawData.textContent = JSON.stringify(nodes, null, 2);
    elements.nodeList.replaceChildren();

    if (nodes.length === 0) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      const title = document.createElement("strong");
      title.textContent = "No Nodes stored yet";
      const detail = document.createElement("span");
      detail.textContent = "Create one with the form or load the sample fixture data.";
      empty.append(title, detail);
      elements.nodeList.appendChild(empty);
      return;
    }

    for (const node of nodes) {
      elements.nodeList.appendChild(renderNodeCard(node));
    }
  }

  async function beginEdit(id) {
    try {
      const node = await graph.getNode(id);
      if (!node) {
        showMessage("That Node no longer exists.", true);
        await refresh();
        return;
      }

      elements.nodeId.value = node.id;
      elements.title.value = node.title;
      elements.type.value = node.type;
      elements.description.value = node.description ?? "";
      elements.requestedChildTypes.value = commaList(node.requestedChildTypes);
      elements.affectedLocations.value = commaList(node.affectedLocations);
      elements.formTitle.textContent = "Edit Node";
      elements.submit.textContent = "Save changes";
      elements.cancelEdit.hidden = false;
      elements.title.focus();
      elements.form.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  async function deleteNode(node) {
    if (!window.confirm(`Delete “${node.title}” from this browser?`)) {
      return;
    }

    try {
      await graph.deleteNode(node.id);
      if (elements.nodeId.value === node.id) {
        resetForm();
      }
      await refresh();
      showMessage("Node deleted from IndexedDB.");
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const id = elements.nodeId.value;
      if (id) {
        await graph.updateNode(id, readForm());
        showMessage("Node changes saved to IndexedDB.");
      } else {
        await graph.createNode(readForm());
        showMessage("Node saved to IndexedDB in this browser.");
      }
      resetForm();
      await refresh();
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  elements.cancelEdit.addEventListener("click", resetForm);

  elements.toggleRaw.addEventListener("click", () => {
    const showing = !elements.rawPanel.hidden;
    elements.rawPanel.hidden = showing;
    elements.toggleRaw.textContent = showing ? "Show raw data" : "Hide raw data";
    elements.toggleRaw.setAttribute("aria-expanded", String(!showing));
  });

  elements.clearAll.addEventListener("click", async () => {
    if (!window.confirm("Clear every locally stored Graph Node from this browser?")) {
      return;
    }

    try {
      await graph.clearNodes();
      resetForm();
      await refresh();
      showMessage("All Graph Nodes were cleared from IndexedDB.");
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  elements.loadFixtures.addEventListener("click", async () => {
    try {
      const response = await fetch("./src/contexts/graph/fixtures/sample-nodes.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Unable to load fixture data (${response.status}).`);
      }
      const fixtures = await response.json();
      const imported = await graph.importNodes(fixtures);
      await refresh();
      showMessage(`${imported.length} sample Nodes loaded into IndexedDB.`);
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  async function initialize() {
    try {
      await graph.ready();
      const storage = graph.storageInfo();
      elements.storageCard.classList.add("ready");
      elements.storageStatus.textContent = `${storage.persistence} connected`;
      elements.storageDetail.textContent = `${storage.databaseName} · ${storage.objectStoreName}`;
      await refresh();
    } catch (error) {
      elements.storageCard.classList.add("error");
      elements.storageStatus.textContent = "Local storage unavailable";
      elements.storageDetail.textContent = error.message;
      showMessage(error.message, true);
    }
  }

  initialize();
}
