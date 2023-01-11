export const characters = {
  comment: "#", // examples: '#<en:Fish rillettes', '#ciqual_food_code:en:26068'
  childrenOf: "<", // strings starting with '<' are children of other nodes. Example: '<en:Tunas'
  propsSeparator: ":", // examples: // 'en:Gummi candies', 'agribalyse_food_code:en:31041'
  taxonomySeparator: ", ", // examples: 'nl:Echte bonito, Bonito, Skipjack, Skipjacktonijn'
} as const;
