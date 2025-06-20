import React,{ createContext, useEffect, useState, useContext,ReactNode} from 'react'
import {
    doc,
    getDoc,
    setDoc,
    }from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin,statusCodes,} from '@react-native-google-signin/google-signin';
import {log,recordError,setAttributes,setUserId} from '@react-native-firebase/crashlytics'
import { db,auth,functions, crashlytics, messaging, UsersRef } from './FirebaseConfig'
import {httpsCallable} from '@react-native-firebase/functions'
import notifee from '@notifee/react-native'
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, } from '@react-native-firebase/auth';
export const AuthContext = createContext<any>(null);

type User = {
    name?:string,
    username?:string,
    email?:string,
    userId?:string,
    profileUrl?:string
    
}

interface AuthContextProviderProps  {
    children: ReactNode;
  }
  
export const AuthContextProvider = ({children}:AuthContextProviderProps) => {
    const [user, setUser] = useState<User | {}>({})
    const [loading,setLoading] = useState<boolean>(false)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    useEffect(() => {
        let tokenrefresh = () => {};
        const unsub = onAuthStateChanged(auth,async (user: unknown | any) => {
            log(crashlytics,'Auth Context: Auth State Change')
            if(user){
                setIsAuthenticated(true)
                const docRef = doc(db,'users',user.uid);
                const currentUserRef = await getDoc(docRef)
                const firestoreData = currentUserRef.data();
                setUser({
                    uid: user.uid,
                    email: user.email,
                    username: firestoreData?.username,
                    userId: firestoreData?.userId,
                    profileUrl:firestoreData?.profileUrl
                });
                try{
                    log(crashlytics, 'FCM Token')
                    await notifee.requestPermission();
                    const token = await messaging.getToken();
                    if (!token) throw new Error('Failed to get FCM token');      
                    await setDoc(doc(UsersRef,user.uid),{
                      token:token
                    },{merge:true})
                    tokenrefresh = messaging.onTokenRefresh(async (newtoken) => {
                        try{
                            log(crashlytics, 'FCM Token Refreshed')
                            await setDoc(doc(UsersRef,user.uid),{
                                token:newtoken
                            },{merge:true})
                        }catch(error:unknown | any){
                            recordError(crashlytics,error)
                        }
                    })
                  }catch(error: unknown | any){
                    recordError(crashlytics,error)
                    console.error('Error grabbing token:',error)
                    setLoading(false)
                  }
                await AsyncStorage.setItem('authUser',user?.uid)
            }else{
                setIsAuthenticated(false)
                setUser({})
                setLoading(false)
            }
        })
        return () => {
            unsub()
            tokenrefresh()
        }
    },[])


    const login = async (email:string,pasword:string) => {
        log(crashlytics,'Auth Context: Login')
        setLoading(true)
        try{
            const response = await signInWithEmailAndPassword(auth,email,pasword)
            await Promise.all(
                [
                setUserId(crashlytics,response.user.uid),
                setAttributes(crashlytics,{
                    user_id:response.user.uid,
                })
            ])
            return {success:true}
        }catch(error: unknown | any){
            recordError(crashlytics,error)
            console.error(`Error logging in:${error}`)
        }finally{
            setLoading(false)
        }
    }

    // const googleSignIn = async () => {
    //     try {
    //         await GoogleSignin.hasPlayServices();
    //         await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    //         const signInResult = await GoogleSignin.signIn();
    //         let idToken = signInResult.data?.idToken;
    //         if (!idToken) {
    //             idToken = signInResult.idToken;
    //         }
    //         if (!idToken) {
    //             throw new Error('No ID token found');
    //         }
    //         const googleCredential = auth.GoogleAuthProvider.credential(signInResult.data.token);
    //         return auth().signInWithCredential(googleCredential);
    //       } catch (error) {
    //         if (isErrorWithCode(error)) {
    //           switch (error.code) {
    //             case statusCodes.IN_PROGRESS:
    //               break;
    //             case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
    //               break;
    //             default:
    //           }
    //         } else {
    //         }
    //       }
        
    // }

    const logout = async () => {
        log(crashlytics,'Auth Context: Logout')
        try{
            await signOut(auth);
            await AsyncStorage.removeItem('authUser')
            return {success:true,}
        }catch(error:unknown | any){
            recordError(crashlytics,error)
            return {success:false, message: error.message}
        }
    }
    const register = async (username:string,email:string,password:string) => {
        log(crashlytics,'Auth Context: Register')
        try{
            const response = await createUserWithEmailAndPassword(auth,email,password)
            const newUser = httpsCallable(functions,'newUser')
            await newUser({
                username:username,
                userId:response?.user?.uid
            }).then(result => {
                console.log(result)
            }).catch(error => {
                console.error(error)
            })
            setUserId(crashlytics,response.user.uid),
            setAttributes(crashlytics,{
                user_id:response.user.uid,
            })
            await AsyncStorage.setItem('jusRegistered','true')
            return {success:true, data: response?.user}
        }catch(error:unknown | any){
            recordError(crashlytics,error)
            console.error(`${error}`)
            return {success:false, msg: error.message}
        }   
    }
    const resetpassword = async (email:string) => {
        try{
            await sendPasswordResetEmail(auth,email)
            return { success: true, message: 'Password reset email sent successfully.' }
        }catch(e){
            console.error(e)
        }
    }
    return (
        <AuthContext.Provider value={{user,isAuthenticated,login,register,logout,resetpassword,}} >
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => {
    const value = useContext(AuthContext);
    if(!value){
        throw new Error('must use Auth context')
    }
    return value
}



