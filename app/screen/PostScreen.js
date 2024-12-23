import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Platform, Alert, ActivityIndicator, KeyboardAvoidingView,Keyboard, TouchableWithoutFeedback,TouchableOpacity} from 'react-native';
import { Image } from 'expo-image';
import { blurhash } from '../../utils/index';
import { useAuth } from '../authContext';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { addDoc, collection, Timestamp, updateDoc } from "firebase/firestore"; 
import { db } from '../../FireBase/FireBaseConfig';
import { useDispatch } from 'react-redux';
import { addPost } from '../features/PostandComments/socialSlice';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import person from '../assets/person.jpg';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios'
const PostScreen = () => {

  const { user } = useAuth();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const hasUnsavedChanges = Boolean(text);
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handlePost = async () => {
    setLoading(true);
    try {
      let imageUrl = null;
      if(image){
        imageUrl = await uploadtoS3(image)
      }
      const newDoc = await addDoc(collection(db, 'posts'), {
        id: user?.userId,
        name: user?.username,
        content: text,
        like_count: null,
        comment_count: null,
        liked_by: null,
        imageUrl:imageUrl,
        createdAt: Timestamp.fromDate(new Date())
      });
      await updateDoc(newDoc, {
        id: newDoc.id
      });
      console.log('New post id: ', newDoc.id);
      dispatch(addPost({ id: newDoc.id, content: text }));
      setText('');
      setImage(null);
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('Main');
        Alert.alert('Success!!', 'Post has been sent!!');
      }, 1000);
    } catch (error) {
      console.error("Error creating room:", error);
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
            onPress: () => navigation.navigate('Main'), // Navigate only if user confirms
          },
        ]
      );
    } else {
      navigation.navigate('Main'); // No unsaved changes, navigate immediately
    }
  };

 

  const uploadtoS3 = async (image) => {
    try{
      const formData = new FormData()
      formData.append('file',{
        uri: image,
        type: "image/jpeg",
        name: "photo.jpg"
    })
      const uploadResponse = await axios.post('http://192.168.1.253:8000/api/media_files/',formData,{
        headers:{
          'Content-Type':'multipart/form-data'
        }
      })
      if(uploadResponse.status === 201){
        console.log('file uploaded to s3')
        return uploadResponse.data.file
      }else{
        console.log('Failed to upload to s3')
      }
    }catch(err){
      console.log('Error uploading to s3:',err)
    }
  }

  const pickImage = async () => {
    let results = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing:true,
      quality:1
    })
    console.log('Image results:',results)
    if(!results.canceled){
      setImage(results.assets[0].uri)
    }else{
      console.log('user cancelled the image picker.')
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
          source={user?.profileImage || person}
          placeholder={{blurhash}}
          style={[styles.profileImage,{height:hp(4.3), aspectRatio:1, borderRadius:100}]}
          transition={500}
                />
        <TextInput
          style={styles.textArea}
          value={text}
          onChangeText={setText}
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
    backgroundColor: '#1f1f1f'
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
    fontFamily: 'Helvetica-light',
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
