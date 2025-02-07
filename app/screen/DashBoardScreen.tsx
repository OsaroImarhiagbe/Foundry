import React,
{
  useEffect,
  useState,
  lazy,
  Suspense
}from 'react'
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    useColorScheme} from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import HomeScreen from './HomeScreen';
import {Image} from 'expo-image'
import { useAuth } from '../authContext';
import { blurhash } from '../../utils';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { FAB } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import { FlashList } from '@shopify/flash-list';
import {Text,ActivityIndicator,Divider } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { MotiView } from 'moti';
import { Skeleton } from 'moti/skeleton';

type NavigationProp = {
  openDrawer(): unknown;
  navigate(arg0: string, arg1: { screen: string; }): unknown;
  SecondStack:undefined,
  Home:undefined
}
const Tab = createMaterialTopTabNavigator();
const PostComponent = lazy(() => import('../components/PostComponent'))
const Spacer = ({ height = 16 }) => <View style={{ height }} />;

interface Post{
  id: string;
  auth_profile?: string;
  like_count?: number;
  imageUrl?: string;
  post_id?: string;
  name?: string;
  content?: string;
  createdAt?: FirebaseFirestoreTypes.Timestamp
  comment_count?: number;
  mount?:boolean
};

const DashBoardScreen = () => {

    const insets = useSafeAreaInsets(); 
    const {width,height} = useWindowDimensions();
    const {user} = useAuth()
    const navigation = useNavigation<NavigationProp>()
    const [loading,setLoading] = useState<boolean>(false)
    const theme = useTheme()
    const dark_or_light = useColorScheme()
    const [post, setPost] = useState<Post[]>([])

    const skills = ['Quick Search','hello','hello','hello','hello']

    useEffect(() => {
      setLoading(true)
      setTimeout( () => {
        setLoading(false)
      },3000)
    },[])
  const FeedScreen = () => (
    <ScrollView
    scrollEnabled
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <View style={{flex:1}}>
            {
              loading ?
              Array.from({length:5}).map((_,index)=> (
                <MotiView
                key={index}
              transition={{
                delay:300
              }}
              style={[styles.container, styles.padded]}
            >
              <Skeleton colorMode={dark_or_light ? 'dark' :'light'} width={250} />
              <Spacer height={8}/>
              <Skeleton colorMode={dark_or_light ? 'dark' :'light'} width={'100%'} />
              <Spacer height={8}/>
              <Skeleton colorMode={dark_or_light ? 'dark' :'light'} width={'100%'} />
              <Divider/>
            </MotiView>
              )) :    <FlashList
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            estimatedItemSize={420}
            data={post}
            ListEmptyComponent={(item) => (
              <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text>No Post</Text></View>
              
            )}
            ItemSeparatorComponent={()=> (
              <Divider/>
            )}
            renderItem={({item}) => <Suspense fallback={<ActivityIndicator size='small' color='#000'/>}>
            <PostComponent
            auth_profile={item.auth_profile}
            count={item.like_count}
            url={item.imageUrl}
            id={item.post_id}
            name={item.name}
            content={item.content}
            date={item?.createdAt?.toDate().toLocaleString()}
            comment_count={item.comment_count}/>
            </Suspense>}
          keyExtractor={(item)=> item?.post_id?.toString() || Math.random().toString()}
          />}
          </View>
    </ScrollView>
    
  );
  const handlePress = () => {
    navigation.openDrawer();
  } 
  return (
    <View style={{flex:1,paddingTop:hp(5),backgroundColor:theme.colors.background}}> 
        <View style={{alignItems:'center',paddingTop:20,flexDirection:'row',justifyContent:'space-between',padding:10,backgroundColor:'transparent'}}>
        <TouchableWithoutFeedback onPress={handlePress}>
        <Image
        style={{height:hp(4.3), aspectRatio:1, borderRadius:100}}
        source={user?.profileUrl}
        placeholder={{blurhash}}
        cachePolicy='none'/>
        </TouchableWithoutFeedback >
        <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        />
       <TouchableOpacity
         onPress={() => navigation.navigate('SecondStack',{screen:'Post'})}>
        <View style={styles.icon}>
           <Entypo name='new-message' size={20} color={theme.colors.primary}/>
        </View>
        </TouchableOpacity>
        </View>
        <View style={{flex:1}}>
        <Tab.Navigator
        screenOptions={{
            swipeEnabled:true,
            tabBarIndicatorStyle:{
            backgroundColor:theme.colors.primary,
            width:wp('50%'),
            },
            tabBarStyle:{
            backgroundColor:'transparent',
            },
          tabBarActiveTintColor:theme.colors.primary,
          tabBarLabelStyle:{
            fontSize:hp(1.5)
          }
    }}
    >
        <Tab.Screen
        name='Network'
        component={FeedScreen}
        />
        <Tab.Screen
        name='Community'
        component={HomeScreen}
        />
        </Tab.Navigator>
        <FAB
          icon="robot"
          variant='surface'
          size='medium'
          style={{width:wp('20%'),position:'absolute',right:16,top:hp(65),alignItems:'center',borderRadius:30}}
          onPress={() => console.log('Pressed')}
        />
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
    logo: {
        width: 40,
        height: 40, 
    },
    icon:{
      margin:5
    },
    padded: {
      padding: 16,
    },
    container:{
      flex:1
    }
});

export default DashBoardScreen