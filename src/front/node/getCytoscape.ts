import type { NodeResultType } from "../../back/read/getNode";

type CytoscapeNode = {
  id: string;
  label: string;
};

type CytoscapeEdge = {
  id: string;
  source: string;
  target: string;
};

const getEdges = ({
  parentIds,
  childrenId,
}: {
  parentIds: string[];
  childrenId: string;
}): CytoscapeEdge[] =>
  parentIds.map((parentId) => ({
    id: `${parentId}-${childrenId}`,
    source: parentId,
    target: childrenId,
  }));

const getCytoscape = ({ node, parents, children }: NodeResultType) => {
  const targetNodeName = node.nodeNameStringWithLanguageCode;
  const targetParents = node.parentNamesWithLanguageCode;

  const childrenNodes: CytoscapeNode[] = children.map(
    ({ nodeNameStringWithLanguageCode }) => ({
      id: nodeNameStringWithLanguageCode,
      label: nodeNameStringWithLanguageCode,
    })
  );
  const parentNodes: CytoscapeNode[] = parents.map(
    ({ nodeNameStringWithLanguageCode }) => ({
      id: nodeNameStringWithLanguageCode,
      label: nodeNameStringWithLanguageCode,
    })
  );

  const targetEdges = getEdges({
    parentIds: targetParents,
    childrenId: targetNodeName,
  });
  const childrenEdges = children
    .map(({ nodeNameStringWithLanguageCode, parentNamesWithLanguageCode }) => {
      return getEdges({
        parentIds: parentNamesWithLanguageCode,
        childrenId: nodeNameStringWithLanguageCode,
      });
    })
    .flat();
  const parentEdges = parents
    .map(({ nodeNameStringWithLanguageCode, parentNamesWithLanguageCode }) => {
      return getEdges({
        parentIds: parentNamesWithLanguageCode,
        childrenId: nodeNameStringWithLanguageCode,
      });
    })
    .flat();

  const nodes: CytoscapeNode[] = [
    { id: targetNodeName, label: targetNodeName },
    ...childrenNodes,
    ...parentNodes,
  ];
  const nodesNamesSet = new Set(nodes.map((nodeItem) => nodeItem.id));

  const edges: CytoscapeEdge[] = [
    ...targetEdges,
    ...childrenEdges,
    ...parentEdges,
  ].filter(
    (edgeItem) =>
      nodesNamesSet.has(edgeItem.source) && nodesNamesSet.has(edgeItem.target)
  );

  const nodeElements = nodes.map((nodeItem) => ({ data: { ...nodeItem } }));
  const edgeElements = edges.map((edgeItem) => ({ data: { ...edgeItem } }));

  return [...nodeElements, ...edgeElements];
};

export default getCytoscape;
