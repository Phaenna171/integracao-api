import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getAuth } from "firebase/auth";

export const initializeFirebaseApp = () => {

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_apiKey,
        authDomain: process.env.NEXT_PUBLIC_authDomain,
        projectId: process.env.NEXT_PUBLIC_projectId,
        storageBucket: process.env.NEXT_PUBLIC_storageBucket,
        messagingSenderId: process.env.NEXT_PUBLIC_messagingSenderId,
        appId: process.env.NEXT_PUBLIC_appId,
        measurementId: process.env.NEXT_PUBLIC_measurementId,
        databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    };

    const app = initializeApp(firebaseConfig);
    const storage = getStorage(app);
    const database = getDatabase(app);
    const auth = getAuth(app);

    return { app, storage, database, auth };
}