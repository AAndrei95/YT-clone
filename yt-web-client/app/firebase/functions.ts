import { exp } from 'firebase/firestore/pipelines';
import {getFunctions, httpsCallable} from 'firebase/functions';

const functions = getFunctions(undefined, 'europe-west2');

const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl');

export async function uploadVideo(file: File) {

    const response: any  = await generateUploadUrl({
        fileExtension: file.name.split('.').pop()
    });

    //Upload the file via de signed Url
    await fetch(response?.data?.url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        }
    });
    
    return; 
}