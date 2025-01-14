import React,{lazy,Suspense,useEffect,useState} from 'react'
import {View,Text,StyleSheet,Platform,ScrollView, TextInput,TouchableOpacity, ActivityIndicator,KeyboardAvoidingView,SafeAreaView} from 'react-native'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Feather from 'react-native-vector-icons/Feather';
import { addDoc, collection,onSnapshot, Timestamp,query, getDocs,where,updateDoc,runTransaction,doc} from "firebase/firestore"; 
import { db} from '../../FireBase/FireBaseConfig';
import { useAuth } from '../authContext';
import {useDispatch } from 'react-redux';
import { addComment } from '../features/PostandComments/socialSlice';
import { useRoute } from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
const CommentComponent = lazy(() => import('../components/CommentComponent'))
const PostComponent = lazy(() => import('../components/PostComponent'))

const CommentScreen = () => {
  const {user} = useAuth()
  const route = useRoute()
  const {id} = route?.params
  const [currentComment,setCurrentComment] = useState([])
  const [comments, setComment] = useState([])
  const [loading,setLoading] = useState(false)
  const [text,setText] = useState('')
  const dispatch = useDispatch()
  const navigation = useNavigation()
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      grabCurrentPost();
      fetchID()
    },2000)
  },[])
  const fetchID = async () => {
    if(id){
      unsub = onSnapshot(collection(db,'posts',id,'comments'),(querySnapShot) => {
        try{
            let data = []
            querySnapShot.forEach(doc =>{
              data.push({ ...doc.data(),id:doc.id });
            })
            setComment([...data])
        }catch(e){
          console.error('Error with comment',e)
        }
      }
      ) 
    }
  }
  const handlePress = () => {
    navigation.goBack();
  }

  const handleSend = async () => {
    try{
      const commentMessageRef = collection(db,'posts',id,'comments')
      const newDoc = await addDoc(commentMessageRef,{
        parentId:null,
        name:user?.username,
        content:text,
        createdAt: Timestamp.fromDate(new Date())
      })
      await updateDoc(newDoc,{
        id:newDoc.id
      })
      console.error('comment id:',newDoc.id)
      dispatch(addComment({id:newDoc.id,postId:id,content:text}))
      setText('')
      const postDocRef = doc(db,'posts',id)
      await runTransaction(db,async (transaction)=>{
        const doc = await transaction.get(postDocRef)
        if (!doc.exists()) throw new Error('Doc does not exists!!')
        const commentCount = doc.data().comment_count || 0
        transaction.update(postDocRef,{
          comment_count:commentCount + 1
        })
      })
    }catch(e){
      console.error('Error:',e)
    }
  }
const grabCurrentPost = async () => { 
  try{
    const docRef = collection(db, 'posts')
    const q = query(docRef,(where('id', '==', id)));
    const querySnapShot = await getDocs(q)
    let data = []
    querySnapShot.forEach(doc => {
      data.push({...doc.data(),id:doc.id})
    })
    console.error(data)
    setCurrentComment([...data])
  }catch(e){
    console.error('ERROR:',e)
  }
  
}

  return (

      <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={60} 
    style={styles.container}
    >
       <ChatRoomHeader onPress={handlePress} icon='keyboard-backspace' backgroundColor={color.button}/>
       <ScrollView
       keyboardShouldPersistTaps="never">
       <View>
        {currentComment.map((comment) => {
          return <Suspense key={comment.id} fallback={<ActivityIndicator size='small' color='#fff'/>}>
            <PostComponent url={comment.imageUrl} count={comment.like_count} name={comment.name} content={comment.content} comment_count={comment.comment_count} date={comment.createdAt.toDate().toLocaleString()}/>
          </Suspense>
        })}</View>
        {comments.map((comment) => {
         
          return <Suspense key={comment.id}  fallback={<ActivityIndicator size='small' color='#fff'/>}>
                  <CommentComponent count={comment.like_count} content={comment.content} name={comment.name} comment_id={comment.id} post_id={id} date={comment.createdAt.toDate().toLocaleString()}/>
            </Suspense>
        })}
        </ScrollView>
        <View>
       <View style={styles.inputContainer}>
         <View style={styles.messageInput}>
         <TextInput
         value={text}
         onChangeText={(text) => setText(text)}
         style={[styles.textinput,{fontSize:hp(1.5)}]}
           placeholder='Comment....'
           placeholderTextColor="#000"
         />
         <TouchableOpacity onPress={handleSend}>
           <View style={styles.sendButton}>
           <Feather
           name='send'
           size={hp(2.0)}
           color='#737373'/>
           </View>
         </TouchableOpacity>
       </View>
        </View>
       </View>
       </KeyboardAvoidingView>
    
    
   
  )
}

const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:color.backgroundcolor
  },
  textinput:{
    flex:1,
    marginRight:2,
    padding:5
  },
  messageInput: {
    flexDirection:'row',
    justifyContent:'space-between',
    borderColor:'#8a8a8a',
    borderWidth:0.5,
    borderRadius:20,
  },
  sendButton: {
    padding: 15,
    marginRight:1,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginRight:3,
    marginLeft:3,
    padding:5,
    paddingBottom:30
  },
  
})

export default CommentScreen