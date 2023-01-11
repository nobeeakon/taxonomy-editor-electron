import fs from "fs";

import findRows from "../read/findRows";
import getNodeBlock from "../read/getNodeBlock";
import parseNodeBlock from "../read/parseNodeBlock";
import type { GraphNodeType } from "../read/graph/buildGraph";
import {
  buildLocalizedString,
  parseNodeNamesAndLanguageCode,
  escapeRegexp,
  getTaxonomyGraphFilePath,
  getTaxonomyFilePath,
} from "../utils";
import ISO6391 from "iso-639-1";
import updateFiles from "./updateFiles";
import { characters } from "../constants";
import { TaxonomyType } from "../../shared/constants";
import { FileErrorCodes, buildError } from "../errors";

type ParentNamesWithLanguageCodeType =
  GraphNodeType["parentNamesWithLanguageCode"];

const UpdateNodeNameErrorCodes = {
  invalidLanguageCode: "update-name-01",
  invalidNewNames: "update-name-02",
};

const updateNodeName = async (
  nodeNameStringWithLanguageCode: string,
  newLanguageCode: string,
  newNodeNames: string[],
  txtFile: string[],
  graphJson: GraphNodeType[],
  index = 0,
  parentNamesWithLanguageCode: ParentNamesWithLanguageCodeType
) => {
  const nodeNameRegexp = new RegExp(
    `^${escapeRegexp(nodeNameStringWithLanguageCode)}`
  );

  const rowNumbers = findRows(txtFile, nodeNameRegexp);

  if (rowNumbers.length === 0 || rowNumbers.length < index) {
    return { txtFile, graphJson };
  }

  const targetRow = rowNumbers[index];
  const nodeBlock = getNodeBlock(txtFile, [targetRow])[0];

  if (!nodeBlock) return { txtFile, graphJson };

  const originalNode = parseNodeBlock({
    file: txtFile,
    startRow: nodeBlock.startRow,
    endRow: nodeBlock.endRow,
  });

  const newNodeNameString = buildLocalizedString(newLanguageCode, newNodeNames);
  const {
    nodeNamesLanguageCode: originalLanguageCode,
    nodeNames: originalNodeNames,
  } = parseNodeNamesAndLanguageCode(
    originalNode.nodeNameStringWithLanguageCode
  );

  // check if is the same as original
  const newNodeNamesLowerCaseSet = new Set(
    newNodeNames.map((nodeNameItem) => nodeNameItem.toLowerCase())
  ); // values are case insensitive
  if (
    originalLanguageCode === newLanguageCode &&
    originalNodeNames.length === newNodeNames.length &&
    originalNodeNames.every((nameItem) =>
      newNodeNamesLowerCaseSet.has(nameItem.toLowerCase())
    )
  ) {
    return { txtFile, graphJson }; // early return as the name is the same as before
  }

  // check if is duplicate name string
  for (const nodeItem of graphJson) {
    const { nodeNames: nodeItemNames } = parseNodeNamesAndLanguageCode(
      nodeItem.nodeNameStringWithLanguageCode
    );

    if (
      nodeItem.nodeNameStringWithLanguageCode === nodeNameStringWithLanguageCode
    )
      continue;

    if (
      nodeItemNames.some((nameItem) =>
        newNodeNamesLowerCaseSet.has(nameItem.toLowerCase())
      )
    ) {
      return Promise.reject(
        buildError({
          code: UpdateNodeNameErrorCodes.invalidNewNames,
          message: `Unable to save new name. Other nodes already share some synonyms with it.`,
        })
      );
    }
  }

  const nodeToSave = { ...originalNode };

  // check language changes
  nodeToSave.nodeNameStringWithLanguageCode = newNodeNameString;
  if (originalLanguageCode !== newLanguageCode) {
    const newLanguages = { ...nodeToSave.languages };

    newLanguages[originalLanguageCode] = {
      isDeprecated: false,
      value: originalNodeNames,
    };

    nodeToSave.languages = newLanguages;
  }

  const { txtFile: updatedNodeTxtFile, graphJson: updatedNodeGraphJson } =
    updateFiles({
      nodeNameStringWithLanguageCode,
      index,
      nodeBlock,
      nodeToSave,
      parentNamesWithLanguageCode,
      graphJson,
      txtFile,
    });

  // parents

  // update json
  const originalNodeNamesSet = new Set(
    originalNodeNames.map((nameItem) => nameItem.toLowerCase())
  );
  const defaultNewParentName = newNodeNames[0]; // take the first value as default
  const updatedParentsGraphJson = updatedNodeGraphJson.map((nodeItem) => {
    if (
      nodeItem.parentNamesWithLanguageCode.some(
        (parentNameItem) => parentNameItem === nodeNameStringWithLanguageCode
      )
    ) {
      const newParentsWithLanguageCode =
        nodeItem.parentNamesWithLanguageCode.map((parentNameItem) =>
          parentNameItem === nodeNameStringWithLanguageCode
            ? newNodeNameString
            : parentNameItem
        );

      const newParents = nodeItem.parents.map((parentItem) => {
        if (originalNodeNamesSet.has(parentItem.value.toLowerCase())) {
          parentItem.value = defaultNewParentName;
        }

        return parentItem;
      });

      nodeItem.parentNamesWithLanguageCode = newParentsWithLanguageCode;
      nodeItem.parents = newParents;
    }

    return nodeItem;
  });

  // update txt
  const updatedParentsTxt = updatedNodeTxtFile.map((rowItem) => {
    const isCommentRow = rowItem.startsWith(characters.comment);
    const rowInfo = isCommentRow ? rowItem.replace(/#/, "") : rowItem;
    if (rowInfo.startsWith(characters.childrenOf)) {
      const [, parentName] = rowInfo.split(characters.propsSeparator);

      if (originalNodeNamesSet.has(parentName)) {
        return buildLocalizedString(
          newLanguageCode,
          [defaultNewParentName],
          true,
          isCommentRow
        );
      }
    }

    return rowItem;
  });

  return { txtFile: updatedParentsTxt, graphJson: updatedParentsGraphJson };
};

type SaveNodeNameArgs = {
  taxonomy: TaxonomyType;
  nodeNameStringWithLanguageCode: string;
  newLanguageCode: string;
  newNodeNames: string[];
  index: number;
  parentNamesWithLanguageCode: ParentNamesWithLanguageCodeType;
};

const saveNodeName = async ({
  taxonomy,
  nodeNameStringWithLanguageCode,
  newLanguageCode,
  newNodeNames,
  index,
  parentNamesWithLanguageCode,
}: SaveNodeNameArgs) => {
  const taxonomyFilePath = getTaxonomyFilePath(taxonomy);
  const graphFilePath = getTaxonomyGraphFilePath();

  let taxonomyFile: string[] = [];
  try {
    taxonomyFile = fs.readFileSync(taxonomyFilePath).toString().split("\n");
  } catch (error) {
    console.error(error);
    return Promise.reject(
      buildError({
        code: FileErrorCodes.unavailableTaxonomyFile,
        message: `Unable to read taxonomy file: ${taxonomy}`,
      })
    );
  }

  let graphJson: GraphNodeType[] = [];
  try {
    graphJson = JSON.parse(
      fs.readFileSync(graphFilePath).toString()
    ) as GraphNodeType[];
  } catch (error) {
    throw Promise.reject(
      buildError({
        code: FileErrorCodes.unavailableGraphFile,
        message: `Unable to read the graph file, please try again`,
      })
    );
  }

  if (!ISO6391.validate(newLanguageCode))
    return Promise.reject(
      buildError({
        code: UpdateNodeNameErrorCodes.invalidLanguageCode,
        message: `Unable to save new name. Invalid language code.`,
      })
    );
  if (newNodeNames.length === 0)
    return Promise.reject(
      buildError({
        code: UpdateNodeNameErrorCodes.invalidNewNames,
        message: `Unable to save new name. Invalid value`,
      })
    );

  const { txtFile: updatedTxtFile, graphJson: updatedGraphJson } =
    await updateNodeName(
      nodeNameStringWithLanguageCode,
      newLanguageCode,
      newNodeNames,
      taxonomyFile,
      graphJson,
      index,
      parentNamesWithLanguageCode
    );

  // write txt line by line
  const logger = fs.createWriteStream(taxonomyFilePath);
  updatedTxtFile.forEach((rowItem, rowIndex) => {
    logger.write(`${rowIndex === 0 ? "" : `\n`}${rowItem}`);
  });

  fs.writeFileSync(graphFilePath, JSON.stringify(updatedGraphJson));
};

type SaveNodeNameType = typeof saveNodeName;

export { SaveNodeNameArgs, SaveNodeNameType };
export default saveNodeName;
