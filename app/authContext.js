import React,{ createContext, useEffect, useState, useContext} from 'react'
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    GoogleSignin,
  GoogleSigninButton,
  statusCodes,
  } from '@react-native-google-signin/google-signin';
export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {

    const [user, setUser] = useState(null)
    const [loading,setLoading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(undefined)


    useEffect(() =>{
        const getAuthState = async () => {
            const currentUser = await AsyncStorage.getItem('authUser')
            if(currentUser !== null){
                setIsAuthenticated(true)
                setUser(JSON.parse(currentUser))
                updateUserData(currentUser.uid)
            }else{
                setIsAuthenticated(false);
                setUser(null)
            }
        }
        getAuthState()
    },[])

    useEffect(() => {
        const unsub = auth().onAuthStateChanged((user) => {
            (async () => {
                    if(user){
                        setIsAuthenticated(true)
                        setUser(user)
                        updateUserData(user.uid);
                        const parseData = JSON.stringify(user)
                        await AsyncStorage.setItem('authUser',parseData)
                    }else{
                        setIsAuthenticated(false);
                        setUser(null)
                        await AsyncStorage.removeItem('authUser')
                    }
                }
            )
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

    const googleSignIn = () => {
        
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
            await AsyncStorage.setItem('userId',response?.user?.uid)
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
           let data = docSnap.data()
           setUser((prev)=> ({...prev, username: data.username, userId:data.userId}))
        }
    }

    return (
        <AuthContext.Provider value={{user,isAuthenticated,login,register,logout,resetpassword,updateUserData}} >
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



