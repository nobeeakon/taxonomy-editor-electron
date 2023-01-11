import fs from "fs";

import type { GraphNodeType } from "./graph/buildGraph";
import getChildrenTree from "./graph/getChildrenTree";
import getParentsTree from "./graph/getParentsTree";
import { getTaxonomyGraphFilePath } from "../utils";

type NodeNameWithLanguageCodeType = `${string}:${string}`;

type NodeResultType = {
  node: GraphNodeType;
  parents: GraphNodeType[];
  children: GraphNodeType[];
};

//TODO download file if needed
// TODO add other checks: how old or retry if needed, etc.
// TODO do async and return Promise.reject() if something went wrong
type GetNodeArgs = {
  nodeName: NodeNameWithLanguageCodeType;
};

const getNode = async ({ nodeName }: GetNodeArgs) => {
  const graphFilePath = getTaxonomyGraphFilePath();

  if (!fs.existsSync(graphFilePath)) {
    throw Promise.reject(new Error(`Unable to find  graph file`));
  }

  let graphData: GraphNodeType[] = [];
  try {
    graphData = JSON.parse(
      fs.readFileSync(graphFilePath).toString()
    ) as GraphNodeType[];
  } catch (error) {
    throw Promise.reject(
      new Error(`Unable to read the graph file, please try again`)
    );
  }

  if (!graphData || graphData.length === 0)
    throw Promise.reject(`No data in the taxonomy, please check`);

  // some times the nodes are duplicated in the file
  const targetNodes: GraphNodeType[] = [];

  graphData.forEach((nodeItem) => {
    if (nodeItem.nodeNameStringWithLanguageCode === nodeName) {
      targetNodes.push(nodeItem);
    }
  });

  const results: NodeResultType[] = [];

  targetNodes.forEach((targetNodeItem) => {
    const { nodeNameStringWithLanguageCode } = targetNodeItem;
    const targetParents = getParentsTree({
      nodeNameWithLanguageCode: nodeNameStringWithLanguageCode,
      includeTarget: false,
      searchType: "all",
      graphData,
    });
    const targetChildren = getChildrenTree({
      nodeNameWithLanguageCode: nodeNameStringWithLanguageCode,
      includeTarget: false,
      searchType: "oneLevelDown",
      graphData,
    });

    const nodeInfo = {
      node: targetNodeItem,
      parents: targetParents,
      children: targetChildren,
    };

    results.push(nodeInfo);
  });

  return results;
};

// const ss = async() => {
//     const res = await getNode({nodeName:'en:vegetable, vegetables'});
//     fs.writeFileSync(
//         './bla.json',
//         JSON.stringify(res, null, 2)
//         );

// en:vegetable, vegetables
// `en:vegetable fiber, vegetable fibers, plant fiber, plant fibre`
// }

// ss()

type GetNodeType = typeof getNode;

export { GetNodeArgs, GetNodeType, NodeResultType };
export default getNode;
