/** search a regexp in a string array. */
const findRows = (file: string[], regex: RegExp) => {
  const rowNumbers: number[] = [];

  file.forEach((row, index) => {
    if (regex.test(row)) rowNumbers.push(index);
  });

  return rowNumbers;
};

export default findRows;
