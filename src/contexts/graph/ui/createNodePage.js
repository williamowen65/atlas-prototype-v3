function commaList(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function addOptionIfMissing(select, value) {
  if (!value) return;
  const exists = Array.from(select.options).some((option) => option.value === value);
  if (!exists) select.add(new Option(value, value, false, false));
}

function relationshipKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function mountCreateNodePage(graph) {
  const elements = {
    storageCard: document.querySelector(".storage-card"),
    storageStatus: document.querySelector("#storage-status"),
    storageDetail: document.querySelector("#storage-detail"),
    pageTitle: document.querySelector("#page-title"),
    pageLede: document.querySelector("#page-lede"),
    form: document.querySelector("#node-form"),
    nodeId: document.querySelector("#node-id"),
    title: document.querySelector("#node-title"),
    titleLabel: document.querySelector("#title-label"),
    semanticTypeField: document.querySelector("#semantic-type-field"),
    type: document.querySelector("#node-type"),
    description: document.querySelector("#node-description"),
    requestedChildTypes: document.querySelector("#node-requested-child-types"),
    affectedLocations: document.querySelector("#node-affected-locations"),
    relationshipFields: document.querySelector("#relationship-fields"),
    relationshipSource: document.querySelector("#relationship-source"),
    relationshipTarget: document.querySelector("#relationship-target"),
    relationshipKeyword: document.querySelector("#relationship-keyword"),
    modePost: document.querySelector("#mode-post"),
    modeRelationship: document.querySelector("#mode-relationship"),
    submit: document.querySelector("#submit-node"),
    message: document.querySelector("#message"),
  };

  const $ = window.jQuery;
  const select2Ready = Boolean($?.fn?.select2);
  const editId = new URLSearchParams(window.location.search).get("id");
  let relationshipMode = false;
  let editingNode = null;
  let allNodes = [];

  if (select2Ready) {
    $(elements.type).select2({
      tags: true,
      width: "100%",
      placeholder: "Choose or enter a semantic type",
      allowClear: true,
    });

    $(elements.requestedChildTypes).select2({
      tags: true,
      width: "100%",
      placeholder: "Choose or enter requested child types",
      closeOnSelect: false,
    });

    $(elements.relationshipSource).select2({
      width: "100%",
      placeholder: "Choose the first post",
      allowClear: true,
    });

    $(elements.relationshipTarget).select2({
      width: "100%",
      placeholder: "Choose the second post",
      allowClear: true,
    });
  }

  function showMessage(text, isError = false) {
    elements.message.textContent = text;
    elements.message.classList.toggle("error", isError);
    elements.message.hidden = false;
  }

  function setTypeValue(value) {
    addOptionIfMissing(elements.type, value);
    if (select2Ready) {
      $(elements.type).val(value || null).trigger("change");
    } else {
      elements.type.value = value ?? "";
    }
  }

  function setRequestedChildTypes(values = []) {
    for (const value of values) addOptionIfMissing(elements.requestedChildTypes, value);

    if (select2Ready) {
      $(elements.requestedChildTypes).val(values).trigger("change");
      return;
    }

    const selected = new Set(values);
    for (const option of elements.requestedChildTypes.options) {
      option.selected = selected.has(option.value);
    }
  }

  function setRelationshipSelect(select, value) {
    if (select2Ready) {
      $(select).val(value || null).trigger("change");
    } else {
      select.value = value ?? "";
    }
  }

  function getRelationshipSelectValue(select) {
    return select2Ready ? ($(select).val() ?? "") : select.value;
  }

  function populateRelationshipParents() {
    const choices = allNodes
      .filter((node) => node.id !== editId && String(node.type).toLowerCase() !== "relationship")
      .sort((a, b) => a.title.localeCompare(b.title));

    for (const select of [elements.relationshipSource, elements.relationshipTarget]) {
      const currentValue = getRelationshipSelectValue(select);
      select.replaceChildren(new Option("", ""));
      for (const node of choices) select.add(new Option(node.title, node.id));
      setRelationshipSelect(select, currentValue);
    }
  }

  function setRelationshipMode(enabled) {
    relationshipMode = enabled;
    elements.relationshipFields.hidden = !enabled;
    elements.semanticTypeField.hidden = enabled;
    elements.modePost.classList.toggle("active", !enabled);
    elements.modeRelationship.classList.toggle("active", enabled);
    elements.modePost.setAttribute("aria-pressed", String(!enabled));
    elements.modeRelationship.setAttribute("aria-pressed", String(enabled));
    elements.titleLabel.textContent = enabled ? "Relationship statement" : "Title";

    if (enabled) {
      setTypeValue("relationship");
      elements.pageTitle.textContent = editingNode ? "Edit Relationship" : "Create Relationship";
      elements.pageLede.textContent = "Connect two existing posts with a named relationship.";
      elements.submit.textContent = editingNode ? "Save relationship" : "Create relationship";
      const requested = select2Ready
        ? ($(elements.requestedChildTypes).val() ?? [])
        : Array.from(elements.requestedChildTypes.selectedOptions, (option) => option.value);
      if (requested.length === 0) {
        setRequestedChildTypes(["challenge", "implementation", "yay", "nay"]);
      }
    } else {
      if (String(select2Ready ? ($(elements.type).val() ?? "") : elements.type.value).toLowerCase() === "relationship") {
        setTypeValue("");
      }
      elements.pageTitle.textContent = editingNode ? "Edit Node" : "Create Node";
      elements.pageLede.textContent = editingNode
        ? "Update this Graph Node through the same Graph context API."
        : "Add a Graph Node through the Graph context API.";
      elements.submit.textContent = editingNode ? "Save changes" : "Create Node";
    }
  }

  function selectedNodeLabel(id) {
    return allNodes.find((node) => node.id === id)?.title ?? "";
  }

  function readForm() {
    const requestedChildTypes = select2Ready
      ? ($(elements.requestedChildTypes).val() ?? [])
      : Array.from(elements.requestedChildTypes.selectedOptions, (option) => option.value);

    const input = {
      title: elements.title.value,
      type: relationshipMode
        ? "relationship"
        : (select2Ready ? ($(elements.type).val() ?? "") : elements.type.value),
      description: elements.description.value,
      requestedChildTypes,
      affectedLocations: elements.affectedLocations.value,
    };

    if (!relationshipMode) return input;

    const sourceId = getRelationshipSelectValue(elements.relationshipSource);
    const targetId = getRelationshipSelectValue(elements.relationshipTarget);
    const relationshipLabel = elements.relationshipKeyword.value.trim();
    const existingMetadata = editingNode?.metadata ?? {};
    const parentsChanged = !editingNode
      || editingNode.parentIds?.[0] !== sourceId
      || editingNode.parentIds?.[1] !== targetId;

    const metadata = {
      ...existingMetadata,
      sourceId,
      sourceLabel: selectedNodeLabel(sourceId),
      targetId,
      targetLabel: selectedNodeLabel(targetId),
      relationshipType: relationshipKey(relationshipLabel),
      relationshipLabel,
    };

    if (!editingNode || existingMetadata.responseTypeByParent || parentsChanged) {
      metadata.responseTypeByParent = {
        [sourceId]: "relationship",
        [targetId]: "relationship",
      };
    }

    return {
      ...input,
      parentIds: [sourceId, targetId],
      metadata,
    };
  }

  async function loadEditNode() {
    if (!editId) return;

    const node = await graph.getNode(editId);
    if (!node) {
      elements.pageTitle.textContent = "Node not found";
      elements.pageLede.textContent = "The Node you tried to edit is no longer stored in this browser.";
      elements.form.hidden = true;
      return;
    }

    editingNode = node;
    elements.nodeId.value = node.id;
    elements.title.value = node.title;
    elements.description.value = node.description ?? "";
    setRequestedChildTypes(node.requestedChildTypes ?? []);
    elements.affectedLocations.value = commaList(node.affectedLocations);

    if (String(node.type).toLowerCase() === "relationship") {
      setRelationshipMode(true);
      const sourceId = node.metadata?.sourceId ?? node.parentIds?.[0] ?? "";
      const targetId = node.metadata?.targetId ?? node.parentIds?.[1] ?? "";
      setRelationshipSelect(elements.relationshipSource, sourceId);
      setRelationshipSelect(elements.relationshipTarget, targetId);
      elements.relationshipKeyword.value = node.metadata?.relationshipLabel
        ?? node.metadata?.relationshipType
        ?? "";
      elements.modePost.disabled = true;
      elements.modePost.title = "Relationship Nodes stay in relationship mode.";
    } else {
      setTypeValue(node.type);
      setRelationshipMode(false);
    }
  }

  elements.modePost.addEventListener("click", () => {
    if (!elements.modePost.disabled) setRelationshipMode(false);
  });
  elements.modeRelationship.addEventListener("click", () => setRelationshipMode(true));

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = readForm();
    if (input.requestedChildTypes.length === 0) {
      showMessage("Request at least one kind of feedback before saving this post.", true);
      if (select2Ready) $(elements.requestedChildTypes).select2("open");
      else elements.requestedChildTypes.focus();
      return;
    }

    if (relationshipMode) {
      const [sourceId, targetId] = input.parentIds;
      if (!sourceId || !targetId) {
        showMessage("Choose both posts that this relationship connects.", true);
        return;
      }
      if (sourceId === targetId) {
        showMessage("A relationship must connect two different posts.", true);
        return;
      }
      if (!input.metadata.relationshipType) {
        showMessage("Enter a short relationship keyword, such as ‘helps address’ or ‘implemented by’.", true);
        elements.relationshipKeyword.focus();
        return;
      }
    }

    elements.submit.disabled = true;

    try {
      const id = elements.nodeId.value;
      if (id) await graph.updateNode(id, input);
      else await graph.createNode(input);
      window.location.href = "./index.html";
    } catch (error) {
      showMessage(error.message, true);
      elements.submit.disabled = false;
    }
  });

  async function initialize() {
    try {
      await graph.ready();
      const storage = graph.storageInfo();
      elements.storageCard.classList.add("ready");
      elements.storageStatus.textContent = `${storage.persistence} connected`;
      elements.storageDetail.textContent = `${storage.databaseName} · ${storage.objectStoreName}`;
      allNodes = await graph.listNodes();
      populateRelationshipParents();
      await loadEditNode();
    } catch (error) {
      elements.storageCard.classList.add("error");
      elements.storageStatus.textContent = "Local storage unavailable";
      elements.storageDetail.textContent = error.message;
      showMessage(error.message, true);
    }
  }

  initialize();
}
