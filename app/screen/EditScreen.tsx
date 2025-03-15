import {
    View,
    StyleSheet, 
    TouchableOpacity,
    ImageSourcePropType,
    ImageBackground} from 'react-native'
import { useCallback, useState,} from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../authContext';
import { doc,updateDoc} from '@react-native-firebase/firestore'
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { blurhash } from '../../utils/index';
import {getDownloadURL, putFile, ref} from '@react-native-firebase/storage';
import { useDispatch } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {log,recordError,} from '@react-native-firebase/crashlytics'
import { crashlytics,UsersRef } from 'FirebaseConfig';
import { useTheme, Text,Icon,} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppTextInput from 'app/components/AppTextInput';
import { storage } from '../../FirebaseConfig';
import {Image as ImageCompressor} from 'react-native-compressor';
import {launchImageLibrary} from 'react-native-image-picker';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { addHeaderImage, addImage } from 'app/features/user/userSlice';




type NavigationProp = {
    Profile:{user:any},
    Message:undefined
    Welcome:{
        screen?:string
      },
}

type Navigation = NativeStackNavigationProp<NavigationProp>

type Edit = {
  text:string
}
interface Form {
    name: string;
    username: string;
    email: string;
    phone: string;
    jobTitle: string;
    location: string;
  }
  
  interface Item {
    id: string;
    screen: string;
    key: string;
    type: keyof Form;
  }
  
const EditScreen = () => {
    const navigation = useNavigation<Navigation>();
    const [edit,setEdit] = useState<Edit | string>('')
    const [filename,setFileName] = useState<string | undefined>(undefined)
    const [image,setImage] = useState<string | undefined>(undefined)
    const [headerimage,setHeaderImage] = useState<ImageSourcePropType | undefined>(undefined)
    const dispatch = useDispatch()
    const {user} = useAuth()
    const theme = useTheme()
    const {top} = useSafeAreaInsets()
    const [text,setText] = useState('')
    const [form, setForm] = useState<Form>({
        name: '',
        username: '',
        email: '',
        phone: '',
        jobTitle: '',
        location: ''
      })
      
    // const [form, setForm] = useState({
    //     darkMode:true,
    //     wifi:false,
    //     showCollaborators:true,
    //     accessibilityMode: false
    // })
  
    const items:Item[] = [{
              id:'1',
              type:'username',
              screen:'EditUser',
              key:'username'
          },
          {
              id:'2',
              type:'email',
              screen:'EditEmail',
              key:'email',
          },
          {
              id:'3',
              type:'phone',
              screen:'EditPhone',
              key:'phone',
          },
          {
              id:'4',
              type:'jobTitle',
              screen:'EditJob',
              key:'jobTitle',
          },
          {
            id:'5',
            type:'location',
            screen:'EditJob',
            key:'location',
        }
        ]
    


    const handleSave = useCallback(async() => {
        let url;
        if(image && filename){
            const imageRef = ref(storage,`/users/profile/${user.userId}/${filename}`)
            await putFile(imageRef,image)
            url = await getDownloadURL(imageRef)
        }
        try{
            await updateDoc(doc(UsersRef,user.userId),{
                ...form,
                profileUrl:url || user.profileUrl
            })
            navigation.goBack()
        }catch(error:unknown | any){
            recordError(crashlytics,error)
            console.error(error)
        }
    },[ form, image, filename, user.profileUrl, user.userId, navigation])

    const pickImage = useCallback(async (type:'header' | 'profile') => {
        log(crashlytics,'Edit Screen: Pick Image')
        try{
            let results = await launchImageLibrary({
                mediaType:'photo',
                quality:1
              })
            if(!results.didCancel && results.assets?.length && results.assets[0].uri){
                const uri = await ImageCompressor.compress(results.assets[0].uri)
                if(type === 'header'){
                    setHeaderImage({uri})
                    dispatch(addHeaderImage(uri))
                }else{
                    setImage(uri)
                    dispatch(addImage(uri)) 
                }
                setFileName(results?.assets[0]?.fileName)
            }
        }catch(error:any){
            recordError(crashlytics,error)
            console.error('Error picking image and uploading to Cloud Storage:',error.message)
        }
        },[dispatch])
      


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
            <TouchableWithoutFeedback onPress={() => pickImage('header')}>
                {
                    headerimage ?  <ImageBackground
                    source={headerimage}
                    resizeMode='cover'
                    imageStyle={{height:150,justifyContent:'flex-end'}}
                    style={{
                        height:100,
                        bottom:0,
                        justifyContent:'flex-end',
                    }}
                    > 
                    </ImageBackground> :  <ImageBackground
            source={require('../assets/images/header.png')}
            resizeMode='cover'
            imageStyle={{height:150,justifyContent:'flex-end'}}
            style={{
                height:100,
                bottom:0,
                justifyContent:'flex-end',
            }}
            > 
            </ImageBackground>
                }
            </TouchableWithoutFeedback>
            <View style={{padding:10}}>
                <TouchableOpacity onPress={() => pickImage('profile')}>
                <View style={{flexDirection:'row'}}>
                    {
                        image ?  <Image
                        style={{height:hp(8), aspectRatio:1, borderRadius:100,borderColor:theme.colors.background,borderWidth:2}}
                        source={image}
                        placeholder={{blurhash}}
                        transition={500}
                        cachePolicy='none'/> :     <Image
                        style={{height:hp(8), aspectRatio:1, borderRadius:100,borderColor:theme.colors.background,borderWidth:2}}
                        source={require('../assets/user.png')}
                        placeholder={{blurhash}}
                        transition={500}
                        cachePolicy='none'/>
                    }
                    <View style={{marginLeft:40,marginTop:20}}>
                        <Text style={{color:theme.colors.tertiary,fontSize:20}}>{form?.name}</Text>
                            </View>
                            </View>
                </TouchableOpacity>
        <View style={{marginTop:20}}>
            {items.map(({id,type,key}) => (
                    <AppTextInput
                    key={id}
                    placeholder={type}
                    backgroundColor="transparnet"
                    onChangeText={(text) => setForm({...form, [key]: text})}
                    values={form[type]}
                  />
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
