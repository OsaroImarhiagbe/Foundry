import React from 'react'
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    useWindowDimensions} from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import HomeScreen from '../screen/HomeScreen';
import {Image} from 'expo-image'
import { useAuth } from '../authContext';
import { blurhash } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const Tab = createMaterialTopTabNavigator();


const DashBoardScreen = () => {

    const insets = useSafeAreaInsets(); 
    const {width,height} = useWindowDimensions();
    const {user} = useAuth()
    const navigation = useNavigation()

  const Projects = () => (
    <ScrollView
    scrollEnabled
     style={{flex:1,backgroundColor:'#fff'}}>
      <View style={{flex:1,backgroundColor:'#fff'}}>
        <Text>hi</Text>
    </View>
    </ScrollView>
    
  );
  const handlePress = () => {
    navigation.openDrawer();
  } 
  return (
    <SafeAreaView style={{flex:1,paddingTop:insets.top}}> 
        <View style={{alignItems:'center',paddingTop:10,flexDirection:'row',justifyContent:'space-between',padding:10}}>
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
        <Image
        source={require('../assets/images/icon.png')}
        style={styles.logo}
        />
        </View>
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
    }}
    >
        <Tab.Screen
        name='Home'
        component={Projects}
        />
        <Tab.Screen
        name='Community'
        component={HomeScreen}
        />
        </Tab.Navigator>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    logo: {
        width: 40, // Adjust size
        height: 40, // Adjust size'
    },
});

export default DashBoardScreen