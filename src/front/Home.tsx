
import { Link} from 'react-router-dom';
import { taxonomies } from '../shared/constants';

const taxonomiesSorted = [...taxonomies].sort()

const Home = () => {

    return (<div>
        <h1>Please select a taxonomy</h1>
        <div>
        {taxonomiesSorted.map((taxonomyItem)=> <div key={taxonomyItem}>
             <Link to={`/${taxonomyItem}`} >{taxonomyItem.replace(/[_/.]/g, ' ')}</Link>
             </div>
        )}
    </div>
    </div>
    )
    }

export default Home;