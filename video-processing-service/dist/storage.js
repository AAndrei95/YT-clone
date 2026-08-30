"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDirectory = setupDirectory;
exports.convertVideo = convertVideo;
exports.downloadRawVideo = downloadRawVideo;
exports.uploadProcessedVideo = uploadProcessedVideo;
exports.deleteRawVideo = deleteRawVideo;
exports.deleteProcessedVideo = deleteProcessedVideo;
exports.deleteLocalFile = deleteLocalFile;
const storage_1 = require("@google-cloud/storage");
const fs_1 = __importDefault(require("fs"));
const fluent_ffmpeg_1 = __importDefault(require("fluent-ffmpeg"));
const storage = new storage_1.Storage();
const rawVideoBucketName = process.env.RAW_VIDEO_BUCKET_NAME || 'aa-yt-raw-videos';
const processedVideoBucketName = process.env.PROCESSED_VIDEO_BUCKET_NAME || 'aa-yt-processed-videos';
const localRawVideoPath = process.env.LOCAL_RAW_VIDEO_PATH || './raw-videos';
const localProcessedVideoPath = process.env.LOCAL_PROCESSED_VIDEO_PATH || './processed-videos';
/**
 *
 * Creates the local direcotries for raw and processed videos
 */
function setupDirectory() {
    ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);
}
/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
function convertVideo(rawVideoName, processedVideoName) {
    return new Promise((resolve, reject) => {
        (0, fluent_ffmpeg_1.default)(`${localRawVideoPath}/${rawVideoName}`)
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
console.log("Project:", process.env.GOOGLE_CLOUD_PROJECT);
console.log("Raw bucket:", rawVideoBucketName);
console.log("Processed bucket:", processedVideoBucketName);
function downloadRawVideo(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Downloading:");
        console.log("Bucket:", rawVideoBucketName);
        console.log("File:", fileName);
        yield storage.bucket(rawVideoBucketName)
            .file(fileName)
            .download({ destination: `${localRawVideoPath}/${fileName}` });
        console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`);
    });
}
/**
 * @param fileName - The name of the file to upload from
 * {@link localProcessedVideoPath} directory into {@link processedVideoBucketName} bucket.
 * @returns A promise that resolves when the video has been uploaded.
 */
console.log("Uploading:");
console.log("Bucket:", processedVideoBucketName);
function uploadProcessedVideo(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const bucket = storage.bucket(processedVideoBucketName);
        yield bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
            destination: fileName,
        });
        console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`);
        // await bucket.file(fileName).makePublic(); // Make the uploaded file public
    });
}
/**
 * @param fileName - The name of the file to delete from
 * {link localRawVideoPath} directory.
 * @returns A promise that resolves when the video has been deleted.
 */
function deleteRawVideo(fileName) {
    return deleteLocalFile(`${localRawVideoPath}/${fileName}`);
}
/**
 * @param fileName - The name of the file to delete from
 * {link localProcessedVideoPath} directory.
 * @returns A promise that resolves when the video has been deleted.
 */
function deleteProcessedVideo(fileName) {
    return deleteLocalFile(`${localProcessedVideoPath}/${fileName}`);
}
/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteLocalFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlink(filePath, (err) => {
                    if (err) {
                        console.error(`Error deleting file at ${filePath}:`, err);
                        reject(err);
                    }
                    else {
                        console.log(`File at ${filePath} deleted successfully.`);
                        resolve();
                    }
                });
            }
            else {
                console.log(`File not found at ${filePath}, skipping deletion.`);
                resolve();
            }
        });
    });
}
/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} directoryPath - The path of the directory to ensure exists.
 */
function ensureDirectoryExists(directoryPath) {
    if (!fs_1.default.existsSync(directoryPath)) {
        fs_1.default.mkdirSync(directoryPath, { recursive: true }); // recursive: true ensures that parent directories are created if they don't exist
        console.log(`Directory created at ${directoryPath}`);
    }
}
