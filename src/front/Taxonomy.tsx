
import {useState, createContext, useContext,  useEffect} from 'react';
import { Link, useParams, Outlet} from 'react-router-dom';
import ISO6391 from 'iso-639-1'

import { taxonomies, TaxonomyType } from '../shared/constants';
import {downloadFile, buildGraph, setSettings,getSettings} from './preloads';

const taxonomiesArray = [...taxonomies] as string[];


type TaxonomyContextType = {
    taxonomy: null|TaxonomyType;
    languageCode: string;
}
type ContextDispatch = React.Dispatch<React.SetStateAction<TaxonomyContextType>>


const TaxonomyContext = createContext<{context:TaxonomyContextType;setContext:ContextDispatch}>(null)
export const useTaxonomyContext = () =>  {
    const value = useContext(TaxonomyContext);

    if (!value ) {
        throw new Error('Please use useTaxonomyContext inside its context provider')
    }

    return value;
}

type StatusType = 'idle'|'fetching'|'building_graph'|'success'|'error';

const Taxonomy = () => {
    const {taxonomy} = useParams();
    const [status, setStatus] = useState<StatusType>('idle');
    const [taxonomyContextState, setTaxonomyContextState] = useState<TaxonomyContextType>({taxonomy:null, languageCode:'en'}); // TODO fix this, this is duplicating code


    const isValidTaxonomy = taxonomiesArray.includes(taxonomy)
    const castedTaxonomy = taxonomy as TaxonomyType; // TODO FIXME


    useEffect(function getLanguageCode() {
        // TODO promisify type
        getSettings({key:'languageCode'}).then(res => setTaxonomyContextState((prev)=>({...prev,languageCode:res})))

    }, [])

    useEffect(function createGraph(){
        if (!isValidTaxonomy) return;
        
        setTaxonomyContextState((prev)=> ({...prev, taxonomy: castedTaxonomy}))

        const downloadAndBuildGraph = async() => {
            setStatus('fetching')
            try {
                await downloadFile({taxonomy:castedTaxonomy, gitForkUrl: 'nobeeakon/openfoodfacts-server', forceDownload:false})
                setStatus('building_graph')
                await buildGraph({taxonomy:castedTaxonomy, forceSave:true});
                setStatus('success')
                
            } catch(error) {
                console.error(error.message??'unable to download the file')
                setStatus('error')
            }
        }

        downloadAndBuildGraph()

        

    }, [isValidTaxonomy, castedTaxonomy])



     const onLanguageChange = (event:React.ChangeEvent<HTMLSelectElement>) =>{
        const languageCode = event.target.value;

        if (ISO6391.validate(languageCode)) {
            setTaxonomyContextState((prev)=>({...prev,languageCode}));
            setSettings({key:'languageCode',newValue:languageCode});
        }

    }

        //  TODO refresh data: download again and everything


    if (!isValidTaxonomy) return <div>Not a valid taxonomy</div>;

    if (status === 'error') return <div>Failed to download the taxonomy 
            <Link to='/'>back to home</Link>
    </div>;

    return (<div>
    <h2>{taxonomy.toUpperCase()} </h2>
   




        {status !== 'success'?<><div> <Link to='/'>Home</Link></div><div>{status}</div></> :<>
        <div style={{display:'flex', justifyContent:'space-between'}}>
        <Link to='/'>Home</Link>
        <Link to={`/${taxonomy}/search`}>search</Link>
        <div>
            <label htmlFor='language-select'>Language</label>
            <select value={taxonomyContextState?.languageCode}
            id='language-select' onChange={onLanguageChange}>{ISO6391.getAllNames().map(nameItem => <option key={nameItem} value={ISO6391.getCode(nameItem)}>{nameItem}</option>)}</select>
        </div>
        </div>
        <TaxonomyContext.Provider value={{context:taxonomyContextState, setContext:setTaxonomyContextState}}>
            <Outlet />
        </TaxonomyContext.Provider>
        </>
        }

    </div>)
}

export default Taxonomy;