import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Platform, Alert, ActivityIndicator, KeyboardAvoidingView,Keyboard, TouchableWithoutFeedback,TouchableOpacity} from 'react-native';
import { Image } from 'expo-image';
import { blurhash } from '../../utils/index';
import { useAuth } from '../authContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useDispatch,useSelector } from 'react-redux';
import { addPost } from '../features/PostandComments/socialSlice';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios'
import firestore from '@react-native-firebase/firestore'
import color from '../../config/color';
import {DJANGO_MEDIA_URL} from '@env'
import storage from '@react-native-firebase/storage'
const PostScreen = () => {

  const { user } = useAuth();
  console.log('post screen:',user)
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [post_id,setPost_id] = useState('')
  const hasUnsavedChanges = Boolean(text);
  const profileImage = useSelector((state) => state.user.profileImage)
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handlePost = async () => {
    setLoading(true);
    try {
      const newDoc = await firestore().collection('posts').add({
        auth_id:user.uid,
        content: text,
        like_count: null,
        comment_count: null,
        liked_by: null,
        createdAt: firestore.Timestamp.fromDate(new Date())
      })
      let imageUrl = null;
      if(image){
        imageUrl = await uploadtoS3(image,newDoc.id)
      }
      await newDoc.update({
        imageUrl:null,
        post_id: newDoc.id
      })
      setTimeout(() => {
        navigation.navigate('Main');
        Alert.alert('Success!!', 'Post has been sent!!');
      }, 1000);
      setPost_id(newDoc.id)
      dispatch(addPost({ id: newDoc.id, content: text }));
      setText('');
      setImage(null);
    } catch (error) {
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

 

  const uploadtoS3 = async (image,post_id) => {
    try{
      const formData = new FormData()
      formData.append('file',{
        uri: image,
        type: "image/jpeg",
        name: "photo.jpg"
    })
    formData.append('post_id',post_id)
      const uploadResponse = await axios.post(DJANGO_MEDIA_URL,formData,{
        headers:{
          'Content-Type':'multipart/form-data'
        }
      })
      if(uploadResponse.status === 201){
        return uploadResponse.data.file
      }else{
        console.error('Failed to upload to s3')
      }
    }catch(err){
      console.error('Error uploading to s3:',err)
    }
  }

  const pickImage = async () => {
    let results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing:true,
      quality:1
    })
    if(!results.canceled){
      setImage(results.assets[0].uri)
    }else{
      console.error('user cancelled the image picker.')
    }
  }
  return (
    <TouchableWithoutFeedback onPress={() =>  Keyboard.dismiss()}>
      <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleCancel}>
          <View style={styles.cancelContainer}>
            <Text style={styles.text}>Cancel</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePost}>
          <View style={styles.postContainer}>
            {loading ? (
              <ActivityIndicator size='small' color='#fff' />
            ) : (
              <Text style={styles.text}>Post</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.textContainer}>
        <Image
          source={profileImage}
          placeholder={{blurhash}}
          style={[styles.profileImage,{height:hp(4.3), aspectRatio:1, borderRadius:100}]}
          transition={500}
                />
        <TextInput
          style={styles.textArea}
          value={text}
          onChangeText={(text) => setText(text)}
          numberOfLines={10}
          multiline={true}
          placeholder='Enter a post......'
          placeholderTextColor='#ffffff'
        />
      </View>
        {image && 
        <View style={{borderRadius:30}}>
          <Image
            source={image}
            style={styles.uploadedImage}
          />
        </View>}
        <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',padding:10}}>
          <TouchableOpacity style={styles.uploadImageButton} onPress={pickImage}>
          <MaterialIcons name='camera-alt' size={15} color='#fff' />
        </TouchableOpacity>
       </View>
        </KeyboardAvoidingView>
    </SafeAreaView>
    </TouchableWithoutFeedback>
    
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor:color.backgroundcolor
  },
  container: {
    padding: 20,
    marginTop: 10,
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  postContainer: {
    padding: 5,
    borderRadius: 10,
    width:90,
    backgroundColor: '#00bf63'
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelContainer: {
    padding: 5,
    borderRadius: 10,
    width: 90,
    backgroundColor: '#8a8a8a',
  },
  text: {
    textAlign: 'center',
    color: '#ffffff',
    fontFamily: color.textFont,
    fontSize: 12
  },
  textContainer: {
    flexDirection: 'row',
    paddingHorizontal: 22,
    marginTop: 10,
  },
  profileImage: {
    height: hp(4.3),
    aspectRatio: 1,
    borderRadius: 100,
    marginRight: 10
  },
  textArea: {
    flex: 1,
    padding: 10,
    color: '#ffffff',
  },
  uploadedImage: {
    width: wp(80),
    height: hp(50),
    alignSelf: 'center',
    marginVertical: 10,
    borderRadius:30
  },
  uploadImageButton: {
    position: 'absolute',
    backgroundColor: '#00bf63',
    padding: 12,
    alignItems: 'center',
    borderRadius:50,
    justifyContent:'center',
    top:5
  },
});

export default PostScreen;
