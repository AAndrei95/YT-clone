// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAC5E8mz5DXuNzBIDEdRpsTXsCiAEupBGc",
  authDomain: "yt-clone-43ebc.firebaseapp.com",
  projectId: "yt-clone-43ebc",
  appId: "1:530259864742:web:7e37498091b1cec2581867"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 * Signs the user in with Google using a popup.
 * @returns A promise that resolves with the signed-in user.
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

/**
 * Signs the user out.
 * @returns A promise that resolves when the user is signed out.
 */
export function signOut() {
  return auth.signOut();
}
 
/**
 * Triggers a callback whenever the authentication state changes (e.g., user signs in or out).
 * @returns A function to unsubscribe from the auth state changes.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}