import {getApp} from "@react-native-firebase/app";
import { getFirestore ,collection} from "@react-native-firebase/firestore";
import { getMessaging } from "@react-native-firebase/messaging";
import {getAuth}from '@react-native-firebase/auth';
const app = getApp();
export const auth = getAuth(app)
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export const PostRef = collection(db,'posts')
export const ChatRoomsRef = collection(db,'chat-rooms')