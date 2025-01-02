import React,{useState,useEffect,lazy, Suspense,useMemo,useCallback} from 'react'
import {View, Text, StyleSheet,TouchableOpacity, FlatList, Platform,StatusBar, ActivityIndicator} from 'react-native'
import color from '../../config/color';
import javascript from '../assets/javascript.png';
import react from '../assets/react.png';
import python from '../assets/python.png';
import { useNavigation } from '@react-navigation/native';
import ChatRoomHeader from '../components/ChatRoomHeader';;
import { useAuth } from '../authContext';
import {  collection, onSnapshot, orderBy,query, } from "firebase/firestore"; 
import {db} from '../../FireBase/FireBaseConfig';
import { useDispatch} from 'react-redux';
import { addId } from '../features/user/userSlice';
import { store } from '../store';

const PostComponent = lazy(() => import('../components/PostComponent'))
const Cards = lazy(() => import('../components/Cards'))



const DATA1 = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    image: python,
    title: 'Python',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    image:react,
    title: 'React',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    image:javascript,
    title: 'Javascript',
  },
  {
    id: '48694a0f-3da1-471f-bd96-145571e29d72',
    image:javascript,
    title: 'Javascript',
  },
  {
    id: 'ff8694a0f-3da1-471f-bd96-145571e29d72',
    image:javascript,
    title: 'Javascript',
  },
  {
    id: '6y8694a0f-3da1-471f-bd96-145571e29d72',
    image:javascript,
    title: 'Javascript',
  },
];
const Separator = () => {
  return <View style={{marginRight:10}}/>
}

const HomeScreen = () => {

  const navigation = useNavigation();
  const dispatch = useDispatch()
  const [refreshing, setRefreshing] = useState(false);
  const {user} = useAuth()
  const [post, setPost] = useState([])
  const [mount, setMount] = useState(false)

  

  useEffect(() => { 
    setMount(true)
    // dispatch(addId({currentuserID:user.userId}))
    const timer = setTimeout(() => {
      setMount(false)
      fetchPosts();
    },1000)
      
    return () => clearTimeout(timer)
  }, []); 

  console.log('redux id:',store.getState().user.currentuserID)

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [memoPost]);
  

  const memoPost = useMemo(() => {return post},[post])
  const fetchPosts = () => { 
    try {
      const docRef = collection(db, 'posts')
      const querySnapShot = query(docRef,orderBy('createdAt', 'desc'))
      const snap = onSnapshot(querySnapShot,(snapShot) => {
        let data = [];
        snapShot.forEach(doc => {
          data.push({ ...doc.data(),id:doc.id });
      })
        setPost([...data]);
      });
    }  catch (e) {
    console.log(`Error post can not be found: ${e}`);
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
       
        <View>
          <ChatRoomHeader
          onPress={handlePress}
          title={'Welcome back ' + user?.username}
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
        <View style={{padding:2}}>
    <FlatList
      data={DATA1}
     horizontal
      keyExtractor={item => item.id.toString()}
      renderItem={({item}) =>
        <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
          <Cards navigation={navigation} color='#ffffff' image={item.image} title={item.title} backgroundColor={color.grey}/>
        </Suspense>}
      ItemSeparatorComponent={Separator}/>
   </View>
   {mount ? <View style={{flex:1,justifyContent:'center',alignItems:'center'}}> <ActivityIndicator size='Large' color='#fff'/></View>
   : <FlatList
    data={memoPost}
    onRefresh={onRefresh}
    refreshing={refreshing}
    renderItem={({item}) => <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
      <PostComponent count={item.like_count} url={item.imageUrl} id={item.id} name={item.name} content={item.content} date={item.createdAt.toDate().toLocaleString()}comment_count={item.comment_count}/>
      </Suspense>}
    keyExtractor={(item)=> item.id}
    /> } 
    </View>
  )
}

const styles = StyleSheet.create({
  
  bodyContainer:{
    padding:20
  },
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
      padding:10
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
  updatecontainer:{
    padding:10
  },
  updatetext:{
    padding:10,
    fontWeight:'bold',
    color:'#ffffff',
    fontSize:20
  },
  updatecard:{
    padding:10
  }
})

export default HomeScreen
