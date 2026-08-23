import { createNodeRecord, normalizeNodeInput, updateNodeRecord } from "../domain/node.js";

export class GraphService {
  constructor(nodeRepository) {
    this.nodeRepository = nodeRepository;
  }

  async ready() {
    await this.nodeRepository.ready();
  }

  listNodes() {
    return this.nodeRepository.list();
  }

  getNode(id) {
    return this.nodeRepository.get(id);
  }

  async createNode(input) {
    const node = createNodeRecord(input);
    return this.nodeRepository.save(node);
  }

  async updateNode(id, input) {
    const existingNode = await this.nodeRepository.get(id);
    if (!existingNode) {
      throw new Error(`Node ${id} no longer exists.`);
    }

    return this.nodeRepository.save(updateNodeRecord(existingNode, input));
  }

  deleteNode(id) {
    return this.nodeRepository.delete(id);
  }

  clearNodes() {
    return this.nodeRepository.clear();
  }

  async importNodes(nodes) {
    if (!Array.isArray(nodes)) {
      throw new Error("Fixture data must be an array of Nodes.");
    }

    const imported = [];
    for (const input of nodes) {
      const timestamp = new Date().toISOString();
      const node = {
        id: input.id || crypto.randomUUID(),
        ...normalizeNodeInput(input),
        createdAt: input.createdAt || timestamp,
        updatedAt: timestamp,
      };
      await this.nodeRepository.save(node);
      imported.push(node);
    }

    return imported;
  }

  storageInfo() {
    return this.nodeRepository.storageInfo();
  }
}
