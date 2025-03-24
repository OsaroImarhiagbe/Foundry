import React, { useState,useEffect,useRef, useCallback } from 'react';
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
import { blurhash } from '../../utils/index';
import { useAuth } from '../authContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import color from '../../config/color';
import {getDownloadURL,putFile,ref} from '@react-native-firebase/storage'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme,Icon,Text,Button,Divider } from 'react-native-paper';
import {  useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {log,recordError} from '@react-native-firebase/crashlytics'
import {
  Menu,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MenuItems } from '../components/CustomMenu'
import {crashlytics, functions, perf,storage } from '../../FirebaseConfig';
import { httpsCallable } from '@react-native-firebase/functions'
import FastImage from "@d11/react-native-fast-image";
import {Image as ImageCompressor,Video as VideoCompressor} from 'react-native-compressor';
import {launchImageLibrary} from 'react-native-image-picker';
import Video, {VideoRef} from 'react-native-video';
import Toast from 'react-native-toast-message'




type NavigationProp = {
  Dash:undefined
}

type Navigation = NativeStackNavigationProp<NavigationProp, 'Dash'>;
const PostScreen = () => {

  const { user } = useAuth();

  const theme = useTheme()
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | undefined>(undefined);
  const [filename,setFileName] = useState<string | undefined>(undefined)
  const [loading,setLoading] = useState<boolean>(false)
  const hasUnsavedChanges = Boolean(text);
  const {top} = useSafeAreaInsets()
  const navigation = useNavigation<Navigation>();
  const textInputRef = useRef<TextInput>(null);
  const [category, setCategory] = useState<string>('')
  const isMounted = useRef(true)
  const videoRef = useRef<VideoRef>(null);



  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false}
  },[])

  useEffect(() => {
    const timeout = setTimeout(() => {
      textInputRef.current?.focus()
    }, 1000);

    return () => clearTimeout(timeout); 
  }, []);


  const handlePost = useCallback(async () => {
    if(text.trim() === '') return
    log(crashlytics,'Handle Post')
    let trace = await perf.startTrace('sending_post_or_image')
    setLoading(true);
    try {
      const addPost = httpsCallable(functions,'addPost')
      let imageUrl = '';
      let videoUrl = '';
      if(image && filename){
        const imageRef = ref(storage,`/posts/images/${user.userId}/${filename}`)
        await putFile(imageRef,image)
        imageUrl = await getDownloadURL(imageRef)
      }else if(video && filename){
        const videoRef = ref(storage,`/posts/videos/${user.userId}/${filename}`)
        await putFile(videoRef,video)
        videoUrl = await getDownloadURL(videoRef)
      }
      addPost({
        auth_id:user?.userId,
        name:user?.username,
        content:text,
        like_count: 0,
        comment_count: 0,
        liked_by: [],
        category:category,
        image:imageUrl,
        video:videoUrl,
      }).catch((error) => {
        recordError(crashlytics,error)
        console.error('Error sending post:',error.message)
      })
      setText('');
      setImage(null);
      setCategory('');
      navigation.goBack();
      Toast.show({
        type: 'success',
        text1: 'Post Sent!',
        position:'top',
        autoHide:true,
        visibilityTime:4000,
      });
      setLoading(false)
    } catch (error:unknown | any) {
      recordError(crashlytics,error)
      console.error("Error sending post:", error);
    }finally{
      setLoading(false);
      trace.stop()
    }
  },[ text, image, filename, user, category,video]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges || image || video) {
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
  },[ hasUnsavedChanges, image,video]);
  const pickImage = useCallback(async () => {
    log( crashlytics,'Post Screen: Picking Images')
    setLoading(true)
    try{
      const results = await launchImageLibrary({
        mediaType: 'mixed',
        quality:1,
        formatAsMp4:true,
        presentationStyle:'popover',
        videoQuality:'high',
      })
      console.log('video',results)
      if(!results.didCancel && results.assets?.length && results?.assets[0]?.uri && results?.assets[0]?.fileSize){
        const uri = await ImageCompressor.compress(results.assets[0].uri)
        const videouri = await VideoCompressor.compress(results.assets[0].uri,{
            compressionMethod: 'auto',
            maxSize:640
        })
        if(isMounted.current){
          setImage(uri)
          setVideo(videouri)
          setFileName(results?.assets[0]?.fileName)
        }
      }
    }catch(error:unknown | any){
      recordError(crashlytics,error)
      console.error(error)
    }finally{
      if(isMounted.current){
        setLoading(false)
      }
    }
  },[setImage,setFileName])
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
                position:'relative',
                zIndex:10
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
        <TextInput
          ref={textInputRef}
          style={{
            borderRadius: 10,
            padding: 20,
            color:theme.colors.tertiary,
            fontSize:16,}}
          value={text}
          onChangeText={(text) => setText(text)}
          multiline={true}
          textAlignVertical='top'
          placeholder='Share your ideas....'
          placeholderTextColor='grey'
        />
         {image && 
          <FastImage
            source={{
              uri:image,
              priority: FastImage.priority.normal}}
            resizeMode={FastImage.resizeMode.contain}
            style={{
              width:'100%',
              alignSelf: 'center',
              height:300,
            }}
          />}
         {video && <Video 
            source={{
              uri: video
            }}
            repeat={true}
            ref={videoRef}
            controls={true}
            resizeMode='contain'             
            style={{
              width:'100%',
              height:250,
            }}
          />}
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
    paddingHorizontal:10,
  },
  uploadImageButton: {
    padding: 12,
  },
 
});

export default PostScreen;
