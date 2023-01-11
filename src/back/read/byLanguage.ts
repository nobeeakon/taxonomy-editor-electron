import fs from 'fs';
import ISO6391 from 'iso-639-1'

import findRows from './findRows';
import { characters } from '../constants';

// TODO commented blocks
// TODO count blocks by language
// TODO random string in language, untranslated (missing) or translated

export const getRowsTranslatedByLanguage = (): number[] => {
    const file = fs.readFileSync('./categories.txt').toString().split('\n');
    const languageCode = 'en';

    const languageCodesSet = new Set(ISO6391.getAllCodes() as string[]);


    // TODO synonyms, stopwords, etc

    if (!languageCodesSet.has(languageCode)) return []

    const regexp = new RegExp(`^${languageCode}:`)
    const rows = findRows(file,regexp)

    return rows;
}

/** looks for nodes and returns startRow, endRow, and if it has the searched language */
const getRowsByLanguage = () => {
    const file = fs.readFileSync('./categories.txt').toString().split('\n');
    const languageCode = 'fr';

    const languageCodesSet = new Set(ISO6391.getAllCodes() as string[]);


    // TODO synonyms, stopwords, etc

    if (!languageCodesSet.has(languageCode)) return []

    const results:Array<{startRow:number;endRow:number;hasSearchedLanguage:boolean}> = []

    for (let slowPointer = 0; slowPointer <file.length; slowPointer++){
        const slowRow = file[slowPointer];
        const slowPrefix = slowRow.split(characters.propsSeparator)[0]; // examples: 'synonyms:fr:poulet-crudités, crudités-poulet' , 'en:Artisan products'
        
        if (languageCodesSet.has(slowPrefix)) {
            // we are in a block
            const startRow = slowPointer;
            let endRow = startRow;
            let hasSearchedLanguage = false;


            for (let fastPointer = startRow; fastPointer <file.length; fastPointer++){
                const fastRow = file[fastPointer];

                if (fastRow === '') {
                    // we are in the end of a block
                    endRow = fastPointer - 1;
                    slowPointer = fastPointer; 

                    results.push({startRow, endRow, hasSearchedLanguage})
                    break; // early return
                }

                const fastPrefix = fastRow.split(characters.propsSeparator)[0]; // examples: 'synonyms:fr:poulet-crudités, crudités-poulet' , 'en:Artisan products'

                if (fastPrefix === languageCode) {
                    hasSearchedLanguage = true;
                }
             }
        }
    }

      return results;
}


getRowsByLanguage();

export default getRowsByLanguage;