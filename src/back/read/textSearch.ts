import fs from "fs";

import findRows from "./findRows";
import { characters } from "../constants";
import getNodeBlocks from "./getNodeBlock";
import parseNodeBlock from "./parseNodeBlock";
import { TaxonomyType, taxonomies } from "../../shared/constants";
import {
  getTaxonomyFilePath,
  parseNodeNamesAndLanguageCode,
  escapeRegexp,
} from "../utils";

type SimpleTextSearch = {
  nodeNameStringWithLanguageCode: string | null;
  nodeName: string | null;
  nodeNamesLanguageCode: string;
  text: string[];
  fileRows: {
    startRow: number;
    row: number;
    endRow: number;
  };
};

// TODO save file
/** search for a text and returns the rows that contains the text */
type TextSearchArgs = {
  searchText: string;
  taxonomy: TaxonomyType;
};

const textSearch = async ({ searchText, taxonomy }: TextSearchArgs) => {
  const taxonomyFilePath = getTaxonomyFilePath(taxonomy);

  if (searchText.length <= 2) {
    return Promise.reject(
      new Error(`Please search a bigger string: ${searchText}`)
    );
  }

  if (!taxonomies.includes(taxonomy)) {
    return Promise.reject(new Error(`Invalid taxonomy: ${taxonomy}`));
  }

  if (!fs.existsSync(taxonomyFilePath)) {
    return Promise.reject(
      new Error(`Unable to find taxonomy file: ${taxonomy}`)
    );
  }

  let taxonomyFile: string[] = [];
  try {
    taxonomyFile = fs.readFileSync(taxonomyFilePath).toString().split("\n");
  } catch (error) {
    console.error(error);
    return Promise.reject(
      new Error(`Unable to read taxonomy file: ${taxonomy}`)
    );
  }

  if (taxonomyFile.length === 0) {
    return Promise.reject(new Error(`Taxonomy file is empty: ${taxonomy}`)); // TODO replace with current builderror function
  }

  const regexp = new RegExp(escapeRegexp(searchText), "i");

  const rows = findRows(taxonomyFile, regexp);
  const searchResult = getNodeBlocks(taxonomyFile, rows);

  const bufferRows = 3;

  const results: SimpleTextSearch[] = [];

  for (const { startRow, row, endRow } of searchResult) {
    const node = parseNodeBlock({ file: taxonomyFile, startRow, endRow });

    const start = row - bufferRows < startRow ? startRow : row - bufferRows;
    const end = row + 1 + bufferRows > endRow ? endRow : row + bufferRows;
    const rows = taxonomyFile.slice(start, end + 1);

    if (node) {
      const nodeNameStringWithLanguageCode =
        node.nodeNameStringWithLanguageCode;

      const { nodeNames, nodeNamesLanguageCode } =
        parseNodeNamesAndLanguageCode(nodeNameStringWithLanguageCode);
      const nodeName: string | null =
        nodeNames?.length > 0
          ? nodeNames.join(characters.taxonomySeparator)
          : null;

      results.push({
        nodeNameStringWithLanguageCode,
        nodeName,
        nodeNamesLanguageCode,
        text: rows,
        fileRows: { startRow, row, endRow },
      });
    } else {
      results.push({
        nodeNameStringWithLanguageCode: null,
        nodeName: null,
        nodeNamesLanguageCode: null,
        text: rows,
        fileRows: { startRow, row, endRow },
      });
    }
  }

  return results;
};

type TextSearchType = typeof textSearch;

export { TextSearchArgs, TextSearchType, SimpleTextSearch };
export default textSearch;
