import type { GraphNodeType } from "./buildGraph";

type GetParentsTreeParams = {
  nodeNameWithLanguageCode: string;
  includeTarget: boolean;
  searchType: "oneLevelUp" | "all";
  graphData: GraphNodeType[];
};

/** get parents tree. Includes the target node in the returned array */
const getParentsTree = ({
  nodeNameWithLanguageCode,
  includeTarget,
  searchType,
  graphData: graphData2,
}: GetParentsTreeParams) => {
  const nodeIndexMap: Record<string, number> = {};
  graphData2.forEach((nodeItem, index) => {
    nodeIndexMap[nodeItem.nodeNameStringWithLanguageCode] = index;
  });

  const targetNodeInfo: GraphNodeType =
    graphData2[nodeIndexMap[nodeNameWithLanguageCode]];

  const nodes: GraphNodeType[] = includeTarget ? [targetNodeInfo] : [];
  const parentNames = [...targetNodeInfo.parentNamesWithLanguageCode]; // duplicate as otherwise we include all in the target node parents
  for (let i = 0; i < parentNames.length; i++) {
    const parentNameWithLanguageCode = parentNames[i];
    const parentIndex = nodeIndexMap[parentNameWithLanguageCode];

    const parentInfo: GraphNodeType = graphData2[parentIndex];
    nodes.push(parentInfo);

    parentInfo.parentNamesWithLanguageCode.forEach((parentName) => {
      if (!parentNames.includes(parentName) && searchType === "all") {
        parentNames.push(parentName);
      }
    });
  }

  return nodes;
};
export default getParentsTree;
