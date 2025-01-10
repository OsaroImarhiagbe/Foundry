import React,{useState} from 'react'
import {View,Text,StyleSheet,SafeAreaView,TextInput,Platform,Alert,ActivityIndicator,} from 'react-native'
import {Image} from 'expo-image'
import { blurhash } from '../../utils/index'
import { useAuth } from '../authContext'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { TouchableOpacity } from 'react-native-gesture-handler'
import {  addDoc, collection,Timestamp,updateDoc} from "firebase/firestore"; 
import {  db, } from '../../FireBase/FireBaseConfig';
import { useNavigation, useRoute  } from '@react-navigation/native';

const CommentReplyScreen = () => {
  const { user } = useAuth()
  const [text,setText] = useState('')
  const [loading,setLoading] = useState(false)
  const hasUnsavedChanges = Boolean(text);
  const navigation = useNavigation();
  const route = useRoute();

  const {comment_id,post_id} = route?.params

  const handlePost = async () => {
    setLoading(true)
      try{
        const docRef = collection(db,'posts',post_id,'comments',comment_id,'replys')
        const newDoc = await addDoc(docRef,{
          id:user.userId,
          name: user?.username,
          content:text,
          createdAt: Timestamp.fromDate(new Date()),
          parentId:comment_id
        })
        await updateDoc(newDoc,{
          id:newDoc.id
        })
        setText('')
        setTimeout(() =>{
          setLoading(false)
          navigation.goBack()
          Alert.alert('Success!!', 'post has sent!!');
        },1000)
      } catch (error) {
        setLoading(false)
        console.error("Error with reply:", error);
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
}
  return (<CustomKeyboardView
  inChat={true}
  behavior={Platform.OS === "ios" ? "padding" : 'height'}>
        <SafeAreaView  style={styles.screen}>
          <View style={styles.container}>
              <TouchableOpacity onPress={handleCancel}>
                  <View style={styles.cancelContainer}>
                  <Text style={styles.text}>Cancel</Text>
                  </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePost}>
                  <View style={styles.postContainer}>
                    {loading ? 
                      <ActivityIndicator  size='small' color='#fff'/>
                      :<Text style={styles.text}>Post</Text> }
                  </View>
              </TouchableOpacity>
          </View>
          <View style={styles.textcontainer}>
              <Image
              source={user?.profileImage}
              placeholder={{blurhash}}
              style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
              transition={500}
              />
              <TextInput
              style={styles.textarea}
              value={text}
              onChangeText={setText}
              numberOfLines={10}
              multiline={true}
              placeholder='Enter a comment......'
              placeholderTextColor='#ffffff'
              />
          </View>
      </SafeAreaView> 
  </CustomKeyboardView> 
)
}

const styles = StyleSheet.create({
  screen:{
      flex:1,
      backgroundColor:'#1f1f1f'
  },
  container:{
      padding:10,
      marginTop:20,
      flexDirection:'row',
      justifyContent:'space-between'
  },
  postContainer:{
      padding:5,
      borderRadius:10,
      width:90,
      backgroundColor:'#00bf63'
  },
  loading:{
    justifyContent:'center',
    alignItems:'center'
  },
  cancelContainer:{
      padding:5,
      borderRadius:10,
      width:90,
      backgroundColor:'#8a8a8a',
  },
  text:{
      textAlign:'center',
      color:'#ffffff',
      fontFamily:'Helvetica-light',
      fontSize:12
  },
  textcontainer:{
      flexDirection:'row',
      padding:10,
      marginTop:10
  },
  textarea:{
      padding:20,
      paddingTop:10,
      color:'#ffffff'
  }
})

export default CommentReplyScreen