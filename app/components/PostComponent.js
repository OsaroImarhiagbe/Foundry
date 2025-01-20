import React,{useState,useEffect,lazy, Suspense} from 'react'
import {View,StyleSheet,
TouchableOpacity,
TouchableHighlight,
SafeAreaView,
KeyboardAvoidingView,
Platform,
ScrollView,
Modal,
ActivityIndicator,
useWindowDimensions,
Keyboard,
TouchableWithoutFeedback} from 'react-native'
import { blurhash } from '../../utils/index'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Image } from 'expo-image';
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import { useAuth } from '../authContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import firestore from '@react-native-firebase/firestore';
import { useSelector} from 'react-redux';
import CommentComponent from './CommentComponent';
import ReplyComponent from './ReplyComponent';
import color from '../../config/color';
import { useDispatch } from 'react-redux';
import { addComment } from '../features/PostandComments/socialSlice';
import Feather from 'react-native-vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card,Text, TextInput,Divider} from 'react-native-paper';
import { FlashList } from "@shopify/flash-list";

const PostComponent = ({content,date,name,id,url,count,comment_count,mount,auth_profile}) => {

    const [press,setIsPress] = useState(false)
    const [isloading,setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false);
    const [comments, setComment] = useState([])
    const [isReply,setReply] = useState(false)
    const [text,setText] = useState('')
    const {height, width} = useWindowDimensions();
    const dispatch = useDispatch();
    const profileImage = useSelector((state) => state.user.profileimg)
    const {user} = useAuth();



    useEffect(() => {
      const docRef = firestore().collection('posts').doc(id)
       const subscriber =  docRef.collection('comments').orderBy('createdAt','desc').onSnapshot((querySnapShot) => {
              if (!querySnapShot || querySnapShot.empty) {
                setComment([]);
                return;
              }
              let data = []
              querySnapShot.forEach(documentSnapshot => {
                data.push({ ...documentSnapshot.data(),id:documentSnapshot.id });
              })
              setComment(data)
    }) 
          return () => subscriber()
    },[id])

    useEffect(() => {
      const relpyStatus = async () =>{
        try{
          const status = await AsyncStorage.getItem('reply');
        setReply(status)
        }catch(error){
          console.error('Error grabbing async:',error)
        }
      }

      relpyStatus()
    },[id])

  
    const handleLike = async () => {

      setLoading(true)
      const docRef = firestore().collection('posts').doc(id);
      try{
        await firestore().runTransaction(async (transaction)=>{
          const doc = await transaction.get(docRef)
          if (!doc.exists) throw new Error ('Document doesnt exists');

          const currentLikes = doc.data().like_count || 0
          const likeBy = doc.data().liked_by || []
          const hasliked = likeBy.includes(user.userId)

          let newlike
          let updatedLike

          if(hasliked){
            newlike = currentLikes - 1
            updatedLike = likeBy.filter((id)=> id != user?.userId)
          }else{
            newlike = currentLikes + 1
            updatedLike = [...likeBy,user.userId]
          }
          transaction.update(docRef,{
            like_count:newlike,
            liked_by:updatedLike
          })
        })
      }catch(err){
        console.log('error liking comment:',err)
      }finally{
        setLoading(false)
      }
    }
    
    
    const handlePost = async () => {
      if(!text) return;
      setLoading(true)
        try{
          const docRef = firestore()
          .collection('posts')
          .doc(id)
          .collection('comments')
          .doc(comments?.id)
          .collection('replys')
          const newDoc = await docRef.add({
            id:user.userId,
            name: user?.username,
            content:text,
            createdAt: Timestamp.fromDate(new Date()),
            parentId:id
          })
          await newDoc.update({
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
    

    const handleSend = async () => {
      if(text.trim() === " ") return;
      try{
        const docRef = firestore().collection('posts').doc(id).collection('comments')
        const newDoc = await docRef.add({
          parentId:null,
          content:text,
          auth_profile:auth_profile,
          name:user?.username,
          createdAt: firestore.Timestamp.fromDate(new Date())
        })
        await newDoc.update({
          id:newDoc.id
        })
        const postDocRef = firestore().collection('posts').doc(id)
        await firestore().runTransaction(async (transaction)=>{
          const doc = await transaction.get(postDocRef)
          if (!doc.exists) throw new Error('Doc does not exists!!')
          const commentCount = doc.data().comment_count || 0
          transaction.update(postDocRef,{
            comment_count:commentCount + 1
          })
        })
        setText('')
      }catch(e){
        console.error('Error with sending comments:',e)
      }
    }
  return (
    
    <SafeAreaView style={styles.card}>
      <Card
      elevation={0}
      mode='contained'
      style={{backgroundColor:color.backgroundcolor}}
      >
      <Card.Content>
      <View style={styles.postContainer}>
    <View style={styles.imageText}>
      {mount ? <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source=''
        placeholder={{blurhash}}
        cachePolicy='none'/> : <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source={auth_profile}
        placeholder={{blurhash}}
        cachePolicy='none'/>}
    <View>
    <Text
    variant="bodySmall"
    style={{
      fontFamily:color.textFont,
      marginLeft:30,
      color:'#fff'
    }}
    >{name}</Text>
    <Text
    variant="bodyLarge"
    style={{
    color:'#fff',
    fontFamily:color.textFont,
    marginLeft:30,
    marginVertical:5,
    }}
    >{content}</Text>
    </View>
    </View>
    {url && 
      <Image
      source={url}
      contentFit='cover'
      style={{
        aspectRatio:1,
        width:wp('100%'),
        height:hp('50%'),
        alignSelf: 'center',}}
      />}
      <Text
       variant="bodySmall"
       style={{
        color:'#fff',
        maringTop:10,
        fontFamily:color.textFont
       }}>{date}</Text>
      <View style={styles.reactionContainer}>
    <TouchableHighlight
      onShowUnderlay={() => setIsPress(true)}
      onHideUnderlay={() => setIsPress(false)}
      onPress={handleLike}
      style={styles.reactionIcon}
      >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="heart" size={15} color='#fff'/>
          <Text 
          variant='bodySmall'
          style={styles.reactionText}>{count}</Text>
        </View>
        </TouchableHighlight>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.reactionIcon}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons name="comment-processing-outline" size={15} color='#ffff'/>
            <Text
            variant='bodySmall'
            style={{
              fontFamily:color.textFont,
              color:'#fff',
              marginLeft:5,
              marginBottom:5
            }}>{comment_count}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.reactionIcon}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <EvilIcons name='retweet' size={15} color='#ffffff'/>
          </View>
        </TouchableOpacity>
      </View>
    </View>
    <View>
    <Modal
    animationType="fade"
    transparent={true}
    visible={modalVisible}>
    <KeyboardAvoidingView
      sh
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={styles.centeredView}>
      <TouchableWithoutFeedback>
        <View style={styles.commentView}>
          <View style={styles.modalView}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between',alignItems:'center' }}>
              <Text
              variant='titleMedium'
              onPress={() => setModalVisible(!modalVisible)}
              style={{ fontFamily:color.textFont}}>Comments</Text>
              <TouchableOpacity onPress={isReply ? handlePost : handleSend}>
                <View style={styles.sendButton}>
                  <Feather name="send" size={hp(2.0)} color="#000" />
                </View>
              </TouchableOpacity>
            </View>
            <Divider
            style={{width:'100%'}}
            />
            <FlashList
            data={comments}
            estimatedItemSize={200}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <CommentComponent
                    auth_profile={item.auth_profile}
                    count={item.like_count}
                    content={item.content}
                    name={item.name}
                    comment_id={item.id}
                    post_id={id}
                    date={item.createdAt.toDate().toLocaleString()}/>)}/>
            <View style={{bottom:10}}>
              <TextInput
                value={text}
                onChangeText={(text) => setText(text)}
                style={styles.textinput}
                placeholder="Comment...."
                placeholderTextColor="#000"
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </Modal>
  </View>
      </Card.Content>
      </Card>
  </SafeAreaView>
  )
}


const styles = StyleSheet.create({
    imageText:{
      flexDirection:'row',
      marginBottom:5
    },
    userTime:{
      fontFamily:'Helvetica-light',
      color:'#ffffff',
      marginLeft:50,
      marginTop:5,
      fontSize:10
    
    },
    scrollViewContent: {
      flexGrow: 1,
      paddingBottom: 60,
    },
    postContainer:{
      marginTop:5,
      padding:5,
    
    },
    reactionContainer:{
      flexDirection:'row',
      justifyContent:'space-between',
      marginTop:5
    },
    reactionIcon:{
      padding:5,
      flexDirection:'row',
    },
    commentView: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    modalView: {
      backgroundColor: color.grey,
      borderTopRightRadius: 40,
      borderTopLeftRadius: 40,
      paddingHorizontal: 15,
      paddingTop: 20,
      width:wp('100%'),
      height:hp('55%'),
    },
    centeredView: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: '#000',
      borderWidth: 0.5,
      borderRadius: 20,
      paddingHorizontal: 10,
      backgroundColor: '#fff',
    },
    textinput: {
      height: 40,
      padding: 10,
      fontSize: hp(2),
      color: '#000',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      backgroundColor: '#fff',
      borderTopRightRadius:30,
      borderTopLeftRadius:30,
      borderBottomLeftRadius:30,
      borderBottomRightRadius:30
      
    },
    sendButton: {
      padding: 10,
    },
  });

export default PostComponent