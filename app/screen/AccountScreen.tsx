import {
  View,
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl} from 'react-native'
import {lazy,Suspense} from 'react'
import { useNavigation } from '@react-navigation/native';
import {useState, useEffect,useCallback} from 'react';
import { useAuth } from '../authContext';
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import FollowComponent from '../components/FollowComponent';
import firestore,{FirebaseFirestoreTypes} from '@react-native-firebase/firestore';
import { blurhash } from '../../utils/index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme,Text,Icon,Button } from 'react-native-paper';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import SmallButton from 'app/components/SmallButton';
import crashlytics from '@react-native-firebase/crashlytics'

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
    Welcome:{
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
    crashlytics().log('Account Screen: On Refresh')
    setRefreshing(true);
    const userDoc = firestore().collection('users').doc(user.userId)
    try{
      const unsub = userDoc.onSnapshot(
        async (documentSnapshot) =>{
        if(documentSnapshot.exists){
          setUsers(documentSnapshot.data())
          await Promise.all(
            [
            crashlytics().setUserId(user.userId),
            crashlytics().setAttributes({
              id:user.userId
            })
          ])
        }else{
          console.error('No such document')
        }
      },
        (error:unknown | any)=>{
          crashlytics().recordError(error)
          console.error(`No such document ${error.message}`)
          setLoading(false)
        }
      );
      return () => unsub()
      }catch(error:unknown | any){
        crashlytics().recordError(error)
      }finally{
        setRefreshing(false);
      }
  }, [user]);


  useEffect(() => {
    crashlytics().log('Account Screen: Grabbing Users Projects')
    if(projects.length === 0) return;
    setLoading(true)
    try{
      const projectRef = firestore().collection('projects').where('id','==',user?.userId)
      const unsub = projectRef.onSnapshot(async (documentSnapshot) => {
        let data:Project[] = []
        documentSnapshot.forEach(doc => {
          data.push({...doc.data(),id:doc.id})
        })
        setProjects(data)
        await Promise.all([
          crashlytics().setUserId(user.userId),
          crashlytics().setAttributes({
            user_id:user.userId
          })
        ])
      })
      return () => unsub()
    }catch(err:any){
      crashlytics().recordError(err)
      console.error('error grabbing user post:',err.message)
    }finally{
      setLoading(false)
    }
    
  },[user])

  useEffect(() => {
    crashlytics().log('Account Screen: Grabbing Users Post')
    setLoading(true)
    try{
      const docRef = firestore().collection('posts').where('name','==',user?.username).orderBy('createdAt','desc')
      const unsub = docRef.onSnapshot(async (querySnapshot) => {
        let data:Post[] = []
        querySnapshot.forEach(documentSnapshot => {
          data.push({...documentSnapshot.data(),id:documentSnapshot.id})
        })
        await Promise.all([
          crashlytics().setUserId(user.userId),
          crashlytics().setAttributes({
            user_id:user.userId
           })
        ])
        setPosts(data)
      })
      return () => unsub()
    }catch(err:any){
      crashlytics().recordError(err)
      console.error('error grabbing user post:',err.message)
    }finally{
      setLoading(false)
    }
    
  },[user])

  useEffect(() => {
    crashlytics().log('Account Screen: Grabbing User ')
    setLoading(true)
      const userDoc = firestore().collection('users').doc(user.userId)
      try{
        const unsub = userDoc.onSnapshot(
          async (documentSnapshot) =>{
          if(documentSnapshot.exists){
            setUsers(documentSnapshot.data())
            await Promise.all(
              [
              crashlytics().setUserId(user.userId),
              crashlytics().setAttributes({
                id:user.userId
              })
            ])
          }else{
            console.error('No such document')
          }
        },
          (error:unknown | any)=>{
            crashlytics().recordError(error)
            console.error(`No such document ${error.message}`)
            setLoading(false)
          }
        );
        return () => unsub()
      }catch(error: unknown | any){
        crashlytics().recordError(error)
      }finally{
        setLoading(false)
      }
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
        ))) : <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text variant='bodySmall' style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No projects available</Text></View>
      }
      
    </View>
    </ScrollView>
  );
  const SkillsScreen = () => (
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
        ))) : <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text variant='bodySmall' style={{ color: '#fff', textAlign: 'center',fontSize:16}}>No skills available</Text></View>
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
          <TouchableOpacity onPress={() => navigation.navigate('Welcome',{screen:'Dash'})} style={{padding:10}}>
            <Icon
            source='arrow-left-circle'
            size={25}
            />
          </TouchableOpacity>
          <View style={{flexDirection:'row',paddingLeft:20,marginTop:10,justifyContent:'space-between',padding:5}}>
          <Image
              style={{height:hp(7), aspectRatio:1, borderRadius:100,}}
              source={users?.profileUrl}
              placeholder={{blurhash}}
              cachePolicy='none'/>
            {isCurrentUser &&  <Button 
            onPress={() => navigation.navigate('Edit')}
            mode='outlined' style={{
            backgroundColor:'transparent', 
            borderRadius:100,
            borderWidth:1,
            borderColor:theme.colors.tertiary}}>Edit Profile</Button>}
              </View>
              <View style={{marginTop:5,flexDirection:'column',paddingRight:20}}>
              <View style={{paddingLeft:20}}>
               <Text>{
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
                  }</Text>
                  {users?.jobtitle &&   <Text
                  variant='bodySmall'
                  style={{
                    color:theme.colors.onPrimary
                  }}>{users?.jobtitle}</Text>}
                  {users?.location &&    <Text
                  variant='bodySmall'
                  style={{
                    color:theme.colors.onPrimary
                  }}><EvilIcons name='location' size={15} color={theme.colors.onTertiary}/>{users?.location}</Text>}
                    {follow_items.map((item,index)=>{
                      return <FollowComponent key={index} count={item.count} content={item.content}/>
                    })}
                </View>
              </View>
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
                }}
                >
                  <Tab.Screen
                    name='Posts'
                    component={Post}
                    options={{
                      tabBarLabelStyle:{
                        fontSize:20,
                        color:theme.colors.tertiary
                      }
                    }}
                    />
                    <Tab.Screen
                    name='Projects'
                    component={Projects}
                    options={{
                      tabBarLabelStyle:{
                        fontSize:20,
                        color:theme.colors.tertiary
                      }
                    }}
                    />
                  <Tab.Screen
                    name='Skills'
                    component={SkillsScreen}
                    options={{
                      tabBarLabelStyle:{
                        fontSize:20,
                        color:theme.colors.tertiary
                      }
                    }}
                    />
                  </Tab.Navigator>
                </View>
                </ScrollView> 
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
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
})
export default AccountScreen
