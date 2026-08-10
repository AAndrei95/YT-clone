import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';


const storage = new Storage();

const rawVideoBucketName = process.env.RAW_VIDEO_BUCKET_NAME || 'aa-yt-raw-videos';
const processedVideoBucketName = process.env.PROCESSED_VIDEO_BUCKET_NAME || 'aa-yt-processed-videos';

const localRawVideoPath = process.env.LOCAL_RAW_VIDEO_PATH || './raw-videos';
const localProcessedVideoPath = process.env.LOCAL_PROCESSED_VIDEO_PATH || './processed-videos';

/**
 * 
 * Creates the local direcotries for raw and processed videos
 */
export function setupDirectory() {
    ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .videoFilters("scale=-2:360") // 360p
        .on('end', () => {
            console.log('Processing finished successfully');
            resolve();
        })
        .on('error', (err) => {
            console.log('An error occurred: ' + err.message);
            reject(err);    
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

/**
 * @param fileName - The name of the file to download form
 * {@link rawVideoBucketName} bucket into {@link localRawVideoPath} directory.
 * @returns A promise that resolves when the video has been downloaded.
 */
export async function downloadRawVideo(fileName:string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({destination: `${localRawVideoPath}/${fileName}`});
    console.log('gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.');
}

/**
 * @param fileName - The name of the file to upload from
 * {@link localProcessedVideoPath} directory into {@link processedVideoBucketName} bucket.
 * @returns A promise that resolves when the video has been uploaded.
 */
export async function uploadProcessedVideo(fileName:string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName,
    });
    console.log('${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.');

    await bucket.file(fileName).makePublic(); // Make the uploaded file public
}

/**
 * @param fileName - The name of the file to delete from
 * {link localRawVideoPath} directory.
 * @returns A promise that resolves when the video has been deleted.
 */
export function deleteRawVideo(fileName:string) {
    return deleteLocalFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from
 * {link localProcessedVideoPath} directory.
 * @returns A promise that resolves when the video has been deleted.
 */
export function deleteProcessedVideo(fileName:string) {
    return deleteLocalFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
export async function deleteLocalFile(filePath: string) {
    return new Promise<void>((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error('Error deleting file at ${filePath}:', err);
                    reject(err);
                } else {
                    console.log('File at ${filePath} deleted successfully.');
                    resolve();
                }
            });
        } else {
            console.log('File not found at ${filePath}, skipping deletion.');
            resolve();
        }
    });
}

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} directoryPath - The path of the directory to ensure exists.
 */
function ensureDirectoryExists(directoryPath: string) {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true }); // recursive: true ensures that parent directories are created if they don't exist
        console.log('Directory created at ${directoryPath}');
    }
}