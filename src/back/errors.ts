
export const GenericErrors = {
    unknownError: 'unknown-01',
 };
 

export const FileErrorCodes = {
   unavailableTaxonomyFile : 'file-01',
   unavailableGraphFile : 'file-02',
};



/** @returns Error with error.message:{message, code} */
export const buildError = ({message, code}:{message:string;code:string}) => {
    return new Error(JSON.stringify({message, code}))
 }

 /** parses error message  */
 export const parseErrorMessage = (error:Error):{message:string;code:string} => {
    const errorMessageString = error?.message;

    const unknownError = {message: 'unknown error', code: GenericErrors.unknownError}

    if (!errorMessageString) return unknownError;

    try {
        const messageObj = JSON.parse(errorMessageString)
        if (messageObj?.code && typeof messageObj.code === 'string' && messageObj?.message && typeof messageObj?.message === 'string')  {
            return {message: messageObj.message, code: messageObj.code}
        }
        else{
            return unknownError
   
           }
    } catch(error){
        return unknownError;
    }
 }


 /** 
  * Error parser for the front end. Needed as Electron adds some default message
  *  */
 export const parseBackEndErrors = (error:Error) => {
    const errorMessageString = error?.message;

    const unknownError = {message: 'unknown error', code: GenericErrors.unknownError}

    if (!errorMessageString) return unknownError;

    try {
        //  Errors are returned as strings like: 
        // `Error invoking remote method 'saveNodeName': Error: {"message":"Unable to save new name. Other nodes already share some synonyms with it.","code":"update-name-02"}`      
        
        const ERROR_STRING = `Error: `
        const errorPosition = errorMessageString.indexOf(ERROR_STRING)


        const messageObj = JSON.parse(errorMessageString.slice(errorPosition).replace(ERROR_STRING, ''))

        if (messageObj?.code && typeof messageObj.code === 'string' && messageObj?.message && typeof messageObj?.message === 'string')  {
            return {message: messageObj.message, code: messageObj.code}
        } else{
         return unknownError

        }
    } catch(error){
        return unknownError
    }
 }