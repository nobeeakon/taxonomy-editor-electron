import type {GraphNodeType} from './buildGraph'

type GetChildrenTreeParams = {
    nodeNameWithLanguageCode:string;
    includeTarget:boolean;
    searchType:'oneLevelDown'|'all';
    graphData: GraphNodeType[];
}

/** get children tree. Includes the target node in the returned array */
const getChildrenTree = ({includeTarget, searchType, graphData, nodeNameWithLanguageCode}:GetChildrenTreeParams) => {

    let targetNodeInfo:null|GraphNodeType = null;

    const parentOfIndexMap:Record<string, number[]> = {}
    graphData.forEach( (nodeItem, index) => {

        if(nodeItem.nodeNameStringWithLanguageCode === nodeNameWithLanguageCode) {
            targetNodeInfo = nodeItem;
        }

        const parents = nodeItem.parentNamesWithLanguageCode;
        parents.forEach((parentNameItem) => {
            if(parentNameItem in parentOfIndexMap) {
                parentOfIndexMap[parentNameItem].push(index)
            } else {
                parentOfIndexMap[parentNameItem] = [index]
            }
        })
    })

 
    if(!targetNodeInfo) return [];

    const nodes:GraphNodeType[] = includeTarget?[targetNodeInfo]:[];

    const parentOfNames = [targetNodeInfo.nodeNameStringWithLanguageCode]
    for(let i = 0; i < parentOfNames.length; i ++) {
        const parentOf = parentOfNames[i];
        const parentOfIndexes = parentOfIndexMap[parentOf] ?? []; // define default as may not exist in the parentOfIndexMap

        const childrenNodes = parentOfIndexes.map((index) => graphData[index])
        childrenNodes.forEach((nodeItem )=> {
            if (searchType === 'all') {
                parentOfNames.push(nodeItem.nodeNameStringWithLanguageCode)
            }
            nodes.push(nodeItem);
        })


    }

    return nodes;
}

export default getChildrenTree;
