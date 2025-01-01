// Import the functions you need from the SDKs you need
import { initializeApp,browserLocalPersistence} from "firebase/app";
import { initializeAuth,getReactNativePersistence  } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getFirestore,collection } from 'firebase/firestore';
import { 
  apiKey,
  authDomain,
  projectId,
  storageBucket,
  messagingSenderId,
  appId,
  measurementId,
} from '@env';

//mport { getAnalytics } from "firebase/analytics";
// TOD: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey:apiKey,
  authDomain:authDomain,
  projectId:projectId,
  storageBucket:storageBucket,
  messagingSenderId:messagingSenderId,
  appId:appId,
  measurementId:measurementId
};



export const FIREBASE_APP = initializeApp(firebaseConfig);
export const auth = initializeAuth(FIREBASE_APP,{
    persistence: getReactNativePersistence(AsyncStorage)
}
);
export const db = getFirestore(FIREBASE_APP)
export const userRef = collection(db,'users')
export const roomRef = collection(db,'rooms')
