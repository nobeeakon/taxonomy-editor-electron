import fs from 'fs';

import findRows from '../read/findRows';
import getNodeBlock from '../read/getNodeBlock';
import parseNodeBlock from '../read/parseNodeBlock';
import nodeToStringArray from './nodeToStringArray';
import type {GraphNodeType} from '../read/graph/buildGraph'
import {getTaxonomyGraphFilePath, getTaxonomyFilePath, escapeRegexp} from '../utils';
import { TaxonomyType } from '../../shared/constants';
import {FileErrorCodes,buildError } from '../errors';

type saveNodeInfo = Pick<GraphNodeType, 'parentNamesWithLanguageCode'|'languages'|'comments'|'otherInfo'>


const updateNode = (nodeNameStringWithLanguageCode: string, txtFile: string[], graphJson: GraphNodeType[],index:number, newNode: saveNodeInfo) => {
    const regex = new RegExp(`^${escapeRegexp(nodeNameStringWithLanguageCode)}`)

    const rowNumbers = findRows(txtFile, regex)

    if (rowNumbers.length === 0 || rowNumbers.length  < index) {
        return  { txtFile, graphJson};
    }

    const targetRows = rowNumbers[index]
    const nodeBlock = getNodeBlock(txtFile, [targetRows])[0]

    if (!nodeBlock)  return  { txtFile, graphJson};

    const originalNode = parseNodeBlock({file: txtFile, startRow: nodeBlock.startRow, endRow:nodeBlock.endRow })
    
    // remove languages with nothing inside
    const languagesWithValues = Object.keys(newNode.languages)
        .map((keyItem) => {
            const languageLength = newNode.languages[keyItem].value.map( valueItem => valueItem.trim()).filter(Boolean).length
            return languageLength > 0?keyItem:null;
        } 
        ).filter(Boolean)

    // TODO replace with something that doesn't modifies the original object    
    Object.keys(newNode.languages).forEach(keyItem => {
        if (!languagesWithValues.includes(keyItem))  {
            delete newNode.languages[keyItem]
        }  else {
            newNode.languages[keyItem].value = newNode.languages[keyItem].value.map(languageItem => languageItem.trim())
        }
    })
  
    // remove empty comments
    const cleanedComments = newNode.comments.map(commentItem => commentItem.trim()).filter(Boolean)

    // clean other info pieces. They should at least contain the first two pieces of information
    const cleanedOtherInfo = newNode.otherInfo.filter(({property, languageCode}) => property && languageCode )

    const updatedNode = {...originalNode, 
        languages: {...newNode.languages}, 
        comments: [...cleanedComments],
        otherInfo: [...cleanedOtherInfo],   
    }


    // update graph.json
    let count = 0;
    const newGraphJson = graphJson.map((nodeItem)=> {
        if (nodeItem.nodeNameStringWithLanguageCode === nodeNameStringWithLanguageCode) {
            if (count === index) {
                const updatedJson:GraphNodeType = {
                    ...updatedNode,
                    parentNamesWithLanguageCode: newNode.parentNamesWithLanguageCode
                }

                return updatedJson;
            } else {
                count ++;
            }
        }
        return nodeItem;
    })

    // update taxonomy.txt
    const updatedNodeArray = nodeToStringArray(updatedNode);
    // slice(start,end) start is inclusive, end is not inclusive
    const newArray = txtFile.slice(0, nodeBlock.startRow).concat(updatedNodeArray).concat( txtFile.slice(nodeBlock.endRow + 1))
   

    return {txtFile: newArray, graphJson: newGraphJson};

}


type SaveNodeInfoArgs = {
    taxonomy:TaxonomyType;
    nodeNameStringWithLanguageCode: string;
    index: number;
    newNode: saveNodeInfo
}

const saveUpdateNode = async({taxonomy, nodeNameStringWithLanguageCode, index=0, newNode}:SaveNodeInfoArgs) => {
    const taxonomyFilePath = getTaxonomyFilePath(taxonomy);
    const graphFilePath = getTaxonomyGraphFilePath();
    
    let taxonomyFile: string[] = []
    try{
        taxonomyFile = fs.readFileSync(taxonomyFilePath).toString().split('\n')
    } catch (error) {
        console.error(error);
        return Promise.reject(buildError({code: FileErrorCodes.unavailableTaxonomyFile, message:`Unable to read taxonomy file: ${taxonomy}`}))
    }

    let graphJson:GraphNodeType[] = [] 
    try{
        graphJson = JSON.parse(fs.readFileSync(graphFilePath).toString()) as GraphNodeType[];
    } catch(error) {
        throw Promise.reject(buildError({code: FileErrorCodes.unavailableGraphFile, message:`Unable to read the graph file, please try again`}))
    }
    

    const {txtFile: updatedTxtFile, graphJson: updatedGraphJson} = updateNode(nodeNameStringWithLanguageCode, taxonomyFile, graphJson,index, newNode)

    // write txt line by line
    const logger = fs.createWriteStream(taxonomyFilePath)
    updatedTxtFile.forEach((rowItem, rowIndex) => {
        logger.write(`${rowIndex===0?'':`\n`}${rowItem}`)
    })    

      fs.writeFileSync(
        graphFilePath, 
        JSON.stringify(updatedGraphJson)
        );

    }

type SaveUpdateNodeType = typeof saveUpdateNode;

export { SaveNodeInfoArgs, SaveUpdateNodeType };

export default saveUpdateNode;