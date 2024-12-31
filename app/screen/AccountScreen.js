import {View, Text, StyleSheet, ScrollView, TouchableOpacity,Dimensions,ActivityIndicator,RefreshControl,Modal} from 'react-native'
import {lazy,Suspense} from 'react'
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import {useState, useEffect,useCallback,useRef} from 'react';
import { useAuth } from '../authContext';
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import {db} from '../../FireBase/FireBaseConfig';
import {getDoc,doc, collection, onSnapshot,query,where } from 'firebase/firestore';
import ChatRoomHeader from '../components/ChatRoomHeader';
import SmallButton from '../components/SmallButton';
import FollowComponent from '../components/FollowComponent';
import { blurhash } from '../../utils/index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

const { width, height } = Dimensions.get('window');
const skills = ['Python','react','react native','Javascript','SQL','HTML/CSS','Linux','Django']

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
  console.log('is current user',isCurrentUser)
  const [refreshing, setRefreshing] = useState(false);
  
  const follow_items = [{count:projects?.projects?.length,content:'projects'},{count:users.connection,content:'connection'},{count:posts.length,content:'posts'}]

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUser();
    setRefreshing(false);
  }, [user]);


  useEffect(() => {
    try{
      const projectRef = collection(db,'projects')
      const q = query(projectRef,where('id','==',user?.userId))
      const unsub = onSnapshot(q,(snapShot) => {
        let data = []
        snapShot.forEach(doc => {
          data.push({...doc.data(),id:doc.id})
        })
        setProjects(data)
      })
    }catch(err){
      console.log('error grabbing user post:',err)
    }
    
  },[user])

  useEffect(() => {
    try{
      const docRef = collection(db,'posts')
      const q = query(docRef,where('name','==',user?.username))
      const unsub = onSnapshot(q,(snapShot) => {
        let data = []
        snapShot.forEach(doc => {
          data.push({...doc.data(),id:doc.id})
        })
        setPosts(data)
      })
    }catch(err){
      console.log('error grabbing user post:',err)
    }
    
  },[user])

  useEffect(() => {
    setLoading(true)
    const fetchUser = async () => {
      const userDoc = doc(db,'users',user.userId)
      const unsub = onSnapshot(userDoc,
        (doc) =>{
        if(doc.exists()){
          setUsers(doc.data())
        }else{
          console.error(`No such document ${error}`)
        }
      },
        (error)=>{
          console.error(`No such document ${error}`)
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
    scrollEnabled={true}
     style={{flex:1,backgroundColor:color.backgroundcolor}}>
      <View style={{flex:1,backgroundColor:color.backgroundcolor}}>
      {posts.map((post) => (
        <Suspense key={post.id} fallback={<ActivityIndicator size="small" color="#000" />}>
          <View style={{padding: 10 }}>
            <PostComponent count={post.like_count} url={post.imageUrl} id={post.id} name={post.name} content={post.content} date={post.createdAt.toDate().toLocaleString()} comment_count={post.comment_count} />
          </View>
        </Suspense>
      ))}
    </View>
    </ScrollView>
    
  ); 
  
  const Projects = () => (
    <ScrollView style={{flex:1,backgroundColor:color.backgroundcolor}}>
    <View style={{flex:1,backgroundColor:color.backgroundcolor,padding:50}}>
      {skills.map((project, index) => (
        <TouchableOpacity key={index} onPress={()=>navigation.navigate('ProjectScreen')}>
           <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
          <Text style={{ textAlign: 'center', color: '#fff' }}>{project?.projects?.project_name}</Text>
        </View>
        </TouchableOpacity>
      ))}
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
                    isCurrentUser ? (<Text style={styles.username}>@{users?.name}</Text>) 
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
                      lazy,
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
    backgroundColor:'#1F1F1F',
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
   fontFamily:'Helvetica-light'
  },
  location:{
    fontSize:15,
    color:'#fff',
    fontFamily:'Helvetica-light'
  },
  title:{
    fontSize:15,
    color:'#fff',
    fontFamily:'Helvetica-light'
  },


})
export default AccountScreen
