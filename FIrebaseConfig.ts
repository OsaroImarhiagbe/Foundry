import {getApp} from "@react-native-firebase/app";
import { getFirestore } from "@react-native-firebase/firestore";
import { getMessaging } from "@react-native-firebase/messaging";

const app = getApp();
export const db = getFirestore(app);
export const messaging = getMessaging(app);