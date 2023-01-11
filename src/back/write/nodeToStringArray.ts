import type { ParsedNodeType } from "../read/parseNodeBlock";
import { characters } from "../constants";
import { buildLocalizedString, parseNodeNamesAndLanguageCode } from "../utils";

const nodeToStringArray = (node: ParsedNodeType) => {
  const { nodeNamesLanguageCode } = parseNodeNamesAndLanguageCode(
    node.nodeNameStringWithLanguageCode
  );
  const localizedStrings = Object.keys(node.languages)
    .filter((languageCodeItem) => languageCodeItem !== nodeNamesLanguageCode)
    .sort((languageCodeA, languageCodeB) =>
      languageCodeA > languageCodeB ? 1 : 0
    )
    .map((languageCodeItem) => {
      const localizedItem = node.languages[languageCodeItem];
      return buildLocalizedString(
        languageCodeItem,
        localizedItem.value,
        false,
        localizedItem.isDeprecated
      );
    });

  const parentsStrings = node.parents
    .sort((parentItemA, parentItemB) =>
      parentItemA.languageCode > parentItemB.languageCode ? 1 : 0
    )
    .map((parentItem) => {
      return buildLocalizedString(
        parentItem.languageCode,
        [parentItem.value],
        true,
        parentItem.isDeprecated
      );
    });

  const commentsStrings = node.comments.map(
    (commentItem) => `${characters.comment} ${commentItem.trim()}`
  );

  const otherInfoStrings = node.otherInfo.map((infoItem) => {
    let infoString = `${infoItem.property.trim()}${
      characters.propsSeparator
    }${infoItem.languageCode.trim()}${characters.propsSeparator}${
      infoItem.value
    }`;
    if (infoItem.isDeprecated)
      infoString = `${characters.comment} ${infoString}`;

    // some times string contain some additional final ":" as they may have been translations with invalid language codes,
    // ex. 'sh:Natrijum ciklamat' 'sh' is not valid for ISO-639-1
    return infoString.replace(/:+$/, "").trim();
  });

  const nodeStrings = [
    ...parentsStrings,
    node.nodeNameStringWithLanguageCode,
    ...localizedStrings,
    ...otherInfoStrings,
    ...commentsStrings,
  ];

  return nodeStrings;
};

export default nodeToStringArray;
