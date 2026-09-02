import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

export type Video = {
    [key: string]: any;
};

const generateUploadUrl = httpsCallable(functions, 'generateUploadUrl');
const getVideosFunction = httpsCallable(functions, 'getVideos');

export async function uploadVideo(file: File) {

    const response: any  = await generateUploadUrl({
        fileExtension: file.name.split('.').pop()
    });

    //Upload the file via de signed Url
    const uploadResult = await fetch(response?.data?.url, {
        method: 'PUT',
        body: file,
        headers: {
            'Content-Type': file.type
        },
        cache: 'no-cache'
    });
    
    return uploadResult;
}

export async function getVideos() {
    const response = await getVideosFunction();
    return response.data as Video[];
}