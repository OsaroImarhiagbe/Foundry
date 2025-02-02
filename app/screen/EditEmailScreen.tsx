import {SafeAreaView,TextInput,TouchableOpacity,View} from 'react-native'
import { useState } from 'react';
import color from '../../config/color';
import ChatRoomHeader from '../components/ChatRoomHeader';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore'
import { useAuth } from '../authContext';

const EditEmailScreen = () => {
    const navigation = useNavigation()
    const [email,setEmail] = useState('')
    const [isloading,setLoading] = useState(false)
    const [focus,setFocus] = useState('')
    const {user} = useAuth()


    const handleSubmit = async () =>{
        setLoading(true)
        try{
           await firestore()
           .collection('users')
           .doc(user.userId)
           .update({
                    email:email,
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
        style={{borderBottomWidth:0.5,padding:5,borderColor:focus === 'email' ? '#00BF63' : '#8a8a8a'}}
        placeholder='Email...'
        onFocus={() => setFocus('email')}
        onChangeText={(text) => setEmail(text)}
        value={email}
        />
        </View>
        <View style={{padding:40}}>
            <Button onPress={handleSubmit}>{isloading ? 'Submitting...' : 'Submit'}</Button>
        </View>
        </View>
    </SafeAreaView>
  )
}


export default EditEmailScreen