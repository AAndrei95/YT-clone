'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VideoPlayer() {
    const videoPrefix =
        'https://storage.googleapis.com/aa-yt-processed-videos/';

    const videoSrc = useSearchParams().get('v');

    if (!videoSrc) {
        return <div>Video not found.</div>;
    }

    return (
        <video controls src={videoPrefix + videoSrc}></video>
    );
}

export default function Watch() {
    return (
        <div>
            <h1>Watch Page</h1>

            <Suspense fallback={<div>Loading video...</div>}>
                <VideoPlayer />
            </Suspense>
        </div>
    );
}