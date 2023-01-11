import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CytoscapeComponent from 'react-cytoscapejs';

import {getNode} from '../preloads';
import type {NodeResultType} from '../../back/read/getNode';
import { characters } from '../../back/constants';

import TargetNodeInfo from './TargetNodeInfo'
import getCytoscape from './getCytoscape';
import {useTaxonomyContext} from '../Taxonomy';

type StatusType = 'idle'|'loading'|'success'|'error'




const NodeInfo = () => {
    const [status, setStatus] = useState<StatusType>('idle')
   
    const [nodeInfo, setNodeInfo] = useState<NodeResultType[]>([])
    const {nodeName} = useParams();
    const {context} = useTaxonomyContext()
    const {taxonomy} = context;

    const castedNodeName = nodeName as `${string}:${string}`;
    useEffect(function fetNode() {
        if (!nodeName) return;

       if(nodeName.split(characters.propsSeparator).length !== 2){
           return
       } // the right format

        setStatus('loading')
        setNodeInfo([]);

        const getNodeInfo = async() => {
            try {
                const nodeInfo = await getNode({nodeName:castedNodeName})
                setNodeInfo(nodeInfo)
            } catch(err) {
                setStatus('error')
            }
        }


        getNodeInfo()
        setStatus('success')

    }, [taxonomy,castedNodeName ])



    return (
    <>
        {status !== 'success' && <div>  {status}</div>}
        <div>
            {nodeInfo.length === 0 &&  status === 'success' && <div> No node found </div>}
            {nodeInfo.length > 1 &&  status === 'success' && <div> Found: {nodeInfo.length} nodes. Please check if these are duplicates </div>}
            {nodeInfo.length > 0 &&  status === 'success' && <div> 
                 {nodeInfo.map((nodeItem, index) => <div key={`${index}-${nodeItem.node.nodeNameStringWithLanguageCode}`}>
                     <TargetNodeInfo node={nodeItem.node} childrenNode={nodeItem.children} index={index}/> 

        <CytoscapeComponent elements={getCytoscape(nodeItem)}
            layout={{name:'breadthfirst', directed:true}}
            wheelSensitivity={0.1}
        style={ { width: '600px', height: '600px', border:'1px solid red' } }/>
                     </div>)}
                     </div>
            }


        </div>
    </>
        )
}

export default NodeInfo;