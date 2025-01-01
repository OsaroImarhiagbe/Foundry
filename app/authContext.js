import React,{ createContext, useEffect, useState, useContext} from 'react'
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword,signOut,sendPasswordResetEmail } from 'firebase/auth';
import { auth, db,} from '../FireBase/FireBaseConfig';
import { doc, getDoc, setDoc} from 'firebase/firestore';
export const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {

    const [user, setUser] = useState(null)
    const [loading,setLoading] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(undefined)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if(user){
                setIsAuthenticated(true)
                setUser(user)
                updateUserData(user.uid);
            }else{
                setIsAuthenticated(false);
                setUser(null)
            }
        
        })
        return unsub
    },[])

    const login = async (email,pasword) => {
        try{
            setLoading(true)
            const response = await signInWithEmailAndPassword(auth, email,pasword)
            setLoading(false)
            return {success:true}
        }catch(error){
            setLoading(false)
            console.log(`Error:${error}`)
        }
    }

    const logout = async () => {
        try{
            await signOut(auth);
            return {success:true,}
        }catch(error){
            return {success:false, message: error.message}

        }

    }
    const register = async (username,email,password) => {
        try{
            const response = await createUserWithEmailAndPassword(auth,email,password)
            await setDoc(doc(db,'users',response?.user?.uid),{
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
        }catch(e){
            console.log(e)
        }
       

    }
    const updateUserData = async (userId) => {
        const docRef = doc(db,'users',userId)
        const docSnap = await getDoc(docRef);
        if(docSnap.exists()){
           let data = docSnap.data()
           setUser({...user, username: data.username, userId:data.userId})
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



