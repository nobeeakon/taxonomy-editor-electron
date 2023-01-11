import ISO6391 from 'iso-639-1'

import { characters } from '../constants';


export type ParsedNodeType = {
    parents: {
        languageCode: string;
        value: string;
        isDeprecated: boolean;
    }[];
    languages: Record<string, {
        isDeprecated: boolean;
        value: string[];
    }>;
    comments: string[];
    otherInfo: {
        property: string;
        languageCode: string;
        value: string;
        isDeprecated: boolean;
    }[];
    /** node names with language code. Must be unique for each node, thus can be used as an id. Is the file row without any modification */
    nodeNameStringWithLanguageCode: string;
}




/** parses a node and returns all its information. */
const parseNodeBlock = ({file, startRow, endRow}:{file:string[];startRow:number, endRow:number}):ParsedNodeType|null => {
    const languageCodesSet = new Set(ISO6391.getAllCodes() as string[]);

    
    let nodeNameStringWithLanguageCode:null|string = null;
    let nodeNameLanguageCode = '';
    // Select the first language as node name
    // ```<en:Candies
    // fr:Sucres d'orge
    // wikidata:en:Q2119832```
    // it would use 'fr:Sucres d'orge' as the name
    for (let i = startRow; i <= endRow; i++) {
        const row = file[i]
        const prefix = row.split(characters.propsSeparator)[0];

        if (languageCodesSet.has(prefix)){
            nodeNameStringWithLanguageCode = row
            nodeNameLanguageCode = prefix;
            break; // early return
        }


    }

    if (!nodeNameStringWithLanguageCode) {           
        console.error(`Unable to find node name. Start line: ${startRow}, end line: ${endRow}`)
        return null;
    }
    


        const parents:Array<{languageCode:string;value:string, isDeprecated:boolean}> = []
        const languages:Record<string,{isDeprecated:boolean;value:string[]}> = {}
        const comments:string[] = []
        const otherInfo: Array<{property:string;languageCode:string;value:string, isDeprecated:boolean}> = []

        for (let i = startRow; i <= endRow; i++) {
            const row = file[i]
            const prefix = row.split(characters.propsSeparator)[0];
            
            if (prefix.startsWith(characters.childrenOf)) {
                // strings starting with '<' are children of other nodes
                //  examples: '<en:Confectioneries', '<en:French confectioneries'
                const [languageCode, value] = row.replace(characters.childrenOf, '').split(characters.propsSeparator)
                parents.push({languageCode, value, isDeprecated:false});
            }


            if (languageCodesSet.has(prefix) && prefix !== nodeNameLanguageCode){
                // string looks like: 'en:Lollipops, Lollipop'
                const languageString = row.split(characters.propsSeparator)[1]
                languages[prefix] = {isDeprecated:false, value: languageString.split(characters.taxonomySeparator)}
            }

            if (!prefix.startsWith(characters.childrenOf) && !prefix.startsWith('#') && !languageCodesSet.has(prefix)){
                // string looks like: 
                // 'wikidata:en:Q217446'
                // 'agribalyse_food_code:en:31059'
                // 'ciqual_food_code:en:31059'
                // 'ciqual_food_name:en:Hard candy and lollipop'
                // 'wikipedia:en:https://en.wikipedia.org/wiki/Spinach
                const [property, languageCode, ...rest] = row.split(characters.propsSeparator)
                otherInfo.push({property, languageCode, value:rest.join(characters.propsSeparator), isDeprecated:false})      
            }

            if (prefix.startsWith(characters.comment)) {
                // examples: '#wikidata:en:' , '# zh-tw:牛軋糖', '# category/nougats has 421 products @2019-05-18'
                const cleanedRow = row.replace(/#\s*/, '') 

                const isPropertyRegexp = /^\w+:\w+:\w*/

                const commentPrefix = cleanedRow.split(characters.propsSeparator)[0];
                if (languageCodesSet.has(commentPrefix)){
                    // these rows look like: '# nan:Nougat'
                    languages[commentPrefix] = {isDeprecated:true, value: cleanedRow.split(characters.propsSeparator)[1].split(characters.taxonomySeparator)}
                } else if(commentPrefix.startsWith(characters.childrenOf)){  
                        // strings starting with '<' are children of other nodes
                        //  examples: '<en:Confectioneries', '<en:French confectioneries'
                        const [languageCode, value] = cleanedRow.replace(characters.childrenOf, '').split(characters.propsSeparator)
                        parents.push({languageCode, value, isDeprecated:true});
                } else if (isPropertyRegexp.test(cleanedRow)){
                    // string looks like: 'wikidata:en:Q217446'
                    const [property, languageCode, value] = cleanedRow.split(characters.propsSeparator)
                    otherInfo.push({property, languageCode, value, isDeprecated:true})      
                } else {
                    comments.push(cleanedRow)
                }
            }
    }





    
    return {   parents, languages, comments, otherInfo, nodeNameStringWithLanguageCode}
}


export default parseNodeBlock;
