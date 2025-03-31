import {getApp} from "@react-native-firebase/app";
import { getFirestore ,collection} from "@react-native-firebase/firestore";
import { getMessaging } from "@react-native-firebase/messaging";
import {getAuth}from '@react-native-firebase/auth';
import {getStorage} from '@react-native-firebase/storage'
import {getFunctions} from '@react-native-firebase/functions'
import {getCrashlytics} from '@react-native-firebase/crashlytics'
import { getPerformance} from '@react-native-firebase/perf';
import {getAnalytics} from '@react-native-firebase/analytics'
import {getDatabase, ref} from '@react-native-firebase/database';
const app = getApp();
export const auth = getAuth(app)
export const db = getFirestore(app);
export const database = getDatabase(app)
export const storage = getStorage(app)
export const functions = getFunctions(app)
export const messaging = getMessaging(app);
export const crashlytics = getCrashlytics()
export const perf = getPerformance(app)
export const analytics = getAnalytics(app)
export const PostRef = ref(database,'/posts')
export const ChatRoomsRef = collection(db,'chat-rooms')
export const UsersRef = collection(db,'users')
export const NotificationsRef = collection(db,'notifications')
export const ProjectRef = collection(db,'projects')
