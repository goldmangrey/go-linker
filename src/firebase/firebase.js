import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyA8fyXbOx8uP9hc-WfcWovI3NotN1zcoSQ",
    authDomain: "go-link-e35a6.firebaseapp.com",
    projectId: "go-link-e35a6",
    storageBucket: "go-link-e35a6.firebasestorage.app",
    // storageBucket: "go-link-e35a6.appspot.com",
    messagingSenderId: "424925126202",
    appId: "1:424925126202:web:4eeffadfcce7f60dc09f03",
    measurementId: "G-0FHS15PC8R"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
