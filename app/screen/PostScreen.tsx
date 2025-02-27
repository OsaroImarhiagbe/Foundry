import React, { useState,useEffect,useRef } from 'react';
import {
  View,
  StyleSheet,
  TextInput, 
  Platform, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity} from 'react-native';
import { Image } from 'expo-image';
import { blurhash } from '../../utils/index';
import { useAuth } from '../authContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useDispatch,useSelector } from 'react-redux';
import { addPost } from '../features/PostandComments/socialSlice';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  addDoc,
  collection,
  Timestamp,
  updateDoc}from '@react-native-firebase/firestore'
import color from '../../config/color';
import {getDownloadURL, getStorage,putFile,ref} from '@react-native-firebase/storage'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme,Icon,Text,Button,Divider } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
//import crashlytics from '@react-native-firebase/crashlytics'
import {
  Menu,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MenuItems } from '../components/CustomMenu'
import { PostRef, functions } from 'FIrebaseConfig';
import { storage } from 'FIrebaseConfig';
import { httpsCallable } from '@react-native-firebase/functions'




type NavigationProp = {
  Dash:undefined
}

type Navigation = NativeStackNavigationProp<NavigationProp, 'Dash'>;
const PostScreen = () => {

  const { user } = useAuth();
  const theme = useTheme()
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [filename,setFileName] = useState<string | undefined>(undefined)
  const [loading,setLoading] = useState<boolean>(false)
  const hasUnsavedChanges = Boolean(text);
  const {top} = useSafeAreaInsets()
  const profileImage = useSelector((state:any) => state.user.profileImage)
  const navigation = useNavigation<Navigation>();
  const textInputRef = useRef<TextInput>(null);
  const [category, setCategory] = useState<string>('')

  

 
  //const dispatch = useDispatch();
  useEffect(() => {
    const timeout = setTimeout(() => {
      textInputRef.current?.focus();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);


  const handlePost = async () => {
    if(text.trim() === '') return
    setLoading(true);
    try {
      const addPost = httpsCallable(functions,'addPost')
      let imageUrl = null;
      if(image && filename){
        const imageRef = ref(storage,`/posts/images/${user.userId}/${filename}`)
        await putFile(imageRef,image)
        imageUrl = await getDownloadURL(imageRef)
      }
      addPost({
        auth_id:user?.userId,
        name:user?.username,
        content:text,
        like_count: null,
        comment_count: null,
        liked_by: null,
        category:category,
        imageUrl:imageUrl,
        filename:filename,
        createdAt: Timestamp.fromDate(new Date())
      }).then((results)=> {
        console.log(results)
      }).catch((error) => {
        console.log(error)
      })
      navigation.goBack();
      setText('');
      setImage(null);
      setCategory('');
    } catch (error:unknown | any) {
      console.error("Error creating room:", error);
    }finally{
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure to discard them and leave the screen?',
        [
          { text: "Don't leave", style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  const pickImage = async () => {
    //crashlytics().log('Post Screen: Picking Images')
    try{
      let results = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing:true,
        quality:1
      })
      if(!results.canceled){
        setImage(results.assets[0].uri)
        setFileName(results.assets[0].uri.split('/').pop())
      }
    }catch(error:any){
      //crashlytics().recordError(error)
      console.error(error)
    }
  }
  return (
      <View style={[styles.screen,{backgroundColor:theme.colors.background,paddingTop:Platform.OS === 'ios' ? top : 0}]}>
      <View style={styles.container}>
        <View style={{flexDirection:'row',alignItems:'center'}}>
        <TouchableOpacity onPress={handleCancel}>
         <Icon
         source='close'
         size={25}/>
        </TouchableOpacity>
        <View style={{paddingLeft:15}}>
        <Image
          source={user?.profileUrl}
          placeholder={{blurhash}}
          style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
          transition={500}
          />
        </View>
        </View>
        <View style={{flexDirection:'row',alignItems:'center'}}>
        <View style={{paddingRight:15,flexDirection:'row',alignItems:'center'}}>
          <Menu>
      <MenuTrigger>
      <View style={{flexDirection:'row',alignItems:'center'}}>
      <Text
        variant='bodyLarge'
        >{category ? category : 'Anyone'}</Text>
        <Icon
         source='menu-down'
         size={25}/>
      </View>
      </MenuTrigger>
      <MenuOptions
        customStyles={{
            optionsContainer:{
                borderRadius:10,
                marginTop:40,
                marginLeft:-30,
                borderCurve:'continuous',
                backgroundColor:color.white,
                position:'relative'
            }
        }}
      
      >
        <MenuItems 
        text='Anyone'
        action={()=>setCategory('Anyone')}/>
        <Divider/>
         <MenuItems 
        text='Creativity and Innovation'
        action={()=>setCategory('Creativity and Innovation')}/>
      <Divider/>
      <MenuItems 
        text='Collaboration and Community'
        action={()=>setCategory('Collaboration and Community')}/>
      <Divider/>
      <MenuItems 
        text='Startup and Busniess'
        action={()=>setCategory('Statup and Busniess')}/>
      </MenuOptions>
    </Menu> 
        </View>
        <TouchableOpacity onPress={handlePost}>
          <View style={[styles.postContainer,{backgroundColor:theme.colors.primary}]}>
            {loading ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text
              variant='bodyMedium'
              style={{
                textAlign:'center',
                color:'#000',
              }}
              >Post</Text>
            )}
          </View>
        </TouchableOpacity>
        </View>
      </View>
      <View style={styles.textContainer}>
        <Text
        variant='bodyLarge'
        >{category}</Text>
        <TextInput
          ref={textInputRef}
          style={[styles.textArea,{color:theme.colors.tertiary}]}
          value={text}
          onChangeText={(text) => setText(text)}
          numberOfLines={10}
          multiline={true}
          placeholder='Share your ideas....'
          placeholderTextColor='grey'
        />
         {image && 
        <View style={{borderRadius:30}}>
          <Image
            source={image}
            style={styles.uploadedImage}
          />
        </View>}
      </View>
        <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
        >
        <View style={{flexDirection:'row',justifyContent:'space-between',padding:10}}>
          <View style={{flexDirection:'row',alignItems:'center'}}>
          <Button
          buttonColor={theme.colors.primary}
          textColor={theme.colors.tertiary}
          mode='contained'
          >Write With AI</Button>
          <View style={{paddingLeft:5}}>
          <Text
          style={{color:theme.colors.tertiary}}
          variant='bodySmall'
          > 0/20</Text>
          </View>
          </View>
          <View style={{flexDirection:'row',alignItems:'center',padding:10}}>
          <TouchableWithoutFeedback style={styles.uploadImageButton} onPress={pickImage}>
          <MaterialIcons name='camera-alt' size={25} color={theme.colors.tertiary}/>
        </TouchableWithoutFeedback>
        <Icon source='plus' size={30}/>
          </View>
       </View>
        </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 10,
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent:'space-between'
  },
  postContainer: {
    borderRadius: 30,
    padding: 10,
    width:50,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 12,
  },
  textContainer: {
    flex:1,
    paddingHorizontal: 22,
    borderRadius: 10,
    padding: 10,
  },
  textArea: {
    flex: 1,
    color: '#ffffff',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  uploadedImage: {
    width: '100%',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  uploadImageButton: {
    padding: 12,
  },
});

export default PostScreen;
