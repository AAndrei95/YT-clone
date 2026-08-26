import * as functions from "firebase-functions/v1";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {getStorage} from "firebase-admin/storage";
import {onCall, HttpsError} from "firebase-functions/v2/https";

initializeApp();

const firestore = getFirestore("yt-clone-43ebc");

const rawVideoBucketName =
  process.env.RAW_VIDEO_BUCKET_NAME || "aa-yt-raw-videos";

export const createUser = functions
  .region("europe-west2")
  .auth.user()
  .onCreate((user) => {
    const userInfo = {
      uid: user.uid,
      email: user.email,
      photoUrl: user.photoURL,
    };

    firestore.collection("users").doc(user.uid).set(userInfo);
    logger.info(`User Created: ${JSON.stringify(userInfo)}`);
    return;
  });

export const generateUploadUrl = onCall(
  {
    region: "europe-west2",
    maxInstances: 1,
  }, async (request) => {
    // Check if user is authenticated
    if (!request.auth) {
      throw new HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const storage = getStorage();
    const bucket = storage.bucket(rawVideoBucketName);

    // Generate unique filename
    const fileName =
      `${request.auth.uid}-${Date.now()}.${request.data.fileExtension}`;

    // Get a v4 signed URL from upload file
    const [url] = await bucket.file(fileName).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return {url, fileName};
  });
