function createPill(text, extraClass = "") {
  const pill = document.createElement("span");
  pill.className = `pill ${extraClass}`.trim();
  pill.textContent = text;
  return pill;
}

function formatSemanticType(value) {
  return String(value ?? "").trim().toUpperCase();
}

function pluralizeType(type, count) {
  const value = String(type ?? "").trim();
  if (count === 1 || !value) return value;
  if (value.toLowerCase() === "evidence") return value;
  if (/[^aeiou]y$/i.test(value)) return `${value.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(value)) return `${value}es`;
  return `${value}s`;
}

function formatAverage(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number.toFixed(1) : "0.0";
}

function createIconButton({ label, pathData, extraClass = "" }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `node-icon-button ${extraClass}`.trim();
  button.setAttribute("aria-label", label);
  button.title = label;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.9");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  svg.appendChild(path);
  button.appendChild(svg);
  return button;
}

export function mountNodeManager(graph) {
  const elements = {
    storageCard: document.querySelector(".storage-card"),
    storageStatus: document.querySelector("#storage-status"),
    storageDetail: document.querySelector("#storage-detail"),
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

  function childCountForType(node, requestedType, allNodes) {
    const normalizedType = String(requestedType).trim().toLowerCase();
    return allNodes.filter((candidate) => {
      const parentIds = candidate.parentIds ?? [];
      return parentIds.includes(node.id)
        && String(candidate.type ?? "").trim().toLowerCase() === normalizedType;
    }).length;
  }

  function renderRequestedChildTypes(node, allNodes) {
    const requestedTypes = node.requestedChildTypes ?? [];
    if (requestedTypes.length === 0) return null;

    const tabs = document.createElement("div");
    tabs.className = "requested-child-tabs";
    tabs.setAttribute("aria-label", "Requested child types");

    for (const requestedType of requestedTypes) {
      const count = childCountForType(node, requestedType, allNodes);
      const tab = document.createElement("span");
      tab.className = "requested-child-tab";
      tab.textContent = `${count} ${pluralizeType(requestedType, count)}`;
      tabs.appendChild(tab);
    }

    return tabs;
  }

  function renderStats(node) {
    const stats = document.createElement("div");
    stats.className = "node-stats";

    const votes = document.createElement("span");
    const voteValue = document.createElement("strong");
    voteValue.textContent = String(Number(node.votes ?? 0) || 0);
    votes.append(voteValue, " votes");

    const average = document.createElement("span");
    const averageValue = document.createElement("strong");
    averageValue.textContent = formatAverage(node.average);
    average.append(averageValue, " avg");

    stats.append(votes, average);
    return stats;
  }

  function renderNodeCard(node, allNodes) {
    const entry = document.createElement("div");
    entry.className = "node-entry";

    const card = document.createElement("article");
    card.className = "node-card";

    const body = document.createElement("div");
    body.className = "node-card-body";

    const titleLine = document.createElement("div");
    titleLine.className = "node-title-line";

    const typeLabel = document.createElement("span");
    typeLabel.className = "node-type-label";
    typeLabel.textContent = formatSemanticType(node.type);

    const heading = document.createElement("h3");
    heading.textContent = node.title;

    titleLine.append(typeLabel, heading);
    body.appendChild(titleLine);

    if (node.description) {
      const description = document.createElement("p");
      description.className = "node-description";
      description.textContent = node.description;
      body.appendChild(description);
    }

    body.appendChild(renderStats(node));

    const locations = node.affectedLocations ?? [];
    if (locations.length > 0) {
      const meta = document.createElement("div");
      meta.className = "node-meta";
      for (const location of locations) meta.appendChild(createPill(location, "location"));
      body.appendChild(meta);
    }

    const actions = document.createElement("div");
    actions.className = "node-actions";

    const edit = createIconButton({
      label: `Edit ${node.title}`,
      pathData: "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z",
      extraClass: "node-icon-button-edit",
    });
    edit.addEventListener("click", () => {
      window.location.href = `./create.html?id=${encodeURIComponent(node.id)}`;
    });

    const remove = createIconButton({
      label: `Delete ${node.title}`,
      pathData: "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6 M10 11v5 M14 11v5",
      extraClass: "node-icon-button-delete",
    });
    remove.addEventListener("click", () => deleteNode(node));

    actions.append(edit, remove);
    card.append(body, actions);
    entry.appendChild(card);

    const requestedTabs = renderRequestedChildTypes(node, allNodes);
    if (requestedTabs) entry.appendChild(requestedTabs);

    return entry;
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
      detail.textContent = "Create a Node or load the sample fixture data.";
      empty.append(title, detail);
      elements.nodeList.appendChild(empty);
      return;
    }

    for (const node of nodes) elements.nodeList.appendChild(renderNodeCard(node, nodes));
  }

  async function deleteNode(node) {
    if (!window.confirm(`Delete “${node.title}” from this browser?`)) return;

    try {
      await graph.deleteNode(node.id);
      await refresh();
      showMessage("Node deleted from IndexedDB.");
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  elements.toggleRaw.addEventListener("click", () => {
    const showing = !elements.rawPanel.hidden;
    elements.rawPanel.hidden = showing;
    elements.toggleRaw.textContent = showing ? "Show raw data" : "Hide raw data";
    elements.toggleRaw.setAttribute("aria-expanded", String(!showing));
  });

  elements.clearAll.addEventListener("click", async () => {
    if (!window.confirm("Clear every locally stored Graph Node from this browser?")) return;

    try {
      await graph.clearNodes();
      await refresh();
      showMessage("All Graph Nodes were cleared from IndexedDB.");
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  elements.loadFixtures.addEventListener("click", async () => {
    try {
      const response = await fetch("./src/contexts/graph/fixtures/sample-nodes.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Unable to load fixture data (${response.status}).`);
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
