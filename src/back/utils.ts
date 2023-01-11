import { app } from "electron";

import type { TaxonomyType } from "../shared/constants";
import { characters } from "./constants";

const USER_DATA_PATH = app.getPath("userData");

export const getTaxonomyFilePath = (taxonomy: TaxonomyType) =>
  `${USER_DATA_PATH}/${taxonomy}.txt`;
export const getTaxonomyGraphFilePath = () =>
  `${USER_DATA_PATH}/graph_data.json`;

// https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
export const escapeRegexp = (value: string) => {
  return value.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
};

export const buildLocalizedString = (
  languageCode: string,
  value: string[],
  isParent = false,
  isDeprecated = false
) => {
  const cleanValue = value.map((valueItem) => valueItem.trim()).filter(Boolean);
  const languageAndValue = `${languageCode}${
    characters.propsSeparator
  }${cleanValue.join(characters.taxonomySeparator)}`;
  let result = languageAndValue;
  if (isParent) {
    result = `${characters.childrenOf}${languageAndValue}`;
  }
  if (isDeprecated) {
    result = `${characters.comment} ${result}`;
  }

  return result;
};

/** destructure node name in language code and names array */
export const parseNodeNamesAndLanguageCode = (
  nodeNameStringWithLanguageCode: string
) => {
  // examples: 'fr:Sucres d'orge', 'en:Pre-food, Baby start milk from 6 months', 'en:Honey-based preparations'
  const [nodeNamesLanguageCode, nodeNamesString] =
    nodeNameStringWithLanguageCode.split(characters.propsSeparator);

  const nodeNames = nodeNamesString
    .split(characters.taxonomySeparator)
    .map((nameItem) => nameItem.trim());

  return { nodeNamesLanguageCode, nodeNames };
};
