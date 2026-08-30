import { Storage } from '@google-cloud/storage';

const storage = new Storage({
    projectId: 'yt-clone-43ebc',
});

async function test() {
    try {
        console.log('Testing raw bucket...');

        const [files] = await storage
            .bucket('aa-yt-raw-videos')
            .getFiles({ maxResults: 1 });

        console.log('Raw bucket works:', files.map(file => file.name));

        console.log('Testing processed bucket...');

        const [processedFiles] = await storage
            .bucket('aa-yt-processed-videos')
            .getFiles({ maxResults: 1 });

        console.log(
            'Processed bucket works:',
            processedFiles.map(file => file.name)
        );

    } catch (error) {
        console.error('Storage test failed:', error);
    }
}

test();