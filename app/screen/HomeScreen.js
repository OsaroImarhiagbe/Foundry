import React,{useState,useEffect,lazy, Suspense,useMemo,useCallback} from 'react'
import {View, Text, StyleSheet,TouchableOpacity, FlatList, Platform,StatusBar, ActivityIndicator,SafeAreaView} from 'react-native'
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';;
import { useAuth } from '../authContext';
import firestore from '@react-native-firebase/firestore'
import { useDispatch} from 'react-redux';
import { addId } from '../features/user/userSlice';
import PushNotification from '../components/PushNotifications.js';
const PostComponent = lazy(() => import('../components/PostComponent.js'))





const HomeScreen = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useAuth()
  const [post, setPost] = useState([])
  const [mount, setMount] = useState(false)

  console.log('currentuser:',user)
  

  useEffect(() => { 
    setMount(true)
    //dispatch(addId({currentuserID:user.userId}))
    const unsub = firestore()
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .onSnapshot(querySnapShot =>{
      const data = querySnapShot.docs.map(documentSnapshot => ({
        ...documentSnapshot.data(),
              id: documentSnapshot.id,
    }))
    setPost(data);
    setMount(false)
  });

  return () => unsub()
  }, []); 


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
    setRefreshing(false);
  }, [memoPost]);
  

  const memoPost = useMemo(() => {return post},[post])
  const fetchPosts = () => { 
    try {
      const unsub = firestore().collection('posts').orderBy('createdAt', 'desc')
        .onSnapshot(querySnapShot =>{
          let data = [];
          querySnapShot.forEach(documentSnapShot => {
            data.push({ ...documentSnapShot.data(),id:documentSnapShot.id });
        } )
        setPost([...data]);
      });
      return unsub
    }  catch (e) {
    console.error(`Error post can not be found: ${e}`);
  } 
};
  const handlePress = () => {
    navigation.openDrawer();
  }
  const handleMessage = () => {
    navigation.navigate('Message')
  }
  return (
    <View
    style={styles.screen}
    >
      <PushNotification/>
        <View>
          <ChatRoomHeader
          onPress={handlePress}
          title='Welcome back'
          icon='menu'
          icon2='new-message'
          onPress2={handleMessage}
          backgroundColor={color.button}
          />
        </View>
        <View style={styles.link}>
          <TouchableOpacity onPress={() => console.log('text pressed')}><Text style={styles.linkText}>Resources</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('text pressed')}><Text style={styles.linkText}>Community</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('text pressed')}><Text style={styles.linkText}>Code</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => console.log('test pressed')}><Text style={styles.linkText}>Learning Path</Text></TouchableOpacity>
        </View>
   {mount ? <View style={{flex:1,justifyContent:'center',alignItems:'center'}}> <ActivityIndicator size='Large' color='#fff'/></View>
   : <FlatList
    data={memoPost}
    onRefresh={onRefresh}
    refreshing={refreshing}
    renderItem={({item}) => <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
      <PostComponent count={item.like_count} url={item.imageUrl} id={item.post_id} name={item.name} content={item.content} date={item.createdAt.toDate().toLocaleString()} comment_count={item.comment_count}/>
      </Suspense>}
    keyExtractor={(item)=> item.id}
    /> } 
    </View>
  )
}

const styles = StyleSheet.create({
  bodyText:{
    fontSize:15
  },
    imagecontainer:{
      width:50,
      height:50,
      marginRight:20
    },
    link:{
      marginVertical:10,
      flexDirection:'row',
      justifyContent:'space-evenly',
      padding:5
    },
    messageContainer:{
      marginLeft:40
    },
    linkText:{
      textAlign:'center',
      color:'#ffffff',
      fontSize:15,
      fontFamily:'Helvetica-light'
    },
    separator:{
      height:5
    },
    screen:{
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      flex:1,
      backgroundColor:'#1f1f1f'
  },
  Textcontainer:{
    marginTop:30,
    flexDirection:'row',
    padding:10
  },
  title:{
    fontWeight:'bold',
    textAlign:'center',
    color:color.white,
    fontSize:20,
    marginLeft:40
  },
})

export default HomeScreen
