import fs from 'fs';
import ISO6391 from 'iso-639-1'

import { characters } from '../../constants';
import getNodeBlocks from '../getNodeBlock';
import parseNodeBlock, {ParsedNodeType} from '../parseNodeBlock';
import type { TaxonomyType } from '../../../shared/constants';
import { getTaxonomyGraphFilePath, getTaxonomyFilePath, parseNodeNamesAndLanguageCode } from '../../utils';


// TODO commented blocks
// TODO count blocks by language
// TODO random string in language, untranslated (missing) or translated


const getNodes = (file:string[]) => {
    const languageCodesSet = new Set(ISO6391.getAllCodes() as string[]);


    // TODO synonyms, stopwords, etc

   const nodes:ParsedNodeType[] = [];
    
    for (let slowPointer = 0; slowPointer <file.length; slowPointer++){
        const slowRow = file[slowPointer];
        const slowPrefix = slowRow.split(characters.propsSeparator)[0]; // examples: 'synonyms:fr:poulet-crudités, crudités-poulet' , 'en:Artisan products'
        
        if (languageCodesSet.has(slowPrefix)) {
            // we are in a block
            // valid node blocks have at least 1 line that starts with a lang , ex: 'en:Artisan products'
            // invalid node blocks for example can be a block of comments
            const {startRow, endRow} = getNodeBlocks(file,[slowPointer])[0]

            const nodeInfo = parseNodeBlock({file, startRow, endRow})


            if (nodeInfo) {
                nodes.push(nodeInfo)
            }

            // move the pointer so we can continue reading the file
            slowPointer = endRow;
        }
    }

    return nodes;
}



type GraphNodeType = {
    parentNamesWithLanguageCode:string[];
} & ParsedNodeType;



const parseAndCleanTaxonomy = (taxonomy:TaxonomyType) => {
    const taxonomyFilePath = getTaxonomyFilePath(taxonomy);
    const file = fs.readFileSync(taxonomyFilePath).toString().split('\n');
    
    const nodes = getNodes(file)

    const nodesCleanedChildrenOf:GraphNodeType[] = []

    // each parent name is searched through a 2 fold loop
    // storing this information prevents doing the iterations for each one
    const prevLocated:Record<string, string> = {}
    const getPrevLocatedKey = (parentName:string, parentLanguageCode:string) => `parent-${parentName}-lang-${parentLanguageCode}`


    nodes.forEach((nodeItem) => {
        const parents = nodeItem.parents.filter(parentItem => !parentItem.isDeprecated);

        const parentsNodesNamesWithLanguageCode:string[] = []
        parents.forEach((parentItem )=> {
            const parentName = parentItem.value;
            const parentLanguageCode = parentItem.languageCode;

            const prevKey = getPrevLocatedKey(parentName, parentLanguageCode)
            if (prevKey in prevLocated) {
                // if was previously found just use that info
                const nodeNameStringWithLanguageCode = prevLocated[prevKey];
                parentsNodesNamesWithLanguageCode.push(nodeNameStringWithLanguageCode)
            } else {



            for(let i = 0; i <nodes.length ; i ++) {
                const {nodeNamesLanguageCode, nodeNames} = parseNodeNamesAndLanguageCode(nodes[i].nodeNameStringWithLanguageCode);
                const currentNodeNames = nodeNames.map(nameItem => nameItem.toLowerCase())
                const currentNodeNamesLanguageCode = nodeNamesLanguageCode
                const currentNodeNameStringWithLanguageCode = nodes[i].nodeNameStringWithLanguageCode

                // some times the some of the synonyms are used but not necessarily in the same case
                // <en:Dairy substitutes
                // en:Milk substitutes, milk replacements, milk substitute, milk replacement
                // ----------
                // <en:Milk substitute
                // en:Creamer, coffee creamers
                if (currentNodeNamesLanguageCode === parentLanguageCode && currentNodeNames.includes(parentName.toLowerCase()) ) {
                    parentsNodesNamesWithLanguageCode.push(currentNodeNameStringWithLanguageCode)

                    prevLocated[prevKey] = currentNodeNameStringWithLanguageCode;
                    break; // early return
                }


            }
        }

        

        })

        nodesCleanedChildrenOf.push({
            parentNamesWithLanguageCode: parentsNodesNamesWithLanguageCode,
            ...nodeItem
        })

    })


    return nodesCleanedChildrenOf;
}



type BuildGraphArgs =  {taxonomy:TaxonomyType; forceSave:boolean}

const buildGraph = async({taxonomy, forceSave}:BuildGraphArgs) => {
    
    const filePath = getTaxonomyGraphFilePath()
    
    const taxonomyFilePath = getTaxonomyFilePath(taxonomy);
    if (!fs.existsSync(taxonomyFilePath)) {
        throw Promise.reject(new Error(`Unable to find taxonomy (${taxonomy}) file`))
    }

    if( !forceSave && fs.existsSync(filePath)) {
        return;
    }


    const nodesJson = parseAndCleanTaxonomy(taxonomy);
    
    fs.writeFileSync(
        filePath, 
        JSON.stringify(nodesJson)
        );

        return;
}

type BuildGraphType = typeof buildGraph;


export {BuildGraphArgs, BuildGraphType, GraphNodeType }
export default buildGraph;