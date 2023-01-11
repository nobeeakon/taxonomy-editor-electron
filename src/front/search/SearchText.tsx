import { useEffect, useState } from "react";
import {  useLocation } from "react-router-dom";

import SearchForm, {searchTextQueryParam} from "./SearchForm";
import { SimpleTextSearch } from "../../back/read/textSearch";
import {textSearch} from '../preloads';
import ResultItem from "./ResultItem";
import {useTaxonomyContext} from '../Taxonomy';

const SearchText = () => {
    const [results, setResults] = useState<SimpleTextSearch[]>([])
    const {search}  = useLocation();
    const searchParams = new URLSearchParams(search);
    const searchText = searchParams.get(searchTextQueryParam)
    const {context} = useTaxonomyContext()


    useEffect(() => {
        if (!searchText || !context.taxonomy  ) return;

        


        const getResults = async() => {
            setResults([])
            const result = await textSearch({searchText: searchText, taxonomy:context.taxonomy});
            setResults(result)
        }

        getResults()
    }, [searchText, context.taxonomy])


   return( <>
   <SearchForm/>
   <h2>{context.taxonomy}</h2>
<h2>Found: {results.length}</h2>
<pre>{results.map((resultItem, index) => <ResultItem key={index} textResult={resultItem} searchString={searchText}/>)}</pre>
</>
)
}

export default SearchText