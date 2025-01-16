import {View, Text, StyleSheet, ScrollView, TouchableOpacity,Dimensions,ActivityIndicator,RefreshControl,SafeAreaView} from 'react-native'
import {lazy,Suspense} from 'react'
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import {useState, useEffect,useCallback} from 'react';
import { useAuth } from '../authContext';
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import ChatRoomHeader from '../components/ChatRoomHeader';
import SmallButton from '../components/SmallButton';
import FollowComponent from '../components/FollowComponent';
import firestore from '@react-native-firebase/firestore';
import { blurhash } from '../../utils/index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';



const PostComponent = lazy(() => import('../components/PostComponent'))



const Tab = createMaterialTopTabNavigator();


 
const AccountScreen = () => {

  const [users, setUsers] = useState('')
  const [isloading,setLoading] = useState(false)
  const [posts,setPosts] = useState([])
  const [projects,setProjects] = useState([])
  const { user } = useAuth();
  const navigation = useNavigation();
  const isCurrentUser = user
  const [refreshing, setRefreshing] = useState(false);
  console.log('account screen:',user)
  
  const follow_items = [{count:projects?.projects?.length,content:'projects'},{count:users.connection,content:'connection'},{count:posts.length,content:'posts'}]

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  }, [user]);


  useEffect(() => {
    try{
      const projectRef = firestore().collection('projects').where('id','==',user?.userId)
      const unsub = projectRef.onSnapshot((documentSnapshot) => {
        let data = []
        documentSnapshot.forEach(doc => {
          data.push({...doc.data(),id:doc.id})
        })
        setProjects(data)
      })
      return () => unsub()
    }catch(err){
      console.error('error grabbing user post:',err.message)
    }
    
  },[user])

  useEffect(() => {
    try{
      const docRef = firestore().collection('posts').where('name','==',user?.username)
      const unsub = docRef.onSnapshot((documentSnapshot) => {
        let data = []
        documentSnapshot.forEach(doc => {
          data.push({...doc.data(),id:doc.id})
        })
        setPosts(data)
      })
      return () => unsub()
    }catch(err){
      console.error('error grabbing user post:',err.message)
    }
    
  },[user])

  useEffect(() => {
    setLoading(true)
    const fetchUser = async () => {
      const userDoc = firestore().collection('users').doc(user.userId)
      const unsub = userDoc.onSnapshot(
        (documentSnapshot) =>{
        if(documentSnapshot.exists){
          setUsers(documentSnapshot.data())
        }else{
          console.error(`No such document ${error.message}`)
        }
      },
        (error)=>{
          console.error(`No such document ${error.message}`)
        }
      );
      return unsub
    };
       
    fetchUser()
    return () => {
      setLoading(false)
    }
  },[])



  const Post = () => (
    <ScrollView
    scrollEnabled
     style={{flex:1,backgroundColor:color.backgroundcolor}}>
      <View style={{flex:1,backgroundColor:color.backgroundcolor}}>
        {
        posts && posts.length > 0 ? (
            posts.map((post) => (
              <Suspense key={post.id} fallback={<ActivityIndicator size="small" color="#000" />}>
                <View style={{padding: 10 }}>
                  <PostComponent count={post.like_count} url={post.imageUrl} id={post.id} name={post.name} content={post.content} date={post.createdAt.toDate().toLocaleString()} comment_count={post.comment_count} />
                </View>
              </Suspense>
            ))) : <View style={{flex:1,justifyContent:'center',alignItems:'center',paddingTop:50}}>
              <Text style={{ color: '#fff', textAlign: 'center', fontFamily:color.textFont,fontSize:20}}>No posts available</Text></View>}
    </View>
    </ScrollView>
    
  ); 
  
  const Projects = () => (
    <ScrollView scrollEnabled style={{flex:1,backgroundColor:color.backgroundcolor}}>
    <View style={{flex:1,backgroundColor:color.backgroundcolor,padding:50}}>
      {
        projects && projects.length > 0 ? (
          projects.map((project, index) => (
        
          <TouchableOpacity key={index} onPress={()=>navigation.navigate('ProjectScreen')}>
             <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
            <Text style={{ textAlign: 'center', color: '#fff' }}>{project?.projects?.project_name}</Text>
          </View>
          </TouchableOpacity>
        ))) : <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text style={{ color: '#fff', textAlign: 'center', fontFamily:color.textFont,fontSize:20}}>No projects available</Text></View>
      }
      
    </View>
    </ScrollView>
  );

  return (
  
    <View style={styles.screen}>
      <ChatRoomHeader 
        onPress={()=>navigation.navigate('Main')} 
        backgroundColor={color.button} 
        icon='keyboard-backspace' 
        onPress2={() => navigation.navigate('Message')}
        />
      <ScrollView
      scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        style={styles.screen}
        contentContainerStyle={{flexGrow:1}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
        >
        <View style={styles.profileContainer}>
          <View style={{flexDirection:'row', justifyContent:'space-between',paddingLeft:20}}>
          <Image
              style={{height:hp(10), aspectRatio:1, borderRadius:100,}}
              source={users.profileUrl}
              placeholder={{blurhash}}
              cachePolicy='none'/>
              <View style={{marginTop:5,flexDirection:'row', justifyContent:'space-evenly',paddingRight:20}}>
              <Text style={{fontSize:30, color:'#fff'}}>  {
                    isCurrentUser ? (<Text style={styles.username}>@{users?.username}</Text>) 
                    : (<Text style={styles.username}>@{users?.username}</Text>)
                  }</Text>
              </View>
              </View>
              <View style={{alignItems:'flex-end',flexDirection:'column',marginBottom:20,paddingRight:20}}>
              <Text style={styles.title}>{users.jobtitle}</Text>
              <Text style={styles.location}><EvilIcons name='location' size={20}/> {users.location}</Text>
              </View>
              </View>
              <View style={styles.textcontainer}>
                <View style={{flexDirection:'column',alignItems:'stretch'}}>
                  <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                    {follow_items.map((item,index)=>{
                      return <FollowComponent key={index} count={item.count} content={item.content}/>
                    })}
                  </View>
                </View>
              </View>
              <View style={styles.aboutContainer}>
                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                  <TouchableOpacity onPress={() => navigation.navigate('SkillsScreen')}>
                  <SmallButton name='Skills'/>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Edit')}>
                    {isCurrentUser &&  <SmallButton name='Edit Profile'/>}
                  </TouchableOpacity>
                </View>
                </View>
                <View style={{flex: 1}}>
                  <Tab.Navigator
                screenOptions={{
                  headerShown:false,
                  swipeEnabled:true,
                  tabBarIndicatorStyle:{
                    backgroundColor:'#00BF63'
                  },
                  tabBarStyle:{
                    backgroundColor:color.backgroundcolor,
                  },
                  tabBarShowLabel:false
                }}
                >
                  <Tab.Screen
                    name='Post'
                    component={Post}
                    options={{
                      tabBarIcon:() => (
                        <MaterialCommunityIcons name='post' color='#00bf63' size={25}
                        />),
                    }}
                    />
                    <Tab.Screen
                    name='Projects'
                    component={Projects}
                    options={{
                      tabBarIcon:() => (
                        <MaterialIcons name='work' color='#00bf63' size={25}
                        />),
                    }}
                    />
                  </Tab.Navigator>
                </View>
                </ScrollView> 
    </View>
  )
}

const styles = StyleSheet.create({
  aboutContainer:{
    marginTop:10,
  },
  aboutText:{
    fontSize:15,
    fontWeight:'bold'
  },
  profileContainer:{
    marginTop:10,
    padding:10,
  },
  screen:{
    backgroundColor:color.backgroundcolor,
    flex:1
  },
  text:{
    fontSize:12,
    fontWeight:'bold',
    letterSpacing:1,
    padding:5
  },
  textcontainer:{
    marginTop:5,
    padding:10,
  },
  username:{
    fontSize:30,
    letterSpacing:1,
    fontWeight:'bold',
   fontFamily:color.textFont
  },
  location:{
    fontSize:15,
    color:'#fff',
    fontFamily:color.textFont
  },
  title:{
    fontSize:15,
    color:'#fff',
    fontFamily:color.textFont
  },


})
export default AccountScreen
