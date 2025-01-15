import {SafeAreaView,TextInput,TouchableOpacity} from 'react-native'
import { useState } from 'react';
import color from '../../config/color';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';
import firestore from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';
const EditInputScreen = () => {
    const navigation = useNavigation()
    const [name,setName] = useState('')
    const [username,setUsername] = useState('')
    const [isloading,setLoading] = useState(false)
    const [focus,setFocus] = useState('')
    const {user} = useAuth()


    const handleSubmit = async () =>{
        setLoading(true)
        try{
           await firestore()
           .collection('user')
           .doc(user.userId)
           .updateDoc({
                    name:name,
                    username:username,
            })
        }catch(e){
            console.error(`Error sending updates:${e}`)
        }
        finally{
            setLoading(false)
        }
    }
  return (
    <SafeAreaView style={{flex:1,backgroundColor:color.backgroundcolor}}>
        <ChatRoomHeader 
        onPress={()=>navigation.goBack()} 
        backgroundColor={color.button} 
        icon='keyboard-backspace'
        />
        <View style={{marginTop:50,padding:5}}>
        <View style={{padding:20}}>
        <TextInput
        style={{borderBottomWidth:0.5,padding:5,borderColor:focus === 'name' ? '#00BF63' : '#8a8a8a'}}
        placeholder='Name...'
        onFocus={() => setFocus('name')}
        onChangeText={(text) => setName(text)}
        value={name}
        />
        </View>
        <View style={{marginTop:30,padding:20}}>
        <TextInput
        style={{borderBottomWidth:0.5,padding:5,borderColor:focus === 'username' ? '#00BF63' : '#8a8a8a'}} 
        placeholder='Username...'
        onFocus={() => setFocus('username')}
        onChangeText={(text) => setUsername(text)}
        value={username}
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
    </SafeAreaView>
  )
}

export default EditInputScreen