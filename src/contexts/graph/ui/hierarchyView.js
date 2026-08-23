import {
  aggregateWeight,
  childTypeSummaries,
  childrenFor,
  defaultPathForNode,
  postHrefForPath,
  resolvePathIds,
  rootsFor,
} from "../application/hierarchyProjection.js";

function formatAverage(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number.toFixed(1) : "0.0";
}

function pluralizeType(type, count) {
  const value = String(type ?? "").trim();
  if (!value || count === 1) return value;
  if (value.toLowerCase() === "evidence") return value;
  if (/[^aeiou]y$/i.test(value)) return `${value.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(value)) return `${value}es`;
  return `${value}s`;
}

function typeColor(type) {
  const palette = {
    issue: "#7da9b7",
    solution: "#4d94a8",
    question: "#b5a5c4",
    answer: "#9db7a4",
    challenge: "#c58c7d",
    implementation: "#d59b39",
    yay: "#8eae86",
    nay: "#b78b9d",
    relationship: "#8e9eae",
    evidence: "#9fa6c6",
  };
  return palette[String(type ?? "").toLowerCase()] ?? "#9aabba";
}

function makeIconButton(label, pathData, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `node-icon-button ${className}`.trim();
  button.setAttribute("aria-label", label);
  button.title = label;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
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

function parseIncomingPath(nodes, selectedId) {
  const params = new URLSearchParams(window.location.search);
  const serialized = params.get("path");
  if (serialized) {
    const ids = serialized.split("/").filter(Boolean).map((part) => {
      try { return decodeURIComponent(part); } catch (_) { return part; }
    });
    const resolved = resolvePathIds(ids, selectedId, nodes);
    if (resolved) return resolved;
  }
  return defaultPathForNode(selectedId, nodes);
}

function chooseChildType(node, nodes, preferred = null) {
  const summaries = childTypeSummaries(node, nodes);
  if (!summaries.length) return null;
  if (preferred && summaries.some((item) => item.type.toLowerCase() === preferred.toLowerCase())) {
    return summaries.find((item) => item.type.toLowerCase() === preferred.toLowerCase()).type;
  }
  const withChildren = summaries.find((item) => item.count > 0);
  return (withChildren ?? summaries[0]).type;
}

function wrapSvgText(textSelection, text, maxWidth, maxLines = 4) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lineHeight = 1.08;
  let line = [];
  let lineNumber = 0;
  let tspan = textSelection.append("tspan").attr("x", 0).attr("dy", "0em");

  for (const word of words) {
    line.push(word);
    tspan.text(line.join(" "));
    if (tspan.node().getComputedTextLength() > maxWidth && line.length > 1) {
      line.pop();
      tspan.text(line.join(" "));
      line = [word];
      lineNumber += 1;
      if (lineNumber >= maxLines) {
        const current = tspan.text();
        tspan.text(current.length > 2 ? `${current.replace(/[\s,.]+$/, "")}…` : current);
        return lineNumber + 1;
      }
      tspan = textSelection.append("tspan").attr("x", 0).attr("dy", `${lineHeight}em`).text(word);
    }
  }
  return lineNumber + 1;
}

function renderVoronoiLayer(host, items, nodes, selectedId, onSelect) {
  host.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "hierarchy-empty-layer";
    empty.textContent = "No posts in this child type yet.";
    host.appendChild(empty);
    return;
  }

  const d3 = window.d3;
  if (!d3?.voronoiTreemap) {
    const error = document.createElement("div");
    error.className = "hierarchy-empty-layer";
    error.textContent = "The D3 hierarchy renderer could not be loaded.";
    host.appendChild(error);
    return;
  }

  const width = Math.max(320, host.clientWidth || 720);
  const height = window.matchMedia("(max-width: 620px)").matches ? 280 : 340;
  const proxies = items.map((item) => ({ item, weight: aggregateWeight(item.id, nodes) }));
  const root = d3.hierarchy({ children: proxies }).sum((entry) => entry.weight || 0);
  const polygon = [[0, 0], [width, 0], [width, height], [0, height]];
  const seed = items.reduce((sum, item) => {
    for (const char of item.id) sum = ((sum * 31) + char.charCodeAt(0)) >>> 0;
    return sum;
  }, 2166136261) / 4294967296;

  d3.voronoiTreemap().clip(polygon).prng(d3.randomLcg(seed || 0.42))(root);

  const svg = d3.select(host)
    .append("svg")
    .attr("class", "hierarchy-svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "group")
    .attr("aria-label", "Graph hierarchy layer");

  const cells = svg.selectAll("g.hierarchy-cell")
    .data(root.leaves(), (leaf) => leaf.data.item.id)
    .join("g")
    .attr("class", (leaf) => `hierarchy-cell ${leaf.data.item.id === selectedId ? "is-selected" : ""}`)
    .attr("tabindex", 0)
    .attr("role", "link")
    .attr("aria-label", (leaf) => leaf.data.item.title)
    .on("click", (_, leaf) => onSelect(leaf.data.item))
    .on("keydown", (event, leaf) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(leaf.data.item);
      }
    });

  cells.append("path")
    .attr("class", "hierarchy-cell-shape")
    .attr("d", (leaf) => `M${leaf.polygon.map((point) => point.join(",")).join("L")}Z`)
    .attr("fill", (leaf) => leaf.data.item.id === selectedId ? "#263447" : typeColor(leaf.data.item.type));

  cells.each(function drawLabel(leaf) {
    const item = leaf.data.item;
    const area = Math.abs(d3.polygonArea(leaf.polygon));
    if (area < 1600) return;
    const [cx, cy] = d3.polygonCentroid(leaf.polygon);
    const fontSize = Math.max(10, Math.min(17, Math.sqrt(area) / 8.6));
    const maxWidth = Math.max(70, Math.min(width * 0.32, Math.sqrt(area) * 1.55));
    const group = d3.select(this).append("g")
      .attr("class", "hierarchy-cell-label")
      .attr("transform", `translate(${cx},${cy - fontSize * 0.9})`)
      .style("pointer-events", "none")
      .attr("text-anchor", "middle");

    const title = group.append("text")
      .attr("class", "hierarchy-cell-title")
      .style("font-size", `${fontSize}px`)
      .attr("fill", item.id === selectedId ? "#fff" : "#17202e");
    const lines = wrapSvgText(title, item.title, maxWidth, area < 4200 ? 2 : 4);

    group.append("text")
      .attr("class", "hierarchy-cell-meta")
      .attr("y", fontSize * (lines * 1.08 + 0.5))
      .attr("fill", item.id === selectedId ? "rgba(255,255,255,.82)" : "rgba(23,32,46,.72)")
      .style("font-size", `${Math.max(9, fontSize * 0.68)}px`)
      .text(`${Number(item.votes ?? 0) || 0} votes · avg ${formatAverage(item.average)}`);
  });
}

function renderBreadcrumb(route, onNavigate) {
  const nav = document.createElement("nav");
  nav.className = "hierarchy-breadcrumb";
  nav.setAttribute("aria-label", "Parent hierarchy");

  const feed = document.createElement("a");
  feed.href = "./index.html";
  feed.textContent = "Feed";
  nav.appendChild(feed);

  route.forEach((node, index) => {
    const separator = document.createElement("span");
    separator.className = "hierarchy-breadcrumb-separator";
    separator.textContent = "›";
    nav.appendChild(separator);

    const link = document.createElement("a");
    const path = route.slice(0, index + 1);
    link.href = postHrefForPath(path);
    link.textContent = node.title;
    if (index === route.length - 1) {
      link.className = "current";
      link.setAttribute("aria-current", "page");
    }
    link.addEventListener("click", (event) => {
      event.preventDefault();
      onNavigate(path, null, true);
    });
    nav.appendChild(link);
  });
  return nav;
}

function renderContextCard(node, nodes, isCurrent, actions) {
  const card = document.createElement("article");
  card.className = `node-card hierarchy-context-card ${isCurrent ? "is-current" : "is-ancestor"}`;
  card.id = `context-${node.id}`;

  const body = document.createElement("div");
  body.className = "node-card-body";

  if (isCurrent) {
    const actionHost = document.createElement("div");
    actionHost.className = "node-actions";
    const edit = makeIconButton(`Edit ${node.title}`, "M12 20h9 M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z", "node-icon-button-edit");
    edit.addEventListener("click", () => { window.location.href = `./create.html?id=${encodeURIComponent(node.id)}`; });
    const remove = makeIconButton(`Delete ${node.title}`, "M3 6h18 M8 6V4h8v2 M19 6l-1 14H6L5 6 M10 11v5 M14 11v5", "node-icon-button-delete");
    remove.addEventListener("click", () => actions.onDelete(node));
    actionHost.append(edit, remove);
    body.appendChild(actionHost);
  }

  const titleLine = document.createElement("div");
  titleLine.className = "node-title-line";
  const type = document.createElement("span");
  type.className = "node-type-label";
  type.textContent = String(node.type ?? "").toUpperCase();
  const title = document.createElement(isCurrent ? "h2" : "h3");
  title.className = isCurrent ? "post-title" : "hierarchy-ancestor-title";
  title.textContent = node.title;
  titleLine.append(type, title);
  body.appendChild(titleLine);

  if (node.description) {
    const description = document.createElement("p");
    description.className = `node-description ${isCurrent ? "post-description" : "hierarchy-ancestor-description"}`;
    description.textContent = node.description;
    body.appendChild(description);
  }

  const stats = document.createElement("div");
  stats.className = "node-stats";
  const votes = document.createElement("span");
  votes.innerHTML = `<strong>${Number(node.votes ?? 0) || 0}</strong> votes`;
  const average = document.createElement("span");
  average.innerHTML = `<strong>${formatAverage(node.average)}</strong> avg`;
  stats.append(votes, average);
  body.appendChild(stats);

  if ((node.affectedLocations ?? []).length) {
    const locations = document.createElement("div");
    locations.className = "node-meta";
    for (const location of node.affectedLocations) {
      const pill = document.createElement("span");
      pill.className = "pill location";
      pill.textContent = location;
      locations.appendChild(pill);
    }
    body.appendChild(locations);
  }

  card.appendChild(body);
  return card;
}

function renderToggle(node, nodes, selectedType, onSelectType) {
  const summaries = childTypeSummaries(node, nodes);
  if (!summaries.length) return null;
  const toggle = document.createElement("div");
  toggle.className = "hierarchy-child-toggle";
  toggle.setAttribute("role", "group");
  toggle.setAttribute("aria-label", `Child types for ${node.title}`);

  for (const summary of summaries) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hierarchy-child-toggle-button";
    if (summary.type.toLowerCase() === String(selectedType ?? "").toLowerCase()) button.classList.add("is-active");
    if (summary.requested) button.classList.add("is-requested");
    button.textContent = `${summary.count} ${pluralizeType(summary.type, summary.count)}`;
    button.addEventListener("click", () => onSelectType(summary.type));
    toggle.appendChild(button);
  }
  return toggle;
}

export function mountHierarchyExplorer(graph, { host, selectedPostNav, showMessage }) {
  let nodes = [];
  let route = [];
  let selectedChildType = null;
  let resizeTimer;

  function currentNode() {
    return route[route.length - 1] ?? null;
  }

  function syncSelectedNav() {
    const node = currentNode();
    if (!selectedPostNav || !node) return;
    selectedPostNav.textContent = node.title;
    selectedPostNav.title = node.title;
    selectedPostNav.hidden = false;
  }

  function updateUrl(path, childType, push = false) {
    const url = new URL(postHrefForPath(path, childType), window.location.href);
    history[push ? "pushState" : "replaceState"]({}, "", url);
  }

  function scrollToCurrent(animate = true) {
    const node = currentNode();
    if (!node) return;
    requestAnimationFrame(() => {
      document.querySelector(`#context-${CSS.escape(node.id)}`)?.scrollIntoView({
        behavior: animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto",
        block: "start",
      });
    });
  }

  function navigateTo(path, childType = null, push = true) {
    route = path;
    const node = currentNode();
    selectedChildType = chooseChildType(node, nodes, childType);
    updateUrl(route, selectedChildType, push);
    document.title = `${node.title} · Atlas`;
    syncSelectedNav();
    render();
    scrollToCurrent(true);
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

  function renderLayerBlock(items, selectedId, label, onSelect) {
    const block = document.createElement("section");
    block.className = "hierarchy-layer-block";
    const heading = document.createElement("div");
    heading.className = "hierarchy-layer-heading";
    heading.textContent = label;
    const viz = document.createElement("div");
    viz.className = "hierarchy-voronoi-layer";
    block.append(heading, viz);
    requestAnimationFrame(() => renderVoronoiLayer(viz, items, nodes, selectedId, onSelect));
    return block;
  }

  function render() {
    host.replaceChildren();
    if (!route.length) return;
    host.appendChild(renderBreadcrumb(route, navigateTo));

    route.forEach((node, depth) => {
      const parent = depth > 0 ? route[depth - 1] : null;
      const siblings = parent ? childrenFor(parent.id, nodes) : rootsFor(nodes);
      const layerLabel = depth === 0 ? "Root posts" : `${parent.title} · children`;
      const pathBefore = route.slice(0, depth);

      host.appendChild(renderLayerBlock(siblings, node.id, layerLabel, (selected) => {
        const nextPath = [...pathBefore, selected];
        navigateTo(nextPath, null, true);
      }));

      const isCurrent = depth === route.length - 1;
      const card = renderContextCard(node, nodes, isCurrent, { onDelete: deleteNode });
      host.appendChild(card);

      const routeNext = route[depth + 1];
      const preferred = routeNext?.type ?? (isCurrent ? selectedChildType : null);
      const mode = chooseChildType(node, nodes, preferred);
      const toggle = renderToggle(node, nodes, mode, (type) => {
        if (!isCurrent) {
          navigateTo(route.slice(0, depth + 1), type, true);
          return;
        }
        selectedChildType = type;
        updateUrl(route, selectedChildType, false);
        render();
        scrollToCurrent(false);
      });
      if (toggle) host.appendChild(toggle);
    });

    const selected = currentNode();
    const children = childrenFor(selected.id, nodes);
    const filteredChildren = selectedChildType
      ? children.filter((child) => child.type.toLowerCase() === selectedChildType.toLowerCase())
      : children;
    const label = selectedChildType
      ? `${selected.title} · ${pluralizeType(selectedChildType, filteredChildren.length)}`
      : `${selected.title} · children`;

    host.appendChild(renderLayerBlock(filteredChildren, null, label, (child) => {
      navigateTo([...route, child], null, true);
    }));
  }

  async function initialize() {
    nodes = await graph.listNodes();
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get("id");
    if (!selectedId) throw new Error("No post was selected. Open a post from the Feed page.");

    const selected = nodes.find((node) => node.id === selectedId);
    if (!selected) throw new Error("That post does not exist in this browser's local Graph data.");

    route = parseIncomingPath(nodes, selectedId);
    if (!route.length) route = [selected];
    selectedChildType = chooseChildType(selected, nodes, params.get("childType"));
    updateUrl(route, selectedChildType, false);
    document.title = `${selected.title} · Atlas`;
    syncSelectedNav();
    render();
    scrollToCurrent(false);
  }

  window.addEventListener("popstate", () => {
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get("id");
    if (!selectedId) return;
    const nextRoute = parseIncomingPath(nodes, selectedId);
    if (!nextRoute.length) return;
    route = nextRoute;
    selectedChildType = chooseChildType(currentNode(), nodes, params.get("childType"));
    syncSelectedNav();
    render();
    scrollToCurrent(false);
  });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 120);
  });

  return initialize();
}
