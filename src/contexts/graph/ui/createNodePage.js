function commaList(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function addOptionIfMissing(select, value) {
  if (!value) return;
  const exists = Array.from(select.options).some((option) => option.value === value);
  if (!exists) select.add(new Option(value, value, false, false));
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
    type: document.querySelector("#node-type"),
    description: document.querySelector("#node-description"),
    requestedChildTypes: document.querySelector("#node-requested-child-types"),
    affectedLocations: document.querySelector("#node-affected-locations"),
    submit: document.querySelector("#submit-node"),
    message: document.querySelector("#message"),
  };

  const $ = window.jQuery;
  const select2Ready = Boolean($?.fn?.select2);
  const editId = new URLSearchParams(window.location.search).get("id");

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

  function readForm() {
    return {
      title: elements.title.value,
      type: select2Ready ? ($(elements.type).val() ?? "") : elements.type.value,
      description: elements.description.value,
      requestedChildTypes: select2Ready
        ? ($(elements.requestedChildTypes).val() ?? [])
        : Array.from(elements.requestedChildTypes.selectedOptions, (option) => option.value),
      affectedLocations: elements.affectedLocations.value,
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

    elements.nodeId.value = node.id;
    elements.title.value = node.title;
    setTypeValue(node.type);
    elements.description.value = node.description ?? "";
    setRequestedChildTypes(node.requestedChildTypes ?? []);
    elements.affectedLocations.value = commaList(node.affectedLocations);
    elements.pageTitle.textContent = "Edit Node";
    elements.pageLede.textContent = "Update this Graph Node through the same Graph context API.";
    elements.submit.textContent = "Save changes";
  }

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = readForm();
    if (input.requestedChildTypes.length === 0) {
      showMessage("Request at least one kind of feedback before saving this post.", true);
      if (select2Ready) {
        $(elements.requestedChildTypes).select2("open");
      } else {
        elements.requestedChildTypes.focus();
      }
      return;
    }

    elements.submit.disabled = true;

    try {
      const id = elements.nodeId.value;
      if (id) {
        await graph.updateNode(id, input);
      } else {
        await graph.createNode(input);
      }
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
