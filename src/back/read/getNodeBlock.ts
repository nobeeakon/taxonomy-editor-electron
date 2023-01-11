export type NodeBlockType = {
  /** row used to start the search */
  row: number;
  /** starting line of the node */
  startRow: number;
  /** ending line of the node */
  endRow: number;
};

/**
 *  get file rows/lines: start and end for a node. Nodes in file are separated by
 *  empty lines. For example:
 * ```
 *
 * a node
 * a node line 2
 *
 * another node
 * another node line 2
 *
 * ```
 */
const getNodeBlocks = (
  file: string[],
  rownNumbers: number[]
): NodeBlockType[] => {
  const resultsBlock: Array<{ row: number; startRow: number; endRow: number }> =
    [];
  for (const rowNumber of rownNumbers) {
    let startRow = 0;
    let endRow = file.length - 1;
    // search for previous space
    for (let i = rowNumber; i > 0; i--) {
      const row = file[i];
      if (row === "") {
        break;
      } else {
        startRow = i;
      }
    }

    // search for next space
    for (let i = rowNumber; i < file.length; i++) {
      const row = file[i];
      if (row === "") {
        break;
      } else {
        endRow = i;
      }
    }

    resultsBlock.push({ row: rowNumber, startRow, endRow });
  }

  return resultsBlock;
};

export default getNodeBlocks;
