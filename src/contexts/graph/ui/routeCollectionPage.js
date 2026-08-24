import {
  aggregateWeight,
  postHrefForPath,
  rootsFor,
} from "../application/hierarchyProjection.js";

const EARTHY_GRADIENTS = [
  ["#6f8f7a", "#a7b89f"],
  ["#83956f", "#c0b88f"],
  ["#8b8069", "#c6ad7d"],
  ["#658a7a", "#9eb5a9"],
  ["#728f91", "#a9bbba"],
  ["#7e8875", "#b7b49a"],
];

function formatAverage(value) {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number.toFixed(1) : "0.0";
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
      tspan = textSelection.append("tspan")
        .attr("x", 0)
        .attr("dy", `${lineHeight}em`)
        .text(word);
    }
  }

  return lineNumber + 1;
}

function ensureGradientDefs(svg) {
  const defs = svg.append("defs");
  EARTHY_GRADIENTS.forEach((stops, index) => {
    const gradient = defs.append("linearGradient")
      .attr("id", `atlas-home-gradient-${index + 1}`)
      .attr("x1", index % 2 ? "0%" : "8%")
      .attr("y1", "0%")
      .attr("x2", index % 2 ? "100%" : "92%")
      .attr("y2", "100%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", stops[0]);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", stops[1]);
  });
}

function renderRootLayer(host, roots, allNodes, zoomState) {
  host.replaceChildren();

  if (!roots.length) {
    const empty = document.createElement("div");
    empty.className = "hierarchy-empty-layer";
    empty.innerHTML = `No root routes yet. <a href="./feed.html">Open the Feed</a> to load sample data or create content.`;
    host.appendChild(empty);
    return;
  }

  const d3 = window.d3;
  if (!d3?.voronoiTreemap || !d3?.zoom) {
    const error = document.createElement("div");
    error.className = "hierarchy-empty-layer";
    error.textContent = "The D3 route renderer could not be loaded.";
    host.appendChild(error);
    return;
  }

  const rect = host.getBoundingClientRect();
  const width = Math.max(280, Math.round(rect.width || window.innerWidth || 720));
  const height = Math.max(320, Math.round(rect.height || Math.min(window.innerHeight * 0.62, 620)));
  const proxies = roots.map((item) => ({ item, weight: aggregateWeight(item.id, allNodes) }));
  const root = d3.hierarchy({ children: proxies }).sum((entry) => entry.weight || 0);
  const polygon = [[0, 0], [width, 0], [width, height], [0, height]];
  const seed = roots.reduce((sum, item) => {
    for (const char of item.id) sum = ((sum * 31) + char.charCodeAt(0)) >>> 0;
    return sum;
  }, 2166136261) / 4294967296;

  d3.voronoiTreemap()
    .clip(polygon)
    .prng(d3.randomLcg(seed || 0.42))(root);

  const svg = d3.select(host)
    .append("svg")
    .attr("class", "hierarchy-svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", width)
    .attr("height", height)
    .attr("role", "group")
    .attr("aria-label", "Atlas route collection. Drag to pan, pinch or wheel to zoom, and select a route to explore it.");

  ensureGradientDefs(svg);
  const content = svg.append("g").attr("class", "hierarchy-layer-content");

  const cells = content.selectAll("g.hierarchy-cell")
    .data(root.leaves(), (leaf) => leaf.data.item.id)
    .join("g")
    .attr("class", "hierarchy-cell")
    .attr("tabindex", 0)
    .attr("role", "link")
    .attr("aria-label", (leaf) => leaf.data.item.title)
    .on("click", (_, leaf) => {
      window.location.href = postHrefForPath([leaf.data.item]);
    })
    .on("keydown", (event, leaf) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        window.location.href = postHrefForPath([leaf.data.item]);
      }
    });

  cells.append("path")
    .attr("class", "hierarchy-cell-shape")
    .attr("d", (leaf) => `M${leaf.polygon.map((point) => point.join(",")).join("L")}Z`)
    .attr("fill", (_, index) => `url(#atlas-home-gradient-${(index % EARTHY_GRADIENTS.length) + 1})`);

  cells.each(function drawLabel(leaf) {
    const item = leaf.data.item;
    const area = Math.abs(d3.polygonArea(leaf.polygon));
    if (area < 1500) return;

    const [cx, cy] = d3.polygonCentroid(leaf.polygon);
    const fontSize = Math.max(12, Math.min(22, Math.sqrt(area) / 8.2));
    const maxWidth = Math.max(90, Math.min(width * 0.42, Math.sqrt(area) * 1.7));
    const group = d3.select(this).append("g")
      .attr("class", "hierarchy-cell-label")
      .attr("transform", `translate(${cx},${cy - fontSize})`)
      .style("pointer-events", "none")
      .attr("text-anchor", "middle");

    const title = group.append("text")
      .attr("class", "hierarchy-cell-title")
      .style("font-size", `${fontSize}px`)
      .attr("fill", "#1b2823");
    const lines = wrapSvgText(title, item.title, maxWidth, area < 5000 ? 3 : 5);

    group.append("text")
      .attr("class", "hierarchy-cell-meta")
      .attr("y", fontSize * (lines * 1.08 + 0.55))
      .attr("fill", "#394940")
      .style("font-size", `${Math.max(9, fontSize * 0.62)}px`)
      .text(`${Number(item.votes ?? 0) || 0} votes · avg ${formatAverage(item.average)}`);
  });

  const zoom = d3.zoom()
    .scaleExtent([1, 6])
    .extent([[0, 0], [width, height]])
    .translateExtent([[0, 0], [width, height]])
    .clickDistance(6)
    .on("start", () => host.classList.add("is-interacting"))
    .on("zoom", (event) => {
      content.attr("transform", event.transform);
      zoomState.transform = event.transform;
    })
    .on("end", () => host.classList.remove("is-interacting"));

  svg.call(zoom).on("dblclick.zoom", null);
  if (zoomState.transform) svg.call(zoom.transform, zoomState.transform);
}

export async function mountRouteCollectionPage(graph, { host, showMessage }) {
  const zoomState = { transform: null };
  let nodes = [];
  let resizeTimer;

  function render() {
    const roots = rootsFor(nodes).filter(
      (node) => String(node.type ?? "").trim().toLowerCase() !== "relationship",
    );
    requestAnimationFrame(() => renderRootLayer(host, roots, nodes, zoomState));
  }

  try {
    await graph.ready();
    nodes = await graph.listNodes();
    render();
  } catch (error) {
    showMessage(error.message, true);
  }

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 120);
  });
}
