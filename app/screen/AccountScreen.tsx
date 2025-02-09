import {
  View,
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl} from 'react-native'
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
import firestore,{FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import { blurhash } from '../../utils/index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme,Text,Icon } from 'react-native-paper';


const PostComponent = lazy(() => import('../components/PostComponent'))



const Tab = createMaterialTopTabNavigator();


 
const AccountScreen = () => {

  const [users, setUsers] = useState<User | undefined>(undefined)
  const [isloading,setLoading] = useState<boolean>(false)
  const [projects,setProjects] = useState<Project[]>([])
    const [posts,setPosts] = useState<Post[]>([])
  const { user } = useAuth();
  const navigation = useNavigation<Navigation>();
  const isCurrentUser = user
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme()


  type NavigationProp = {
    ProjectScreen:undefined,
    Home:{
      screen?:string
    },
    Message:undefined,
    Edit:undefined,
    SkillsScreen:undefined,
  }
  
  type Navigation = NativeStackNavigationProp<NavigationProp>;
  
  
  interface User{
    username?:string,
    userId?:string,
    profileUrl?:string,
    projects?:number,
    follow_state?:boolean,
    connection?:string,
    jobtitle?:string,
    location?:string
  
  }
  interface Post{
    auth_profile?: string;
    like_count?: number;
    imageUrl?: string;
    id?: string;
    name?: string;
    post_id?:string,
    content?: string;
    date?: string;
    comment_count?: number;
    mount?: boolean;
    createdAt?: FirebaseFirestoreTypes.Timestamp
  }
  interface Project{
    id?:string,
    project_name?:string
  }
  
  const follow_items = [{count:users?.projects,content:' projects'},{count:users?.connection,content:' connection'},{count:posts.length,content:' posts'}]

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // await fetchUser();
    setRefreshing(false);
  }, [user]);


  useEffect(() => {
    if(projects.length === 0) return;
    try{
      const projectRef = firestore().collection('projects').where('id','==',user?.userId)
      const unsub = projectRef.onSnapshot((documentSnapshot) => {
        let data:Project[] = []
        documentSnapshot.forEach(doc => {
          data.push({...doc.data(),id:doc.id})
        })
        setProjects(data)
      })
      return () => unsub()
    }catch(err:any){
      console.error('error grabbing user post:',err.message)
    }
    
  },[user])

  useEffect(() => {
    try{
      const docRef = firestore().collection('posts').where('name','==',user?.username).orderBy('createdAt','desc')
      const unsub = docRef.onSnapshot((querySnapshot) => {
        let data:Post[] = []
        querySnapshot.forEach(documentSnapshot => {
          data.push({...documentSnapshot.data(),id:documentSnapshot.id})
        })
        setPosts(data)
      })
      return () => unsub()
    }catch(err:any){
      console.error('error grabbing user post:',err.message)
    }
    
  },[user])

  useEffect(() => {
    setLoading(true)
      const userDoc = firestore().collection('users').doc(user.userId)
      const unsub = userDoc.onSnapshot(
        (documentSnapshot) =>{
        if(documentSnapshot.exists){
          setUsers(documentSnapshot.data())
        }else{
          console.error('No such document')
        }
      },
        (error:any)=>{
          console.error(`No such document ${error.message}`)
          setLoading(false)
        }
      );
      return () => unsub()
  },[])


 



  const Post = () => (
    <ScrollView
    scrollEnabled
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <View style={{flex:1,backgroundColor:theme.colors.background}}>
        {
        posts && posts.length > 0 ? (
            posts.map((post) => (
              <Suspense key={post.id} fallback={<ActivityIndicator size="small" color="#000" />}>
                <View>
                  <PostComponent
                  auth_profile={post.auth_profile}
                  count={post.like_count}
                  url={post.imageUrl} 
                  id={post.id} 
                  name={post.name} 
                  content={post.content} 
                  date={post?.createdAt?.toDate().toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true})}
                  comment_count={post.comment_count} />
                </View>
              </Suspense>
            ))) : <View style={{flex:1,justifyContent:'center',alignItems:'center',paddingTop:50}}>
              <Text variant='bodySmall' style={{ color: '#fff', textAlign: 'center'}}>No posts available</Text></View>}
    </View>
    </ScrollView>
    
  ); 
  
  const Projects = () => (
    <ScrollView scrollEnabled style={{flex:1,backgroundColor:theme.colors.background}}>
    <View style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      {
        projects && projects.length > 0 ? (
          projects.map((project, index) => (
        
          <TouchableOpacity key={index} onPress={()=>navigation.navigate('ProjectScreen')}>
             <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
            <Text style={{ textAlign: 'center', color: '#fff' }}>{project?.project_name}</Text>
          </View>
          </TouchableOpacity>
        ))) : <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text variant='bodySmall' style={{ color: '#fff', textAlign: 'center',}}>No projects available</Text></View>
      }
      
    </View>
    </ScrollView>
  );
  const ProjectsScreen = () => (
    <ScrollView scrollEnabled style={{flex:1,backgroundColor:theme.colors.background}}>
    <View style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      {
        projects && projects.length > 0 ? (
          projects.map((project, index) => (
        
          <TouchableOpacity key={index} onPress={()=>navigation.navigate('ProjectScreen')}>
             <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
            <Text style={{ textAlign: 'center', color: '#fff' }}>{project?.project_name}</Text>
          </View>
          </TouchableOpacity>
        ))) : <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text variant='bodySmall' style={{ color: '#fff', textAlign: 'center',}}>No projects available</Text></View>
      }
      
    </View>
    </ScrollView>
  );

  return (
  
    <SafeAreaView style={[styles.screen,{backgroundColor:theme.colors.background}]}>
      <ScrollView
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        style={styles.screen}
        contentContainerStyle={{flexGrow:1}}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
        >
          <TouchableOpacity onPress={() => navigation.navigate('Home',{screen:'Dash'})} style={{padding:10}}>
            <Icon
            source='arrow-left-circle'
            size={25}
            />
          </TouchableOpacity>
          <View style={{flexDirection:'row',paddingLeft:20,marginTop:10,justifyContent:'space-between',padding:5}}>
          <Image
              style={{height:hp(9.5), aspectRatio:1, borderRadius:100,}}
              source={users?.profileUrl}
              placeholder={{blurhash}}
              cachePolicy='none'/>
               <TouchableOpacity onPress={() => navigation.navigate('Edit')}>
                    {isCurrentUser &&  <SmallButton name='Edit Profile'/>}
                  </TouchableOpacity>
              </View>
              <View style={{marginTop:5,flexDirection:'column',paddingRight:20,alignContent:'stretch'}}>
              <View
              style={{
                paddingLeft:20,
                marginTop:5
              }}>  <Text>{
                    isCurrentUser ? (<Text
                    variant='bodySmall'
                      style={{
                        color:theme.colors.onTertiary
                      }}>@{users?.username}</Text>) 
                    : (<Text
                    variant='bodySmall'
                      style={{
                        color:theme.colors.onTertiary
                      }}>@{users?.username}</Text>)
                  }</Text></View>
                   <View style={{paddingLeft:20}}>
                    <View>
                    {follow_items.map((item,index)=>{
                      return <FollowComponent key={index} count={item.count} content={item.content}/>
                    })}
                    </View>
                </View>
              </View>
              {/* <View style={{alignItems:'flex-end',flexDirection:'column',marginBottom:20,paddingRight:20}}>
              <Text style={styles.title}>{users?.jobtitle}</Text>
              <Text style={styles.location}><EvilIcons name='location' size={20}/> {users?.location}</Text>
              </View> */}
              {/* <View style={styles.aboutContainer}>
                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                  <TouchableOpacity onPress={() => navigation.navigate('SkillsScreen')}>
                  <SmallButton name='Skills'/>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('Edit')}>
                    {isCurrentUser &&  <SmallButton name='Edit Profile'/>}
                  </TouchableOpacity>
                </View>
                </View> */}
                <View style={{flex: 1}}>
                  <Tab.Navigator
                screenOptions={{
                  swipeEnabled:true,
                  tabBarIndicatorStyle:{
                    backgroundColor:theme.colors.onPrimary
                  },
                  tabBarStyle:{
                    backgroundColor:theme.colors.background
                  },
                  tabBarShowLabel:false
                }}
                >
                  <Tab.Screen
                    name='Post'
                    component={Post}
                    options={{
                      tabBarIcon:() => (
                        <MaterialCommunityIcons name='post' color={theme.colors.onPrimary} size={20}
                        />),
                    }}
                    />
                    <Tab.Screen
                    name='Projects'
                    component={Projects}
                    options={{
                      tabBarIcon:() => (
                        <MaterialIcons name='work' color={theme.colors.onPrimary} size={20}
                        />),
                    }}
                    />
                  <Tab.Screen
                    name='ProjectsScreen'
                    component={ProjectsScreen}
                    options={{
                      tabBarIcon:() => (
                        <MaterialIcons name='work' color={theme.colors.onPrimary} size={20}
                        />),
                    }}
                    />
                  </Tab.Navigator>
                </View>
                </ScrollView> 
    </SafeAreaView>
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
  screen:{
    flex:1
  },
  text:{
    fontSize:12,
    fontWeight:'bold',
    letterSpacing:1,
    padding:5
  },
  username:{
    letterSpacing:1,
  },
  location:{
    fontSize:15,
    color:'#fff',
  },
  title:{
    fontSize:15,
    color:'#fff',
  },


})
export default AccountScreen
