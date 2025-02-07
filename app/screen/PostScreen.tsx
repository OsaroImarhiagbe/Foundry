import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput, 
  Platform, 
  Alert, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  Keyboard, 
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
import firestore from '@react-native-firebase/firestore'
import color from '../../config/color';
import storage from '@react-native-firebase/storage'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme,Icon } from 'react-native-paper';

type NavigationProp = {
  Main:undefined
}

type Navigation = NativeStackNavigationProp<NavigationProp, 'Main'>;
const PostScreen = () => {

  const { user } = useAuth();
  const theme = useTheme()
  const [text, setText] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [filename,setFileName] = useState<string | undefined>(undefined)
  const [loading,setLoading] = useState<boolean>(false)
  const hasUnsavedChanges = Boolean(text);
  const profileImage = useSelector((state:any) => state.user.profileImage)
  const navigation = useNavigation<Navigation>();
  const dispatch = useDispatch();

  const handlePost = async () => {
    if(text.trim() === '') return
    setLoading(true);
    try {
      const newDoc = await firestore().collection('posts').add({
        auth_id:user.uid,
        auth_profile:user.profileUrl,
        name:user?.username,
        content: text,
        like_count: null,
        comment_count: null,
        liked_by: null,
        createdAt: firestore.Timestamp.fromDate(new Date())
      })
      let imageUrl = null;
      if(image){
        const ref = storage().ref(`/posts/images/${newDoc.id}/${filename}`)
        await ref.putFile(image)
        imageUrl = await ref.getDownloadURL()
      }
      await newDoc.update({
        imageUrl:imageUrl,
        post_id: newDoc.id
      })
      setTimeout(() => {
        navigation.navigate('Main');
        Alert.alert('Success!!', 'Post has been sent!!');
      }, 1000);
      dispatch(addPost({ id: newDoc.id, content: text }));
      setText('');
      setImage(null);
    } catch (error:any) {
      console.error("Error creating room:", error.message);
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
            onPress: () => navigation.navigate('Main'),
          },
        ]
      );
    } else {
      navigation.navigate('Main');
    }
  };
  const pickImage = async () => {
    let results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing:true,
      quality:1
    })
    if(!results.canceled){
      setImage(results.assets[0].uri)
      setFileName(results.assets[0].uri.split('/').pop())
    }else{
      console.error('user cancelled the image picker.')
    }
  }
  return (
    <TouchableWithoutFeedback onPress={() =>  Keyboard.dismiss()}>
      <View style={[styles.screen,{backgroundColor:theme.colors.background}]}>
      <View style={styles.container}>
        <View style={{flexDirection:'row'}}>
        <TouchableOpacity onPress={handleCancel}>
         <Icon
         source='close'
         size={25}/>
        </TouchableOpacity>
        <Image
          source={user?.profileUrl}
          placeholder={{blurhash}}
          style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
          transition={500}
          />
        </View>
        <View style={{flexDirection:'row'}}>
        <Icon
         source='close'
         size={25}/>
        <TouchableOpacity onPress={handlePost}>
          <View style={[styles.postContainer,{backgroundColor:theme.colors.primary}]}>
            {loading ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text style={styles.text}>Post</Text>
            )}
          </View>
        </TouchableOpacity>
        </View>
      </View>
      <View style={styles.textContainer}>
        <TextInput
          style={styles.textArea}
          value={text}
          onChangeText={(text) => setText(text)}
          numberOfLines={10}
          multiline={true}
          placeholder='Enter a post......'
          placeholderTextColor='#ffffff'
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
        keyboardVerticalOffset={60}
        >
        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginTop:10}}>
          <TouchableOpacity style={styles.uploadImageButton} onPress={pickImage}>
          <MaterialIcons name='camera-alt' size={15} color='#fff' />
        </TouchableOpacity>
       </View>
        </KeyboardAvoidingView>
    </View>
    </TouchableWithoutFeedback>
    
  );
};

const styles = StyleSheet.create({
  screen: {
    paddingTop:hp('10%'),
    flex: 1,
  },
  container: {
    padding: 10,
    flexDirection: 'row',
    paddingHorizontal: 15,
    justifyContent:'space-between'
  },
  postContainer: {
    borderRadius: 10,
    padding: 10,
    width: 90,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    color: '#ffffff',
    fontFamily: color.textFont,
    fontSize: 12,
  },
  textContainer: {
    flex: 1,
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
    height: hp(25),
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 10,
  },
  uploadImageButton: {
    position: 'absolute',
    backgroundColor: '#00bf63',
    padding: 12,
    alignItems: 'center',
    borderRadius: 50,
    justifyContent: 'center',
    top: 5,
  },
});

export default PostScreen;
