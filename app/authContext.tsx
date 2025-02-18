import React,{ createContext, useEffect, useState, useContext,ReactNode} from 'react'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleSignin,statusCodes,} from '@react-native-google-signin/google-signin';
import crashlytics from '@react-native-firebase/crashlytics'
export const AuthContext = createContext<any>(null);

interface User {
    name?:string,
    username?:string,
    email?:string,
    userId?:string,
    profileUrl?:string
    
}

interface AuthContextProviderProps {
    children: ReactNode;
  }
  
export const AuthContextProvider = ({children}:AuthContextProviderProps) => {

    const [user, setUser] = useState<User | {}>({})
    const [loading,setLoading] = useState<boolean>(false)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    useEffect(() => {
        const unsub = auth().onAuthStateChanged(async (user) => {
            crashlytics().log('Auth COntext: Auth State Change')
                    if(user){
                        setIsAuthenticated(true)
                        const docSnap = await firestore().collection('users').doc(user.uid).get();
                        if (docSnap.exists) {
                            const firestoreData = docSnap.data();
                            await Promise.all(
                                [
                                crashlytics().setUserId(user.uid),
                                crashlytics().setAttributes({
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
                        await Promise.all([
                            crashlytics().setUserId(''),
                            crashlytics().setAttributes({
                                user_id:'null'
                            })
                        ])
                        setIsAuthenticated(false)
                        setUser({})
                    }
    })
        return () => unsub ()
    },[])

    const login = async (email:string,pasword:string) => {
        crashlytics().log('Auth Context: Login')
        setLoading(true)
        try{
            const response = await auth().signInWithEmailAndPassword(email,pasword)
            await Promise.all(
                [
                crashlytics().setUserId(response.user.uid),
                crashlytics().setAttributes({
                    user_id:response.user.uid,
                    //username:response.user?.displayName
                })
            ])
            return {success:true}
        }catch(error: unknown | any){
            crashlytics().recordError(error)
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
        crashlytics().log('Auth Context: Logout')
        try{
            await auth().signOut();
            await AsyncStorage.removeItem('authUser')
            return {success:true,}
        }catch(error:unknown | any){
            crashlytics().recordError(error)
            return {success:false, message: error.message}
        }
    }
    const register = async (username:string,email:string,password:string) => {
        crashlytics().log('Auth Context: Register')
        try{
            const response = await auth().createUserWithEmailAndPassword(email,password)
            await firestore().collection('users').doc(response?.user?.uid).set({
                username,
                user_id: response?.user?.uid
            })
            await Promise.all(
                [
                crashlytics().setUserId(response.user.uid),
                crashlytics().setAttributes({
                    user_id:response.user.uid,
                })
            ])
            return {success:true, data: response?.user}
        }catch(error:unknown | any){
            crashlytics().recordError(error)
            console.error(`${error}`)
            return {success:false, msg: error.message}
        }   
    }
    // const resetpassword = async (email:string) => {
    //     try{
    //         await sendPasswordResetEmail(auth,email)
    //         return { success: true, message: 'Password reset email sent successfully.' }
    //     }catch(e){
    //         console.error(e)
    //     }
    // }
    return (
        <AuthContext.Provider value={{user,isAuthenticated,login,register,logout}} >
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



