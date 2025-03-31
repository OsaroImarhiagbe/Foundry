import {
  View,
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Platform,
  RefreshControl,
  useColorScheme,
  } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import React,{useState, useEffect,useCallback} from 'react';
import { useAuth } from '../authContext';
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import FollowComponent from '../components/FollowComponent';
import { collection, where,FirebaseFirestoreTypes,doc, orderBy, onSnapshot, getDoc, Unsubscribe} from '@react-native-firebase/firestore';
import { blurhash, TimeAgo } from '../../utils/index';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { 
  useTheme,
  Text,
  Icon,
  Button,
  Divider,
  ActivityIndicator} from 'react-native-paper';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { FlashList } from '@shopify/flash-list';
import { ProjectRef, UsersRef,crashlytics, database} from '../../FirebaseConfig';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { log, recordError, setAttributes, setUserId } from '@react-native-firebase/crashlytics';
import PostComponent from '../components/PostComponent';
import { Skeleton } from 'moti/skeleton';
import { MotiView } from 'moti';
import { equalTo, onValue, orderByChild, ref,query } from '@react-native-firebase/database';

type NavigationProp = {
  ProjectScreen:undefined,
  Welcome:{
    screen?:string,
    params?:{
      screen?:string
    }
  },
  News:{
    screen?:string
  },
  Message:undefined,
  Edit:undefined,
  SkillScreen:undefined,
  ProjectEntryScreen:undefined
}

type Navigation = NativeStackNavigationProp<NavigationProp>;


type User = {
  username?:string,
  userId?:string,
  profileUrl?:string,
  projects?:number,
  follow_state?:boolean,
  connection?:string,
  jobtitle?:string,
  location?:string,
  headerUrl?:string

}
type Post = {
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
  createdAt?:number
}
type Project = {
  id?:string,
  project_name?:string
}

type Skill = {
  id:string
  skills:string
}


const Tab = createMaterialTopTabNavigator();


 
const AccountScreen = () => {

  const [users, setUsers] = useState<User | undefined>(undefined)
  const [isloading,setLoading] = useState<boolean>(true)
  const [projects,setProjects] = useState<Project[]>([])
  const [posts,setPosts] = useState<Post[]>([])
  const [skills,setSkills] = useState<Skill[]>([])
  const { user } = useAuth();
  const navigation = useNavigation<Navigation>();
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme()
  const {top} = useSafeAreaInsets()
  const dark_or_light = useColorScheme()

  


  
  const follow_items = [{count:users?.projects,content:' projects'},{count:users?.connection,content:' connection  '},{count:posts?.length,content:' posts'}]


  const UserRefresh = useCallback(async () => {
    setRefreshing(true)
    log(crashlytics,'Account Screen: User Refresh')
    const userDoc = doc(UsersRef,user.userId)
    const docRef = await getDoc(userDoc)
    try{
        if(docRef.exists){
          setUsers(docRef.data())
          setRefreshing(false)
        }else{
          console.error('No such document')
          setRefreshing(false)
        }
      }catch(error:unknown | any){
        recordError(crashlytics,error)
        setRefreshing(false)
      }finally{
        setRefreshing(false)
      }
  }, []);
  const ProjectRefresh = useCallback(async () => {
    setRefreshing(true)
    log(crashlytics,'Account Screen: On Refresh')
    try{
      const collectionRef = collection(UsersRef,user.userId,'projects')
       const unsub = onSnapshot(collectionRef,async (querySnapshot) => {
        if (!querySnapshot || querySnapshot.empty) {
          setProjects([]);
          setRefreshing(false);
          return;
        }
        let data:Project[] =[]
        querySnapshot.forEach(doc => {
          data.push({...doc.data(),id:doc.id})
        })
        setProjects(data)
        setRefreshing(false)
      },(error:unknown | any) => {
        recordError(crashlytics,error)
        console.error(`Error in snapshot listener: ${error.message}`)
        setRefreshing(false)
      })
      return () => unsub()
    }catch(err:unknown | any){
      recordError(crashlytics,err)
      console.error('error grabbing user projects:',err.message)
      setRefreshing(false)
    }
  }, []);
  const PostRefresh = useCallback(async () => {
    setRefreshing(true)
    log(crashlytics,'Account Screen: POST Refresh')
    try{
      const postRef = ref(database,'/posts')
      const orderedQuery = query(postRef,orderByChild('auth_id'),equalTo(user.userId),)
      const unsub = onValue(orderedQuery,async (snapshot) => {
        if (!snapshot.exists()) {
          setPosts([]);
          setRefreshing(false);
          return;
        }
        const data:Post[] = []
        Object.keys(snapshot.val()).forEach(key => {
          data.push({...snapshot.val(),id:key})
        })
        setPosts(data)
        setRefreshing(false)
      },(error:unknown | any) => {
        recordError(crashlytics,error)
        console.error(`Error in snapshot listener: ${error}`)
        setRefreshing(false)
      })
      return () => unsub()
    }catch(err:any){
      recordError(crashlytics,err)
      console.error('error grabbing user post:',err)
      setRefreshing(false)
    }
  }, []);

  const SkillRefresh = useCallback(async () => {
    setRefreshing(true)
    log(crashlytics,'Account Screen: On Refresh')
    const userDoc = doc(UsersRef,user.userId)
    const docRef = await getDoc(userDoc)
    try{
        if(docRef.exists){
          setUsers(docRef.data())
          setRefreshing(false)
        }else{
          console.error('No such document')
          setRefreshing(false)
        }
      }catch(error:unknown | any){
        recordError(crashlytics,error)
        setRefreshing(false)
      }finally{
        setRefreshing(false)
      }
  }, []);

  useEffect(() => {
    log(crashlytics,'Account Screen: Grabbing Users Projects')
    if(projects.length === 0) return;
    try{
      const collectionRef = collection(ProjectRef,user.userId,'projects')
       const unsub = onSnapshot(collectionRef,async (docRef) => {
        if (!docRef || docRef.empty) {
          setProjects([]);
          setLoading(false);
          return;
        }
        let data:Project[] =[]
        docRef.forEach(doc => {
          data.push({...doc.data(),id:doc.id})
        })
        setProjects(data)
        setLoading(false)
      },(error:unknown | any) => {
        recordError(crashlytics,error)
        console.error(`Error in snapshot listener: ${error.message}`)
        setLoading(false)
      })
      return () => unsub()
    }catch(err:unknown | any){
      recordError(crashlytics,err)
      console.error('error grabbing user projects:',err.message)
      setLoading(false)
    }
  },[])

  useEffect(() => {
    log(crashlytics,'Account Screen: Grabbing Users Post')
    try{
      const postRef = ref(database,'/posts')
      const orderedQuery = query(postRef,orderByChild('auth_id'),equalTo(user.userId))
      const unsub = onValue(orderedQuery,(snapshot) => {
        if (!snapshot.exists()) {
          setPosts([]);
          setLoading(false);
          return;
        }
        const data:Post[] = []
        Object.keys(snapshot.val()).forEach(key => {
          data.push({...snapshot.val()[key],id:key})
        })
        setPosts(data)
        setLoading(false)
      },(error:unknown | any) => {
        recordError(crashlytics,error)
        console.error(`Error in snapshot listener: ${error}`)
        setLoading(false)
      })
      return () => unsub()
    }catch(err:any){
      recordError(crashlytics,err)
      console.error('error grabbing user post:',err)
      setLoading(false)
    }finally{
      setLoading(false)
    }
  },[])

  useEffect(() => {
    log(crashlytics,'Account Screen: Grabbing User ')
    setUserId(crashlytics,user.userId),
    setAttributes(crashlytics,{
      id:user.userId
    })
    try{
      const userDoc = doc(UsersRef,user.userId)
        const unsub = onSnapshot(userDoc,(documentSnapshot) =>{
          if(!documentSnapshot){
            setUsers(undefined)
            return;
          }
          if(documentSnapshot.exists){
            setUsers(documentSnapshot.data())
            setSkills(documentSnapshot.data()?.skllls)
            setLoading(false)
          }else{
            console.error('No such document')
            setLoading(false)
          }
        },
          (error:unknown | any)=>{
            recordError(crashlytics,error)
            console.error(`No such document ${error.message}`)
            setLoading(false)
          }
        );
        return () => unsub()
      }catch(error: unknown | any){
        recordError(crashlytics,error)
        setLoading(false)
      }
  },[])

  const handleProjectEntry = useCallback(() => {
    navigation.navigate('ProjectEntryScreen')
  },[])

  const handleEdit = useCallback(() => {
    navigation.navigate('Edit')
  },[])




  const Post = React.memo(() => (
    <View
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
        <FlashList
          contentContainerStyle={{padding:0}}
          data={posts}
          estimatedItemSize={460}
          onRefresh={PostRefresh}
          ListEmptyComponent={() => (
            <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
              <Text variant='bodyMedium'>No post at the moment</Text>
            </View>
          )}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          ItemSeparatorComponent={()=> (
            <Divider/>
          )}
          ListFooterComponent={() => (
              <ActivityIndicator color='#fff' size='small' animating={isloading}/>
          )}
          renderItem={({item}) => 
            <PostComponent
            auth_profile={item.auth_profile}
            like_count={item.like_count}
            url={item.imageUrl}
            post_id={item.post_id}
            name={item.name}
            content={item.content}
            mount={isloading}
            date={TimeAgo(item?.createdAt ?? 0)}
            comment_count={item.comment_count}/>
           }
          keyExtractor={(item)=> item?.post_id?.toString() || `defualt-${item.id}`}
              />
    </SafeAreaView>
    </View>
    
  )); 
  
  const Projects = React.memo(() => (
    <View style={{flex:1,backgroundColor:theme.colors.background}}>
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
          <FlashList
          contentContainerStyle={{padding:0}}
          estimatedItemSize={460}
          data={projects}
          onRefresh={ProjectRefresh}
          keyExtractor={(item)=> item?.id?.toString() || `defualt-${item.id}`}
          ListEmptyComponent={(item) => (
            <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
              <TouchableOpacity onPress={handleProjectEntry}>
              <MotiView
           transition={{
            type:'timing'
           }}
           style={{
            width:100,}}
            >
              <Skeleton
                show={isloading}
                radius='round'
                colorMode={dark_or_light ? 'dark':'light'}
                >
              <Text variant='bodyMedium'>Enter a Project</Text>
              </Skeleton>
              </MotiView>
              </TouchableOpacity>
            </View>
          )}
          onEndReachedThreshold={0.1}
          refreshing={refreshing}
          ItemSeparatorComponent={()=> (
            <Divider/>
          )}
          ListFooterComponent={() => (
            <ActivityIndicator color='#fff' size='small' animating={isloading}/>
         )}
          renderItem={({item}) => (
            <TouchableOpacity onPress={()=>navigation.navigate('Welcome',{screen:'ProjectScreen'})}>
             <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
            <Text style={{ textAlign: 'center', color: '#fff' }}>{item?.project_name}</Text>
          </View>
          </TouchableOpacity>)}
          />
    </SafeAreaView>
    </View>
  ));

  const SkillsScreen = React.memo(() => (
    <View style={{flex:1,backgroundColor:theme.colors.background}}>
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,padding:50}}>
      <FlashList
      data={skills}
      contentContainerStyle={{padding:0}}
      estimatedItemSize={460}
      onRefresh={SkillRefresh}
      keyExtractor={(item)=> item?.id?.toString() ||  `defualt-${item.id}`}
      ListEmptyComponent={(item) => (
      <View style={{flex:1,alignItems:'center',justifyContent:'center',paddingTop:5}}>
           <TouchableOpacity onPress={()=> navigation.navigate('SkillScreen')}>
           <MotiView
           transition={{
            type:'timing'
           }}
           style={{
            width:100,}}
            >
              <Skeleton
                show={isloading}
                radius='round'
                colorMode={dark_or_light ? 'dark':'light'}
                >
              <Text variant='bodyMedium'>Enter a Skill</Text>
              </Skeleton>
              </MotiView>
              </TouchableOpacity>
        </View>
      )}
      onEndReachedThreshold={0.1}
      refreshing={refreshing}
      ItemSeparatorComponent={()=> (
        <Divider/>
      )}
      ListFooterComponent={() => (
        <ActivityIndicator color='#fff' size='small' animating={isloading}/>
     )}
      renderItem={({item}) => (
      <TouchableOpacity onPress={()=>navigation.navigate('SkillScreen')}>
        <View style={{ backgroundColor: '#252525', borderRadius: 25, padding: 30,marginBottom:10 }}>
          <Text style={{ textAlign: 'center', color: '#fff' }}>{item?.skills}</Text>
          </View>
          </TouchableOpacity>
          )}
          />
    </SafeAreaView>
    </View>
  ));

  return (
  
    <View style={[styles.screen,{backgroundColor:theme.colors.background,paddingTop:Platform.OS === 'ios' ? top: 0}]}>
  <ScrollView
    scrollEnabled={true}
    showsVerticalScrollIndicator={false}
    style={styles.screen}
    contentContainerStyle={{flexGrow:1}}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={UserRefresh}/>}
    >
      {
        users?.headerUrl ? 
        (
          <MotiView
          transition={{
            type: 'timing',
          }}
          style={{
            height:100
          }}
          >
            <Skeleton
              show={isloading}
              height={150}
              radius='square'
              colorMode={dark_or_light ? 'dark':'light'}
            >
            <ImageBackground
        resizeMode='cover'
        imageStyle={{height:150,justifyContent:'flex-end'}}
        style={{
        height:100,
        bottom:0,
        justifyContent:'flex-end',
      }}
      source={{uri:users?.headerUrl}}
      >
       <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',bottom:40}}>
       <TouchableOpacity onPress={() => navigation.navigate('Welcome',{screen:'Dash'})} style={{padding:10}}>
        <Icon
        source='arrow-left-circle'
        size={hp(3)}
        color={theme.colors.background}
        />
      </TouchableOpacity>
        <TouchableOpacity style={{alignItems:'flex-end',padding:5}} onPress={() => console.log('button pressed')}>
        <Icon size={hp(3)} source='account-search' color={theme.colors.tertiaryContainer}/>
        </TouchableOpacity>
        </View> 
      </ImageBackground>
            </Skeleton>
          </MotiView>) : (
        
        <MotiView
        transition={{
          type: 'timing',
        }}
        style={{
          height:100
        }}
        >
          <Skeleton
          show={isloading}
          height={150}
          radius='square'
          colorMode={dark_or_light ? 'dark':'light'}
          >
          <ImageBackground
        resizeMode='cover'
        imageStyle={{height:150,justifyContent:'flex-end'}}
        style={{
        height:100,
        bottom:0,
        justifyContent:'flex-end',
      }}
      source={require('../assets/images/header.png')}
      >
       <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',bottom:40}}>
       <TouchableOpacity onPress={() => navigation.navigate('Welcome',{screen:'Dash'})} style={{padding:10}}>
        <Icon
        source='arrow-left-circle'
        size={hp(3)}
        color={theme.colors.background}
        />
      </TouchableOpacity>
        <TouchableOpacity style={{alignItems:'flex-end',padding:5}} onPress={() => console.log('button pressed')}>
        <Icon size={hp(3)} source='account-search' color={theme.colors.tertiaryContainer}/>
        </TouchableOpacity>
        </View> 
      </ImageBackground>
        </Skeleton></MotiView> )
      }
      <View style={{
        flexDirection:'row',
        paddingLeft:10,
        justifyContent:'space-between',
        padding:5,}}>
       {
        users?.profileUrl ?
        <MotiView
        transition={{
          type: 'timing',
        }}
        >
          <Skeleton
           show={isloading}
          radius='round'
          colorMode={dark_or_light ? 'dark':'light'}
          >
          <Image
        style={{height:hp(8), aspectRatio:1, borderRadius:100,borderWidth:2,borderColor:theme.colors.background}}
        source={users?.profileUrl}
        placeholder={{blurhash}}
        cachePolicy='none'/>
          </Skeleton>
        </MotiView>  :  
        <MotiView
        transition={{
          type: 'timing',
        }}
        >
          <Skeleton
          show={isloading}
          radius='round'
          colorMode={dark_or_light ? 'dark':'light'}
          >
          <Image
        style={{
          height:hp(8), 
          aspectRatio:1, 
          borderRadius:100,
          borderWidth:2,
          borderColor:theme.colors.background}}
        source={require('../assets/user.png')}
        placeholder={{blurhash}}
        cachePolicy='none'/>
          </Skeleton>
        </MotiView>
       } 
      <MotiView
        transition={{
          type: 'timing',
        }}
      >
        <Skeleton 
        colorMode={dark_or_light ? 'dark':'light'}
        show={isloading}>
        <Button 
        onPress={handleEdit}
        mode='outlined' style={{
        backgroundColor:'transparent', 
        borderRadius:100,
        borderWidth:1,
        borderColor:theme.colors.tertiary}}>Edit Profile</Button>
        </Skeleton>
        </MotiView>   
          </View>
          <View style={{marginTop:5}}>
          <View style={{paddingLeft:10,flexDirection:'column'}}>
            <MotiView
            transition={{
              type:'timing',
            }}
            style={{
              marginVertical:2
            }}
            >
              <Skeleton
              colorMode={dark_or_light ? 'dark':'light'}
              show={isloading}
              >
              <Text
              variant='bodySmall'
              style={{
                color:theme.colors.onTertiary
            }}>@{users?.username}</Text>
              </Skeleton>
            </MotiView>
            <MotiView
            transition={{
              type: 'timing',
            }}
            style={{
              width:50,
              marginVertical:2
            }}
            >
              <Skeleton
              colorMode={dark_or_light ? 'dark':'light'} 
              show={isloading}>
              <Text
              variant='bodySmall'
              style={{
                color:theme.colors.onTertiary
              }}>{users?.jobtitle}</Text>
              </Skeleton>
            </MotiView>
              <MotiView
              transition={{
                type:'timing',
              }}
              style={{
                width:50,
                marginVertical:2
              }}
              >
                <Skeleton
                colorMode={dark_or_light ? 'dark':'light'}
                show={isloading}>
                <Text
              variant='bodySmall'
              style={{
                color:theme.colors.onTertiary
              }}><EvilIcons name='location' size={15} color={theme.colors.onTertiary}/>{users?.location}</Text>
                </Skeleton>
              </MotiView>
              <View style={{flexDirection:'row',marginTop:10}}>
              {follow_items.map((item,index)=>{
                  return <MotiView
                  key={index}
                  transition={{
                    type:'timing',
                  }}
                  style={{
                    marginHorizontal:2
                  }}
                  >
                    <Skeleton
                    show={isloading}
                    colorMode={dark_or_light ? 'dark':'light'}
                    >
                    <FollowComponent count={item.count} content={item.content}/>
                    </Skeleton>
                    </MotiView>
                })}
              </View>
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
    </View>
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
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
})
export default AccountScreen
