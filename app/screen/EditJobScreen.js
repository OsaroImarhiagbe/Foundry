import {View,TextInput,TouchableOpacity} from 'react-native'
import { useState } from 'react';
import color from '../../config/color';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import { db} from '../../FireBase/FireBaseConfig';
import { updateDoc,doc} from 'firebase/firestore';
import { useAuth } from '../authContext';

const EditJobScreen = () => {
    const navigation = useNavigation()
    const [job,setJob] = useState('')
    const [isloading,setLoading] = useState(false)
    const [focus,setFocus] = useState('')
    const {user} = useAuth()


    const handleSubmit = async () =>{
        setLoading(true)
        try{
           const docRef = doc(db,'users',user.userId)
            await updateDoc(docRef,{
                    jobTitle:job,
            })
        }catch(e){
            console.error(`Error sending updates:${e}`)
        }
        finally{
            setLoading(false)
        }
    }
  return (
    <View style={{flex:1,backgroundColor:color.backgroundcolor}}>
        <ChatRoomHeader 
        onPress={()=>navigation.goBack()} 
        backgroundColor={color.button} 
        icon='keyboard-backspace'
        />
        <View style={{marginTop:50,padding:5}}>
        <View style={{padding:20}}>
        <TextInput
        style={{borderBottomWidth:0.5,padding:5,borderColor:focus === 'job' ? '#00BF63' : '#8a8a8a'}}
        placeholder='Job...'
        onFocus={() => setFocus('job')}
        onChangeText={(text) => setJob(text)}
        value={job}
        />
        </View>
        <View style={{padding:40}}>
        <TouchableOpacity onPress={handleSubmit}>
            <Button
            title={isloading ? 'Submitting...' : 'Submit'}
            />
            </TouchableOpacity>
        </View>
        </View>
    </View>
  )
}


export default EditJobScreen