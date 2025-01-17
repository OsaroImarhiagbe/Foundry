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
import firestore from '@react-native-firebase/firestore'
import color from '../../config/color';
import storage from '@react-native-firebase/storage'
const PostScreen = () => {

  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [filename,setFileName] = useState(null)
  const [loading,setLoading] = useState(false)
  const hasUnsavedChanges = Boolean(text);
  const profileImage = useSelector((state) => state.user.profileImage)
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handlePost = async () => {
    setLoading(true);
    try {
      const newDoc = await firestore().collection('posts').add({
        auth_id:user.uid,
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
      <View>
        <View style={{paddingLeft:10}}>
        <Image
          source={user?.profileUrl}
          placeholder={{blurhash}}
          style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
          transition={500}
                />
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
    </SafeAreaView>
    </TouchableWithoutFeedback>
    
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.backgroundcolor,
  },
  container: {
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  postContainer: {
    borderRadius: 10,
    padding: 10,
    width: 90,
    backgroundColor: '#00bf63',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelContainer: {
    padding: 10,
    borderRadius: 10,
    width: 90,
    backgroundColor: '#8a8a8a',
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
    marginTop: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Optional background to separate text area
    borderRadius: 10,
    padding: 10,
  },
  textArea: {
    flex: 1,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10, // Space between text and uploaded image
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
