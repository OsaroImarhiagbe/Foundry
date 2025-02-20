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
import {Image} from 'expo-image'
import { useAuth } from '../authContext';
import { blurhash } from '../../utils';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { FAB } from 'react-native-paper';
import Entypo from 'react-native-vector-icons/Entypo';
import {ActivityIndicator,Divider,Text} from 'react-native-paper';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import crashlytics from '@react-native-firebase/crashlytics'
import { MotiView } from 'moti';
import { FlashList } from '@shopify/flash-list';
import { Skeleton } from 'moti/skeleton';

const PostComponent = lazy(() => import('../components/PostComponent'))

const Spacer = ({ height = 16 }) => <View style={{ height }} />;
const skills = ['Quick Search','hello','hello','hello','hello']
type NavigationProp = {
    openDrawer(): undefined;
    navigate(arg0?: string, arg1?: { screen: string; }): unknown;
    SecondStack:undefined,
    Home:undefined,
    Post:undefined
}

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
  

const FeedScreen = () => {
    const theme = useTheme()
    const {user} = useAuth()
    const navigation = useNavigation<NavigationProp>()
    const [loading,setLoading] = useState<boolean>(false)
    const dark_or_light = useColorScheme()
    const [post, setPost] = useState<Post[]>([])

    useEffect(() => {
        setLoading(true)
        setTimeout( () => {
          setLoading(false)
        },3000)
      },[])
  return (
      <View style={{flex:1,backgroundColor:theme.colors.background}}>
            {
              loading ?
              Array.from({length:5}).map((_,index)=> (
                <MotiView
                key={index}
              transition={{
                delay:300
              }}
              style={[styles.container, styles.padded]}
              animate={{ backgroundColor: dark_or_light ? '#ffffff' : '#000000' }}
            >
            <Skeleton colorMode={dark_or_light ? 'light':'dark'} radius="round" height={hp(4.3)}/>
            <Spacer height={8}/>
            <Skeleton height={'100%'} colorMode={dark_or_light ? 'light':'dark'} width={'100%'} radius='square'/>
            </MotiView>
              )) :    <FlashList
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{padding:0}}
            horizontal={true}
            estimatedItemSize={460}
            data={post}
            ListEmptyComponent={(item) => (
              <View style={{flex:1,alignItems:'center',justifyContent:'center'}}><Text variant='bodySmall' style={{color:theme.colors.tertiary,fontSize:16}}>No Post</Text></View>
              
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

export default FeedScreen