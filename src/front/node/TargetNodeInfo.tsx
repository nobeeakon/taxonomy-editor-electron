import { useState } from 'react';
import {  Link } from 'react-router-dom';
import fastDeepEqual from 'fast-deep-equal';

import {useTaxonomyContext} from '../Taxonomy';

import type {NodeResultType} from '../../back/read/getNode';
import { characters } from '../../back/constants';
import {saveNodeInfo} from '../preloads';

import NodeOtherInfo from './fields/NodeOtherInfo';
import NodeComments from './fields/NodeComments';
import NodeName from './fields/NodeName';

type Props = {
    node: NodeResultType['node'];
    childrenNode: NodeResultType['children'];
    index:number;
}

const NodeInfo = ({node, childrenNode, index}:Props) => {
    const [updatedNode, setUpdatedNode] = useState(node)
    const [parentsSearchTerm, setParentsSearchTerm] = useState('');
    const [childrenSearchTerm, setChildrenSearchTerm] = useState('');


    const {parentNamesWithLanguageCode, otherInfo, comments, languages, nodeNameStringWithLanguageCode } = updatedNode
    const {context} = useTaxonomyContext()

    const childrenNames = (childrenNode||[]).filter((childItem) => {
        const {parentNamesWithLanguageCode} = childItem;
        return parentNamesWithLanguageCode.includes(nodeNameStringWithLanguageCode)
    } ).map((childItem ) => childItem.nodeNameStringWithLanguageCode).sort()

    
    const langsToShow = languages[context.languageCode]
    const childrenNamesToShow = !childrenSearchTerm?childrenNames:childrenNames.filter(childItem => childItem.toLowerCase().includes(childrenSearchTerm.toLowerCase()))
    const parentsNamesToShow = !parentsSearchTerm?[...parentNamesWithLanguageCode].sort():[...parentNamesWithLanguageCode].sort().filter(parentItem => parentItem.toLowerCase().includes(parentsSearchTerm.toLowerCase()))

    const nodeUpdate = <Key extends keyof NodeResultType['node'],>(key: Key, newValue:NodeResultType['node'][Key]) => {
        setUpdatedNode((prev) => {
            const newNode = {...prev};
            newNode[key] = newValue;
            return newNode;
        })
    }

    const onChangeLocalization = (newValue:string,index:number) =>{
        if(newValue.includes(characters.taxonomySeparator)) return; // TODO separator, special characters

        setUpdatedNode((prev) => { 
            const newNode = {...prev};
            const newLanguages = {...newNode.languages};
            const newLocalized = {...newLanguages[context.languageCode]}
            const newLocalizedValue = [...newLocalized.value];
            newLocalizedValue[index] = newValue;


            newLocalized.value = newLocalizedValue;
            newLanguages[context.languageCode] = newLocalized;
            newNode.languages = newLanguages;
            return newNode;
        })
    }

    const hasChanged = !fastDeepEqual(node, updatedNode); // TODO need to update this so it doesn't take into account name change
    
    const onSaveNodeInformation = () => {
        const {taxonomy} = context;
        saveNodeInfo({taxonomy, 
            nodeNameStringWithLanguageCode,
            index:0,
            newNode: updatedNode
        }).then(() => console.log('exito ....')).catch(() => console.log('fracaso ,......')) // FIXME TODO remove
    }

    return (
    <>
    <div>
        <div>
            <h2>Node Name</h2>
        <NodeName 
          nodeNameStringWithLanguageCode={nodeNameStringWithLanguageCode}
          updateNodeName={(newNodeName)=> nodeUpdate('nodeNameStringWithLanguageCode', newNodeName)}
          index={index}
          parentNamesWithLanguageCode={node.parentNamesWithLanguageCode}
        />
        </div>
            </div>


            <div>
            <h3>Languages</h3>

{langsToShow?.value.map( (synonymItem, index) => <input key={index} value={synonymItem} onChange={(event) => onChangeLocalization(event.target.value, index)}/>)}

<button onClick={() => onChangeLocalization('', langsToShow.value.length)}>Add synonym</button>





            </div>


        <div>
            <h3>Comments</h3>
            
            <NodeComments comments={comments} updateComments={(newComments)=> nodeUpdate('comments', newComments)}/>

        </div>
        <div>
            <h3>Other info </h3>
   
   <NodeOtherInfo nodeOtherInfo={otherInfo} updateNodeOtherInfo={(newValue) => nodeUpdate('otherInfo', newValue)}/>
        </div>
        <div>
            
        </div>
        <div>
            {hasChanged && 
            <button onClick={onSaveNodeInformation}>Save</button>
            }
        </div>
        <div>
            {
parentNamesWithLanguageCode.length > 0 &&<>
                <h3>Parents</h3>
                <div>
                    {
                       parentsNamesToShow.length > 4 &&<>
                       <label htmlFor='search-parents-input'>Search</label>
                       <input type='text' id='search-parents-input' value={childrenSearchTerm} onChange={(event)=> setParentsSearchTerm(event.target.value)}/>
                       </> 
                    }
                </div>
            <div>{parentsNamesToShow.map(parentItem => <div><Link to={encodeURI(`/${context.taxonomy}/${parentItem}`)}>{parentItem}</Link></div>)}</div>
</>
            }
            
            {childrenNames.length > 0 &&<>
                <h3>Children</h3>
                
                <div>
                {
                       childrenNamesToShow.length > 4 &&<>
                     <label htmlFor='search-children-input'>Search</label>
                     <input type='text' id='search-children-input' value={childrenSearchTerm} onChange={(event)=> setChildrenSearchTerm(event.target.value)}/>
                       </> 
                    }
                </div>
            <div>{childrenNamesToShow
            .map(childItem => <div><Link to={encodeURI(`/${context.taxonomy}/${childItem}`)}>{childItem}</Link></div>)}</div>
            </>}
        </div>
    </>
        )
}

export default NodeInfo;'['