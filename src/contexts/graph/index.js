import { GraphService } from "./application/graphService.js";
import { IndexedDbNodeRepository } from "./infrastructure/indexedDbNodeRepository.js";

export function createGraphContext() {
  const nodeRepository = new IndexedDbNodeRepository();
  const service = new GraphService(nodeRepository);

  return {
    ready: () => service.ready(),
    listNodes: () => service.listNodes(),
    getNode: (id) => service.getNode(id),
    createNode: (input) => service.createNode(input),
    updateNode: (id, input) => service.updateNode(id, input),
    deleteNode: (id) => service.deleteNode(id),
    clearNodes: () => service.clearNodes(),
    importNodes: (nodes) => service.importNodes(nodes),
    storageInfo: () => service.storageInfo(),
  };
}
