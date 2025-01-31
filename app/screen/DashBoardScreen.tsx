import React,
{
  useEffect,
  useState
}from 'react'
import {
    View,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions} from 'react-native'
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
import { Avatar, Button, Card, Text } from 'react-native-paper';
//import Tts from 'react-native-tts';
import LottieView from 'lottie-react-native';

const Tab = createMaterialTopTabNavigator();


const DashBoardScreen = () => {

    const insets = useSafeAreaInsets(); 
    const {width,height} = useWindowDimensions();
    const {user} = useAuth()
    const navigation = useNavigation()
    const [speaking,setSpeaking] = useState(false)
    const theme = useTheme()

    const skills = ['Quick Search','hello','hello','hello','hello']

    // useEffect(()=>{
    //   Tts.getInitStatus().then(() => {
    //     Tts.addEventListener('tts-start', () => setSpeaking(true));
    //     Tts.speak('Hello how are you!')
    //     Tts.speak('I am Jay your AI assistant!')
    //   }).catch((error) => console.error('Error initilzing:',error));
    //   return () => Tts.removeAllListeners()
    // },[])
  const AIScreen = () => (
    <ScrollView
    scrollEnabled
     style={{flex:1,backgroundColor:theme.colors.background}}>
      <View style={{flex:1}}>
       <View style={{alignItems:'center',justifyContent:'center',paddingTop:hp('15%')}}>
       <LottieView
           style={{width:100,height:50,backgroundColor:theme.colors.primary,borderRadius:35,position:'absolute'}}
           source={require('../assets/animations/JayAI.json')}
           autoPlay
           loop
           />  
          
          </View>
          <View>
            <Text
            variant='titleMedium'
            style={{paddingLeft:10}}
            >Jay Actions</Text>
            <FlashList
            showsHorizontalScrollIndicator={false}
            horizontal={true}
            estimatedItemSize={420}
            data={skills}
            renderItem={({item,index})=>(
              <Card key={index} style={{margin:5,width:wp('70%')}}>
              <Card.Title title={item}/>
              <Card.Content>
                <Text variant="bodyMedium"></Text>
              </Card.Content>
              <Card.Actions>
                <Button>Ok</Button>
              </Card.Actions>
              </Card>
            )}
            />
          </View>
    </View>
    </ScrollView>
    
  );
  type Prop = {
    navigation: DrawerNavigationProp<RootParamList, 'YourScreenName'>;
  };
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
        </TouchableWithoutFeedback>
        <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        />
       <TouchableOpacity
        style={styles.messageIcon}
         onPress={() => navigation.navigate('Post')}>
        <View style={styles.icon}>
           <Entypo name='new-message' size={20} color={theme.colors.primary}/>
        </View>
        </TouchableOpacity>
        </View>
        <View style={{flex:1}}>
        <Tab.Navigator
        screenOptions={{
            headerShown:false,
            swipeEnabled:true,
            tabBarIndicatorStyle:{
            backgroundColor:'#000',
            width:wp('50%'),
            },
            tabBarStyle:{
            backgroundColor:'transparent',
            },
          tabBarActiveTintColor:theme.colors.text,
          tabBarLabelStyle:{
            fontSize:hp(1.5)
          }
    }}
    >
        <Tab.Screen
        name='JAY'
        component={AIScreen}
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
});

export default DashBoardScreen