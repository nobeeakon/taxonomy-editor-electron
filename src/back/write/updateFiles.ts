import type { NodeBlockType } from "../read/getNodeBlock";
import type { ParsedNodeType } from "../read/parseNodeBlock";
import nodeToStringArray from "./nodeToStringArray";
import type { GraphNodeType } from "../read/graph/buildGraph";

type UpdateFilesArgs = {
  nodeNameStringWithLanguageCode: string;
  index: number;
  nodeBlock: NodeBlockType;
  nodeToSave: ParsedNodeType;
  parentNamesWithLanguageCode: GraphNodeType["parentNamesWithLanguageCode"];
  graphJson: GraphNodeType[];
  txtFile: string[];
};

/** Update target node in-memory version of txt and graph.json files */
const updateFiles = ({
  nodeNameStringWithLanguageCode,
  index,
  nodeBlock,
  nodeToSave,
  parentNamesWithLanguageCode,
  graphJson,
  txtFile,
}: UpdateFilesArgs) => {
  // update graph.json
  let count = 0;
  const newGraphJson = graphJson.map((nodeItem) => {
    if (
      nodeItem.nodeNameStringWithLanguageCode === nodeNameStringWithLanguageCode
    ) {
      if (count === index) {
        const updatedJson: GraphNodeType = {
          ...nodeToSave,
          parentNamesWithLanguageCode,
        };

        return updatedJson;
      } else {
        count++;
      }
    }
    return nodeItem;
  });

  // update taxonomy.txt
  const updatedNodeArray = nodeToStringArray(nodeToSave);
  // slice(start,end) start is inclusive, end is not inclusive
  const newArray = txtFile
    .slice(0, nodeBlock.startRow)
    .concat(updatedNodeArray)
    .concat(txtFile.slice(nodeBlock.endRow + 1));

  return { txtFile: newArray, graphJson: newGraphJson };
};

export default updateFiles;
