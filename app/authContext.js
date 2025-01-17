import React,{ createContext, useEffect, useState, useContext} from 'react'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GoogleOneTapSignIn,statusCodes,} from '@react-native-google-signin/google-signin';
export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {

    const [user, setUser] = useState({})
    const [loading,setLoading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(undefined)
    useEffect(() => {
        const unsub = auth().onAuthStateChanged(async (user) => {
                    if(user){
                        setIsAuthenticated(true)
                        const docSnap = await firestore().collection('users').doc(user.uid).get();
                        if (docSnap.exists) {
                            const firestoreData = docSnap.data();
                            setUser({
                                uid: user.uid,
                                email: user.email,
                                username: firestoreData.username,
                                userId: firestoreData.userId,
                                profileUrl:firestoreData.profileUrl
                            });
                        }
                        await AsyncStorage.setItem('authUser',user?.uid)
                    }else{
                        setIsAuthenticated(false)
                        setUser(null)
                    }
    })
        return unsub
    },[])

    const login = async (email,pasword) => {
        setLoading(true)
        try{
            const response = await auth().signInWithEmailAndPassword(email,pasword)
            setLoading(false)
            return {success:true}
        }catch(error){
            setLoading(false)
            console.error(`Error:${error}`)
        }
    }

    const googleSignIn = async () => {
        try {
            await GoogleOneTapSignIn.checkPlayServices();
            await GoogleOneTapSignIn.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const signInResult = await GoogleOneTapSignIn.signIn();
            idToken = signInResult.data?.idToken;
            if (!idToken) {
                idToken = signInResult.idToken;
            }
            if (!idToken) {
                throw new Error('No ID token found');
            }
            const googleCredential = auth.GoogleAuthProvider.credential(signInResult.data.token);
            return auth().signInWithCredential(googleCredential);
          } catch (error) {
            if (isErrorWithCode(error)) {
              switch (error.code) {
                case statusCodes.IN_PROGRESS:
                  break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                  break;
                default:
              }
            } else {
            }
          }
        
    }

    const logout = async () => {
        try{
            await auth().signOut();
            await AsyncStorage.removeItem('authUser')
            return {success:true,}
        }catch(error){
            return {success:false, message: error.message}
        }
    }
    const register = async (username,email,password) => {
        try{
            const response = await auth().createUserWithEmailAndPassword(email,password)
            await firestore().collection('users').doc(response?.user?.uid).set({
                username,
                userId: response?.user?.uid
            })
            return {success:true, data: response?.user}
        }catch(error){
            console.error(`${error}`)
            return {success:false, msg: error.message}
        }   
    }
    const resetpassword = async (email) => {
        try{
            await sendPasswordResetEmail(auth,email)
            return { success: true, message: 'Password reset email sent successfully.' }
        }catch(e){
            console.error(e)
        }
    }
    const updateUserData = async (userId) => {
        const docSnap = await firestore().collection('users').doc(userId).get()
        if(docSnap.exists()){
           setUser((prevUser) => ({...prevUser.uid,username:docSnap.data().username, userId:docSnap.data().userId}))
        }
    }

    return (
        <AuthContext.Provider value={{user,isAuthenticated,login,register,logout,resetpassword,updateUserData,googleSignIn}} >
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



