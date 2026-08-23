const DATABASE_NAME = "atlas-prototype-v3";
const DATABASE_VERSION = 1;
const NODE_STORE = "graphNodes";

function requestAsPromise(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result), { once: true });
    request.addEventListener("error", () => reject(request.error), { once: true });
  });
}

function transactionAsPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.addEventListener("complete", () => resolve(), { once: true });
    transaction.addEventListener("error", () => reject(transaction.error), { once: true });
    transaction.addEventListener("abort", () => reject(transaction.error ?? new Error("IndexedDB transaction aborted.")), { once: true });
  });
}

export class IndexedDbNodeRepository {
  #databasePromise;

  constructor() {
    this.#databasePromise = this.#openDatabase();
  }

  async #openDatabase() {
    if (!("indexedDB" in globalThis)) {
      throw new Error("IndexedDB is not available in this browser.");
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

      request.addEventListener("upgradeneeded", () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(NODE_STORE)) {
          const store = database.createObjectStore(NODE_STORE, { keyPath: "id" });
          store.createIndex("type", "type", { unique: false });
          store.createIndex("title", "title", { unique: false });
        }
      });

      request.addEventListener("success", () => resolve(request.result), { once: true });
      request.addEventListener("error", () => reject(request.error), { once: true });
    });
  }

  async ready() {
    await this.#databasePromise;
  }

  async list() {
    const database = await this.#databasePromise;
    const transaction = database.transaction(NODE_STORE, "readonly");
    const request = transaction.objectStore(NODE_STORE).getAll();
    const nodes = await requestAsPromise(request);
    await transactionAsPromise(transaction);
    return nodes.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
  }

  async get(id) {
    const database = await this.#databasePromise;
    const transaction = database.transaction(NODE_STORE, "readonly");
    const request = transaction.objectStore(NODE_STORE).get(id);
    const node = await requestAsPromise(request);
    await transactionAsPromise(transaction);
    return node ?? null;
  }

  async save(node) {
    const database = await this.#databasePromise;
    const transaction = database.transaction(NODE_STORE, "readwrite");
    transaction.objectStore(NODE_STORE).put(node);
    await transactionAsPromise(transaction);
    return node;
  }

  async delete(id) {
    const database = await this.#databasePromise;
    const transaction = database.transaction(NODE_STORE, "readwrite");
    transaction.objectStore(NODE_STORE).delete(id);
    await transactionAsPromise(transaction);
  }

  async clear() {
    const database = await this.#databasePromise;
    const transaction = database.transaction(NODE_STORE, "readwrite");
    transaction.objectStore(NODE_STORE).clear();
    await transactionAsPromise(transaction);
  }

  storageInfo() {
    return {
      databaseName: DATABASE_NAME,
      objectStoreName: NODE_STORE,
      databaseVersion: DATABASE_VERSION,
      persistence: "IndexedDB",
    };
  }
}
