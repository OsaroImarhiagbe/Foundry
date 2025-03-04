import {
    View,
    StyleSheet, 
    TouchableOpacity,
    Modal,
    Platform,
    ImageBackground} from 'react-native'
import { useState,useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../authContext';
import { doc,onSnapshot,updateDoc} from '@react-native-firebase/firestore'
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { blurhash } from '../../utils/index';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import {getDownloadURL, putFile, ref} from '@react-native-firebase/storage';
import { useSelector,useDispatch } from 'react-redux';
import { addImage } from '../features/user/userSlice';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {log,recordError,setAttributes} from '@react-native-firebase/crashlytics'
import { crashlytics, db, UsersRef } from 'FIrebaseConfig';
import { useTheme, Text,Icon, TextInput, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTextInput from 'app/components/AppTextInput';
import { storage } from 'FIrebaseConfig';
import {Image as ImageCompressor} from 'react-native-compressor';
import {launchImageLibrary} from 'react-native-image-picker';


{/** NEED TO SEE IS IT WORTH HAVE MORE SCREENS FOR EDITING OR USING A MODAL FOR EDITING?????? */}
{/** NEED TO FIX NAVIGATION FOR GOING BACK TO ACCOUNT SCREEN */}
type NavigationProp = {
    Profile:{user:any},
    Message:undefined
    Welcome:{
        screen?:string
      },
}

type Navigation = NativeStackNavigationProp<NavigationProp>

type Edit = {
    id?:string,
    name?:string,
    jobTitle?:string,
    email?:string,
    phone?:string
    profileUrl?:string
    username?:string
}
  
const EditScreen = () => {
    const navigation = useNavigation<Navigation>();
    const [edit,setEdit] = useState<Edit>()
    const [filename,setFileName] = useState<string | undefined>(undefined)
    const [image,setImage] = useState<string | null>(null)
    const dispatch = useDispatch()
    const {user} = useAuth()
    const theme = useTheme()
    const {top} = useSafeAreaInsets()
    const [text,setText] = useState('')
    const [form, setForm] = useState({
        darkMode:true,
        wifi:false,
        showCollaborators:true,
        accessibilityMode: false
    })
  
    const items = [{
              id:1,
              icon:'person',
              name:edit?.name,
              type:'Username',
              screen:'EditUser',
              color:'#fff',
              nav:'keyboard-arrow-right'
          },
          {
              id:2,
              icon:'email',
              name:edit?.email,
              type:'Email',
              screen:'EditEmail',
              color:'#fff',
              nav:'keyboard-arrow-right'
          },
          {
              id:3,
              icon:'phone',
              name:edit?.phone,
              type:'Phone',
              screen:'EditPhone',
              color:'#fff',
              nav:'keyboard-arrow-right'
          },
          {
              id:4,
              icon:'work',
              name:edit?.jobTitle,
              type:'Job title',
              screen:'EditJob',
              color:'#fff',
              nav:'keyboard-arrow-right'
          },
          {
            id:5,
            icon:'work',
            name:edit?.jobTitle,
            type:'Location',
            screen:'EditJob',
            color:'#fff',
            nav:'keyboard-arrow-right'
        }
        ]
    


    const handleSave = async() => {
        let url;
        if(image && filename){
            const imageRef = ref(storage,`/users/profile/${user.userId}/${filename}`)
            await putFile(imageRef,image)
            url = await getDownloadURL(imageRef)
        }
        try{
            await updateDoc(doc(UsersRef,user.userId),{
                name:edit?.name,
                username:edit?.username,
                email:edit?.email,
                jobTitle:edit?.jobTitle,
                phone:edit?.phone,
                profileUrl:url
            })
        }catch(error:unknown | any){
            recordError(crashlytics,error)
            console.error(error)
        }
    }


    const pickImage = async () => {
        log(crashlytics,'Edit Screen: Pick Image')
        try{
            let results = await launchImageLibrary({
                mediaType:'photo',
                quality:1
              })
            if(!results.didCancel && results.assets?.length && results.assets[0].uri){
                const uri = await ImageCompressor.compress(results.assets[0].uri)
                setImage(uri)
                setFileName(results?.assets[0]?.fileName)
            }
        }catch(error:any){
            recordError(crashlytics,error)
            console.error('Error picking image and uploading to Cloud Storage:',error.message)
        }
        }
      


  return (
    <View style={[styles.screen,{backgroundColor:theme.colors.background,paddingTop:10}]}>
    <View style={{flexDirection:'row',padding:5,alignItems:'center',justifyContent:'space-between'}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon
            source='arrow-left-circle'
            size={hp(3)}
            />
        </TouchableOpacity>
            <Text
                variant='bodyLarge'
                style={{
                    textAlign:'center'
                }}
            >Edit Profile</Text>
            <TouchableOpacity onPress={handleSave}>
            <Text variant='bodyLarge'>Save</Text>
            </TouchableOpacity>
            </View>
            <ImageBackground
                resizeMode='cover'
                imageStyle={{height:150,justifyContent:'flex-end'}}
                style={{
                height:100,
                bottom:0,
                justifyContent:'flex-end',
            }}
            source={require('../assets/images/header.png')}
            > 
            </ImageBackground>
            <View style={{padding:10}}>
                <View style={{flexDirection:'row'}}>
                    <Image
                    style={{height:hp(8), aspectRatio:1, borderRadius:100,borderColor:theme.colors.background,borderWidth:1}}
                    source={edit?.profileUrl || user.profileUrl}
                    placeholder={{blurhash}}
                    transition={500}
                    cachePolicy='none'/>
                    <View style={{marginLeft:40,marginTop:10}}>
                        <Text style={{color:theme.colors.tertiary,fontSize:20}}>{edit?.name}</Text>
                        <TouchableOpacity style={{marginTop:5}} onPress={pickImage}>
                            <Text style={{color:theme.colors.tertiary,fontSize:12}}>Edit picture</Text>
                            </TouchableOpacity>
                            </View>
                            </View>
        <View style={{marginTop:20}}>
            {items.map(({name,id,type}) => (
                <View key={id}>
                    <AppTextInput
                    placeholder={type}
                    backgroundColor="transparnet"
                    onChangeText={(text) => setText(text) }
                    values={name}
                  />
                </View>
            ))}
        </View> 
        </View>
    </View>
  )
}


const styles = StyleSheet.create({
    screen:{
        flex:1,
    },
    row:{
        flexDirection:'row',
        height:50,
        justifyContent:'flex-start',
        alignItems:'center',
        marginBottom:12,
        borderRadius:8,

    },
    title: {
        fontSize: 20,
        marginBottom: 20,
      },
      modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
      modalContent: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
      },
      modalTitle: {
        fontSize: 18,
        marginBottom: 10,
      },
    
})

export default EditScreen
