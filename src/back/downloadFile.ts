import fs from 'fs';
import axios from 'axios';

import { getTaxonomyFilePath } from './utils';



import {TaxonomyType, taxonomies} from '../shared/constants';

type DownloadFileArgs = {
  gitForkUrl:`${string}/${string}`;
  taxonomy: TaxonomyType;
  /** download even if already downloaded before */
  forceDownload: boolean;
}

// TODO finish this stuff
const downloadFile = ({gitForkUrl,taxonomy, forceDownload}:DownloadFileArgs) =>{

  if (!taxonomies.includes(taxonomy)) {
    return Promise.reject(new Error('Invalid taxonomy'))
  }

  const filePath = getTaxonomyFilePath(taxonomy)
  
  if( !forceDownload && fs.existsSync(filePath)) {
    return;
  }

  const url = `https://raw.githubusercontent.com/${gitForkUrl}/main/taxonomies/${taxonomy}.txt`

  return axios(url)
  .then(({ data }) => { // TODO check if this works properly
    fs.writeFileSync(
      filePath, 
      data
      );
    });
} 

type DownloadFileType  = typeof downloadFile;
type ReturnDownloadFileType = ReturnType<DownloadFileType>

export {DownloadFileArgs, ReturnDownloadFileType, DownloadFileType  };
export default downloadFile;