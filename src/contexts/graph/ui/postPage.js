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

function childTypeSummaries(node, allNodes) {
  const summaries = new Map();

  for (const requestedType of node.requestedChildTypes ?? []) {
    const type = String(requestedType ?? "").trim();
    if (!type) continue;
    const key = type.toLowerCase();
    if (!summaries.has(key)) {
      summaries.set(key, { type, count: 0, requested: true });
    } else {
      summaries.get(key).requested = true;
    }
  }

  for (const candidate of allNodes) {
    if (!(candidate.parentIds ?? []).includes(node.id)) continue;

    const type = String(candidate.type ?? "").trim();
    if (!type) continue;
    const key = type.toLowerCase();

    if (!summaries.has(key)) {
      summaries.set(key, { type, count: 0, requested: false });
    }
    summaries.get(key).count += 1;
  }

  return Array.from(summaries.values());
}

function renderChildTypeTabs(node, allNodes) {
  const summaries = childTypeSummaries(node, allNodes);
  if (summaries.length === 0) return null;

  const tabs = document.createElement("div");
  tabs.className = "requested-child-tabs";
  tabs.setAttribute("aria-label", "Child types");

  for (const item of summaries) {
    const tab = document.createElement("span");
    tab.className = "requested-child-tab";
    if (item.requested) tab.classList.add("requested");
    tab.textContent = `${item.count} ${pluralizeType(item.type, item.count)}`;
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

export function mountPostPage(graph) {
  const elements = {
    storageCard: document.querySelector(".storage-card"),
    storageStatus: document.querySelector("#storage-status"),
    storageDetail: document.querySelector("#storage-detail"),
    selectedPostNav: document.querySelector("#selected-post-nav"),
    message: document.querySelector("#post-message"),
    postView: document.querySelector("#post-view"),
  };

  function showMessage(text, isError = false) {
    elements.message.textContent = text;
    elements.message.classList.toggle("error", isError);
    elements.message.hidden = false;
  }

  function showSelectedPostInNav(node) {
    if (!elements.selectedPostNav) return;
    elements.selectedPostNav.textContent = node.title;
    elements.selectedPostNav.title = node.title;
    elements.selectedPostNav.hidden = false;

    requestAnimationFrame(() => {
      elements.selectedPostNav.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    });
  }

  async function deleteNode(node) {
    if (!window.confirm(`Delete “${node.title}” from this browser?`)) return;

    try {
      await graph.deleteNode(node.id);
      window.location.href = "./index.html";
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  function renderPost(node, allNodes) {
    const entry = document.createElement("div");
    entry.className = "node-entry post-entry";

    const card = document.createElement("article");
    card.className = "node-card post-card";

    const body = document.createElement("div");
    body.className = "node-card-body";

    const titleLine = document.createElement("div");
    titleLine.className = "node-title-line";

    const typeLabel = document.createElement("span");
    typeLabel.className = "node-type-label";
    typeLabel.textContent = formatSemanticType(node.type);

    const heading = document.createElement("h2");
    heading.className = "post-title";
    heading.textContent = node.title;

    titleLine.append(typeLabel, heading);
    body.appendChild(titleLine);

    if (node.description) {
      const description = document.createElement("p");
      description.className = "node-description post-description";
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

    const childTabs = renderChildTypeTabs(node, allNodes);
    if (childTabs) entry.appendChild(childTabs);

    elements.postView.replaceChildren(entry);
  }

  async function initialize() {
    try {
      await graph.ready();
      const storage = graph.storageInfo();
      elements.storageCard.classList.add("ready");
      elements.storageStatus.textContent = `${storage.persistence} connected`;
      elements.storageDetail.textContent = `${storage.databaseName} · ${storage.objectStoreName}`;

      const id = new URLSearchParams(window.location.search).get("id");
      if (!id) {
        showMessage("No post was selected. Open a post from the Feed page.", true);
        return;
      }

      const [node, allNodes] = await Promise.all([
        graph.getNode(id),
        graph.listNodes(),
      ]);

      if (!node) {
        showMessage("That post does not exist in this browser's local Graph data.", true);
        return;
      }

      document.title = `${node.title} · Atlas`;
      showSelectedPostInNav(node);
      renderPost(node, allNodes);
    } catch (error) {
      elements.storageCard.classList.add("error");
      elements.storageStatus.textContent = "Local storage unavailable";
      elements.storageDetail.textContent = error.message;
      showMessage(error.message, true);
    }
  }

  initialize();
}
