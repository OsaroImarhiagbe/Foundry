import React from 'react'
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Platform,
    useWindowDimensions} from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import HomeScreen from './HomeScreen';
import {Image} from 'expo-image'
import { useAuth } from '../authContext';
import { blurhash } from '../../utils';
import { useNavigation } from '@react-navigation/native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { FAB } from 'react-native-paper';

const Tab = createMaterialTopTabNavigator();


const DashBoardScreen = () => {

    const insets = useSafeAreaInsets(); 
    const {width,height} = useWindowDimensions();
    const {user} = useAuth()
    const navigation = useNavigation()

  const Projects = () => (
    <ScrollView
    scrollEnabled
     style={{flex:1,backgroundColor:'#000'}}>
      <View style={{flex:1}}>
        <Text style={{color:'#fff'}}>hi</Text>
    </View>
    </ScrollView>
    
  );
  const handlePress = () => {
    navigation.openDrawer();
  } 
  return (
    <View style={{flex:1,paddingTop:insets.top}}> 
        <View style={{alignItems:'center',paddingTop:10,flexDirection:'row',justifyContent:'space-between',padding:10,backgroundColor:'transparent'}}>
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
    }}
    >
        <Tab.Screen
        name='JAY'
        component={Projects}
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
        width: 40, // Adjust size
        height: 40, // Adjust size'
    },
});

export default DashBoardScreen