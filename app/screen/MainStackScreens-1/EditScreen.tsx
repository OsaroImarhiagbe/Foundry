import {
    View,
    StyleSheet, 
    TouchableOpacity,
    ImageBackground} from 'react-native'
import { useCallback, useState,} from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../Context/authContext';
import { doc,updateDoc} from '@react-native-firebase/firestore'
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { blurhash } from '../../../utils/index';
import {getDownloadURL, putFile, ref} from '@react-native-firebase/storage';
import { useDispatch,useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {log,recordError,} from '@react-native-firebase/crashlytics'
import { crashlytics,UsersRef,storage } from '../../FirebaseConfig';;
import { useTheme, Text,Icon,} from 'react-native-paper';
import AppTextInput from 'app/components/BasicComponents/AppTextInput';
import {Image as ImageCompressor} from 'react-native-compressor';
import {launchImageLibrary} from 'react-native-image-picker';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { addHeaderImage, addImage } from '../../features/user/userSlice';
import { useSafeAreaInsets } from 'react-native-safe-area-context';




type NavigationProp = {
    Profile?:{user?:any},
    Message:undefined
    Welcome?:{
        screen?:string
      },
    Home?:{
        params?:{
            screen?:string
        }
        screen?:string
    },
    Account:undefined,
    News?:{
        screen?:string
    },
    Drawer:{
        screen:string,
        params:{
            screen:string
        }
    }
}

type Navigation = NativeStackNavigationProp<NavigationProp>


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
    const [filename,setFileName] = useState<string>('')
    const [image,setImage] = useState<string>('')
    const [headerimage,setHeaderImage] = useState<string>('')
    const dispatch = useDispatch()
    const profileimg = useSelector((state:any) => state.user.addImage)
    const headerimg = useSelector((state:any) => state.user.addHeaderImage)
    const {user} = useAuth()
    const theme = useTheme()
    const {top} = useSafeAreaInsets();
    const [form, setForm] = useState<Form>({
        name: '',
        username: '',
        email: '',
        phone: '',
        jobTitle: '',
        location: ''
      })
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
        let url = '';
        let headerurl='';
        if(image || headerimage){
            const imageRef = ref(storage,`/users/profileImage/${user.userId}/${filename}`)
            const headerRef = ref(storage,`/users/profileHeader/${user.userId}/${filename}`)
            await putFile(imageRef,image)
            await putFile(headerRef,headerimage)
            url = await getDownloadURL(imageRef)
            headerurl = await getDownloadURL(headerRef)
        }
        try{
            await updateDoc(doc(UsersRef,user.userId),{
                ...form,
                profileUrl:url,
                headerUrl:headerurl
            })
            navigation.goBack()
        }catch(error:unknown | any){
            recordError(crashlytics,error)
            console.error('Error Saving:',error.message)
        }
    },[ form, image, filename])

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
                    setHeaderImage(uri)
                    dispatch(addHeaderImage({headerimg:uri}))
                }else{
                    setImage(uri)
                    dispatch(addImage(uri)) 
                }
                setFileName(results?.assets[0]?.fileName || '')
            }
        }catch(error:any){
            recordError(crashlytics,error)
            console.error('Error picking image and uploading to Cloud Storage:',error.message)
        }
        },[dispatch])
      


  return (
    <View style={[styles.screen,{backgroundColor:theme.colors.background,paddingTop:top}]}>
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
                    textAlign:'center',
                }}
            >Edit Profile</Text>
            <TouchableOpacity onPress={handleSave}>
            <Text variant='bodyLarge'>Save</Text>
            </TouchableOpacity>
            </View>
            <TouchableWithoutFeedback onPress={() => pickImage('header')}>
                {
                    headerimage ?  <ImageBackground
                    source={{uri:headerimg}}
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
