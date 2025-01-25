import React from 'react'
import {
    View,
    Text,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Image,
    StyleSheet,
    useWindowDimensions} from 'react-native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import bluejay from '../assets/images/bluejay.png'
import HomeScreen from '../screen/HomeScreen';


const Tab = createMaterialTopTabNavigator();


const DashBoardScreen = () => {

    const insets = useSafeAreaInsets(); 
    const {width,height} = useWindowDimensions();

  const Projects = () => (
    <ScrollView
    scrollEnabled
     style={{flex:1,backgroundColor:'#fff'}}>
      <View style={{flex:1,backgroundColor:'#fff'}}>
        <Text>hi</Text>
    </View>
    </ScrollView>
    
  ); 
  return (
    <SafeAreaView style={{flex:1,paddingTop:insets.top}}> 
        <View style={{alignItems:'center',paddingTop:10}}>
        <Image
                source={bluejay}
                style={styles.logo}
                resizeMode='cover'
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
        options={{
            tabBarIcon:() => (
            <MaterialCommunityIcons name='post' color='#000' size={20}
            />),
        }}
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