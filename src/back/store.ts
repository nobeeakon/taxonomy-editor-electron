import fs from 'fs';
import {app} from 'electron';
import path from 'path';

class Store<DataGeneric extends object> {
    data:DataGeneric;
    path:string;

    constructor(fileName:string,defaultData:DataGeneric) {
        this.path = path.join(app.getPath('userData'), `${fileName.replace(/\s/g,'_')}.json` )
        this.data = getData(this.path, defaultData);
    }

    get({key}:{key:keyof DataGeneric}) {
        return this.data[key]
    }

    set<Key extends keyof DataGeneric>({key,newValue}:{key:Key; newValue:DataGeneric[Key]}){
        this.data[key] = newValue;
        fs.writeFileSync(this.path, JSON.stringify(this.data))
    }
}

function getData<DataGeneric>(filePath:string, defaultData:DataGeneric):DataGeneric {
    if (fs.existsSync(filePath)) {
            try {
                const storedData = JSON.parse(fs.readFileSync(filePath).toString());
                if (storedData && Object.keys(storedData).length !== 0) {
                    return storedData as DataGeneric
                } 
                return defaultData;
            } catch (error) {
                console.error(error);
                return defaultData
            }
        }
        return defaultData

}


export default Store;