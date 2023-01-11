import {Fragment} from 'react';
import { Link } from 'react-router-dom';

import type {SimpleTextSearch} from '../../back/read/textSearch';
import {useTaxonomyContext} from '../Taxonomy'

type Props = {textResult:SimpleTextSearch; searchString:string}


const TextRow = ({row, searchString}:{searchString:string, row:string}) => {
    if (!row.includes(searchString)) return <div >{row}</div>

   const regexp = new RegExp(searchString, 'ig')
   const matches = [...row.matchAll(regexp)]
    const rowSplit = row.split(regexp);


    return <div >{rowSplit.map((word, index) => <Fragment key={index}>{word}{matches[index] && <mark>{matches[index]}</mark>}</Fragment> )}</div>
}

const ResultItem = ({textResult, searchString}:Props) => {
    const {context} = useTaxonomyContext()

    const {nodeNameStringWithLanguageCode, text, fileRows } = textResult;

    
    return (<div style={{overflow:'auto'}}>
        <hr/>
        {nodeNameStringWithLanguageCode && <Link to={encodeURI(`/${context.taxonomy}/${(nodeNameStringWithLanguageCode)}`)} >{nodeNameStringWithLanguageCode}</Link>}
        <div >
            {text.map(fileRow => <TextRow key={fileRow} row={fileRow} searchString={searchString}/>)}
        </div>
        </div>)
};

export default ResultItem;