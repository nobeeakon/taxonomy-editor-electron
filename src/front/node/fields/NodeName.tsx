import { useState } from 'react';
import ISO6391 from 'iso-639-1'

import { characters } from '../../../back/constants';
import {saveNodeName} from '../../preloads';
import {useTaxonomyContext} from '../../Taxonomy';
import { parseBackEndErrors } from '../../../back/errors';



type EditNodeNameProps = {
    nodeNameStringWithLanguageCode: string;
    onSaveNodeName: (languageCode:string, names:string[]) => void;
    onCancel: () => void;
}

/** @returns true if is valid , false otherwise */
const validateNewName = ( languageCode: string, nodeNames: string[]) => {
    const filteredNodeNames = nodeNames.map(nameItem => nameItem.trim()).filter(Boolean);

    
    if (!languageCode || filteredNodeNames.length === 0) return false;

    return true;
} 

const EditNodeName = ({nodeNameStringWithLanguageCode, onSaveNodeName, onCancel}:EditNodeNameProps) => {
    const [editNodeName, setEditNodeName] = useState(() =>  {
      const [languageCode, nodeNamesString] =  nodeNameStringWithLanguageCode.split(characters.propsSeparator)
      const nodeNames = nodeNamesString.split(characters.taxonomySeparator)
      return {languageCode, nodeNames}
    });
    
    const onChangeLanguage = (newLanguageCode: string) => {
        // show a dialog to confirm
        if(confirm('if you change the language you will loose the current name')) {
            const newEditNodeName = {languageCode: newLanguageCode,  nodeNames: ['']}
            setEditNodeName(newEditNodeName)
        } 
    }

    const onChangeNames = (newValue: string, index:number) => {
        const newNames = [...editNodeName.nodeNames] 
        newNames[index] = newValue;
        const newEditNodeName = {...editNodeName, nodeNames: newNames}
        setEditNodeName(newEditNodeName)
    }



    const onUpdateNodeName = () => {
        if(!validateNewName(editNodeName.languageCode, editNodeName.nodeNames)) return;

        const filteredNodeNames = editNodeName.nodeNames.map(nameItem => nameItem.trim()).filter(Boolean);
        
        onSaveNodeName(editNodeName.languageCode, filteredNodeNames);
    }

        return <div>
            <div>

            <select value={editNodeName.languageCode}
                 onChange={(event) => onChangeLanguage(event.target.value)}
                 >
                    {ISO6391.getAllCodes().map(languageCodeItem => <option key={languageCodeItem} value={languageCodeItem}
                    >{ISO6391.getName(languageCodeItem)}</option>)}
                </select>
                    {editNodeName.nodeNames
                    .map((nameItem, nameIndex) => <input onChange={(event) => onChangeNames(event.target.value, nameIndex) }
                    value={nameItem} type="text" />
                    )
                }
                    <button onClick={() => onChangeNames('', editNodeName.nodeNames.length)}>Add synonym</button>
                </div>
                <div>
                <button onClick={onUpdateNodeName} disabled={!validateNewName(editNodeName.languageCode, editNodeName.nodeNames)}>Save</button>
                    <button onClick={onCancel}>Cancel</button>
                </div>
        </div>
    
}

type NodeNameProps = {
    nodeNameStringWithLanguageCode: string;
    updateNodeName: (newNodeName:string) => void;
    index:number;
    parentNamesWithLanguageCode: string[];
}





const NodeName = ({nodeNameStringWithLanguageCode, updateNodeName, index, parentNamesWithLanguageCode}:NodeNameProps) => {
    const [isEditNodeName, setIsEditNodeName] = useState(false)
    const {context} = useTaxonomyContext()
    
    const onSaveNodeName =(newLanguageCode:string, newNodeNames:string[]) => {
        const newNodeNameWithLanguageCodeString = `${newLanguageCode}${characters.propsSeparator}${newNodeNames.join(characters.taxonomySeparator)}`;

        const {taxonomy} = context;
        saveNodeName({taxonomy, 
            nodeNameStringWithLanguageCode,
            newLanguageCode,
            newNodeNames,
            index,
            parentNamesWithLanguageCode
        }).then(() => {
            updateNodeName(newNodeNameWithLanguageCodeString);
            setIsEditNodeName(false)
            console.log('exito ....')
        } 
        ).catch((error) =>  {
            const errorInfo = parseBackEndErrors(error);
            console.error(errorInfo)
        }) // FIXME TODO remove

    }
    
    const onCancel = () => setIsEditNodeName(false)

    if (!isEditNodeName) return <>   {nodeNameStringWithLanguageCode} <button onClick={() => setIsEditNodeName(true)}>Edit</button>
        </>


        return <EditNodeName nodeNameStringWithLanguageCode={nodeNameStringWithLanguageCode} onSaveNodeName={onSaveNodeName} onCancel={onCancel}/>
    
}

export default NodeName;