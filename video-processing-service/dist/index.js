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
const express_1 = __importDefault(require("express"));
const storage_1 = require("./storage");
const firestore_1 = require("./firestore");
(0, storage_1.setupDirectory)();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.post('/process-video', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the bucket and filename from the Cloud Pub/Sub message
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }
    }
    catch (error) {
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');
    }
    const inputFileName = data.name;
    const outputFileName = `processed-${inputFileName}`;
    const videoId = inputFileName.split('.')[0];
    console.log("1. Checking Firestore...");
    if (!(yield (0, firestore_1.isVideoNew)(videoId))) {
        return res.status(400).send('Bad Request: video already processing or processed.');
    }
    else {
        console.log("3. Setting Firestore processing status...");
        yield (0, firestore_1.setVideo)(videoId, {
            id: videoId,
            uid: videoId.split('-')[0],
            status: 'processing'
        });
    }
    console.log("4. Firestore processing status set");
    console.log("5. Downloading raw video...");
    // Download the raw video from the Cloud Storage
    yield (0, storage_1.downloadRawVideo)(inputFileName);
    console.log("6. Raw video downloaded");
    // Convert the video to 360p
    console.log("7. Converting video...");
    try {
        yield (0, storage_1.convertVideo)(inputFileName, outputFileName);
        console.log("8. Video converted");
    }
    catch (error) {
        yield Promise.all([
            (0, storage_1.deleteRawVideo)(inputFileName),
            (0, storage_1.deleteProcessedVideo)(outputFileName)
        ]);
        console.error(error);
        return res.status(500).send('Internal Server Error: video processing failed.');
    }
    // Upload the processed video to the Cloud Storage
    console.log("9. Uploading processed video...");
    yield (0, storage_1.uploadProcessedVideo)(outputFileName);
    console.log("10. Processed video uploaded");
    console.log("11. Updating Firestore...");
    yield (0, firestore_1.setVideo)(videoId, {
        status: 'processed',
        filename: outputFileName
    });
    console.log("12. Firestore updated");
    yield Promise.all([
        (0, storage_1.deleteRawVideo)(inputFileName),
        (0, storage_1.deleteProcessedVideo)(outputFileName)
    ]);
    res.status(200).send('Video processed successfully.');
}));
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
