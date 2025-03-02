import React,{ createContext, useEffect, useState, useContext,ReactNode} from 'react'
import {
    doc,
    getDoc,
    }from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin,statusCodes,} from '@react-native-google-signin/google-signin';
import {log,recordError,setAttributes,setUserId} from '@react-native-firebase/crashlytics'
import { db,auth,functions, crashlytics } from 'FIrebaseConfig';
import {httpsCallable} from '@react-native-firebase/functions'
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword, } from '@react-native-firebase/auth';
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
        const unsub = auth.onAuthStateChanged(async (user) => {
            log(crashlytics,'Auth COntext: Auth State Change')
                    if(user){
                        setIsAuthenticated(true)
                        const docRef = doc(db,'users',user.uid);
                        const currentUserRef = await getDoc(docRef)
                        if (currentUserRef.exists) {
                            const firestoreData = currentUserRef.data();
                            await Promise.all(
                                [
                                setUserId(crashlytics,user.uid),
                                setAttributes(crashlytics,{
                                    user_id: user.uid,
                                    username: firestoreData?.username,
                                })
                            ])
                            setUser({
                                uid: user.uid,
                                email: user.email,
                                username: firestoreData?.username,
                                userId: firestoreData?.userId,
                                profileUrl:firestoreData?.profileUrl
                            });
                        }
                        await AsyncStorage.setItem('authUser',user?.uid)
                    }else{
                        setIsAuthenticated(false)
                        setUser({})
                    }
    })
        return () => unsub ()
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
                    //username:response.user?.displayName
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
            await auth.signOut();
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
            await Promise.all(
                [
                setUserId(crashlytics,response.user.uid),
                setAttributes(crashlytics,{
                    user_id:response.user.uid,
                })
            ])
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
        <AuthContext.Provider value={{user,isAuthenticated,login,register,logout,resetpassword}} >
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



