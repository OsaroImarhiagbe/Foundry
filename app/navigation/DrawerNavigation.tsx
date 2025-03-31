import { createDrawerNavigator, DrawerItem,DrawerContentScrollView,DrawerItemList } from '@react-navigation/drawer';
import React, { useState,useCallback, useEffect, useRef} from 'react';
import { TouchableWithoutFeedback,View} from 'react-native';
import { Image } from 'expo-image';
import { blurhash } from 'utils';
import { useAuth } from '../authContext.tsx';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Icon,useTheme,Text} from 'react-native-paper';
import LazyScreenComponent from '../components/LazyScreenComponent.tsx';
import TabNavigation from '../navigation/TabNavigation.tsx';
import SplashScreen from '../screen/SplashScreen.tsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { recordError } from '@react-native-firebase/crashlytics';
import { crashlytics } from 'FirebaseConfig.ts';
const SettingsScreen = React.lazy(() => import('../screen/SettingsScreen.tsx'));
const OnboardingScreen = React.lazy(() => import('../screen/OnboardingScreen.tsx'));
const Drawer = createDrawerNavigator();


const SettingsScreenWrapper = React.memo(() => {
  return (
    <LazyScreenComponent>
      <SettingsScreen/>
    </LazyScreenComponent>
  )
})

interface OnboardingScreenWrapperProps {
  refreshStatus: () => void;
}

const OnboardingScreenWrapper: React.FC<OnboardingScreenWrapperProps> = React.memo(({ refreshStatus }) => {
  return (
    <LazyScreenComponent>
      <OnboardingScreen refreshStatus={refreshStatus} />
    </LazyScreenComponent>
  );
});



const DrawerNavigation = () => {
  const theme = useTheme()
  const {user,logout,} = useAuth()
  const [Onboarding,setOnboardingStatus] = useState<string | null>()
  const [isloading,setLoading] = useState<boolean>(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0);


  const refreshOnboardingStatus = () => {
    setRefreshTrigger(prev => prev + 1);
  };


  const handleLogout = useCallback(async () => {
    setLoading(true)
    try{
      await logout();
    }catch(error){
      console.error(` Error failed: ${error}`)
    }finally{
      setLoading(false);
    }
  },[])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    },500);
    return () => clearTimeout(timer)
  },[])

  useEffect(() => {
    const status = async () => {
      try{
        const registered = await AsyncStorage.getItem('justRegistered')
        if(registered === 'true'){
          setOnboardingStatus(null)
          await AsyncStorage.setItem('justRegistered','false')
        }else{
          const OnboardingStatus = await AsyncStorage.getItem('onboarded')
          setOnboardingStatus(OnboardingStatus)
        }
      }catch(error:unknown | any){
        recordError(crashlytics,error)
        console.error('Error grabbing the Onboarding Status',error)
      }finally{
        setLoading(false)
      }
    }
    status();
  },[refreshTrigger])

  
  if(isloading){
    return (
      <SplashScreen/>
    )
  }

  if(Onboarding !== '1'){
    return(
      <OnboardingScreenWrapper refreshStatus={refreshOnboardingStatus}  />
    )
  }


  return (

    <Drawer.Navigator
    initialRouteName='Home'
    drawerContent={props => (
      <DrawerContentScrollView {...props}>
          <View style={{ padding: 10,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
           <TouchableWithoutFeedback  onPress={() =>  props.navigation.navigate('Home',{screen:'You'})}>
            {
              user.profileUrl ? 
              <Image
              style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
              source={{uri:user?.profileUrl}}
              placeholder={{blurhash}}
              /> :   <Image
              style={{height:hp(3.3), aspectRatio:1, borderRadius:100,}}
              source={require('../assets/user.png')}
              placeholder={{blurhash}}
              />
            }
            </TouchableWithoutFeedback> 
            <Text>{user?.username}</Text>
          </View>
          <DrawerItemList {...props}/>
          <DrawerItem
          label="Logout"
          labelStyle={{
            color:theme.colors.tertiary,
            fontSize:24
          }}
          icon={ () => (<Icon
            source="logout"
            color={theme.colors.tertiary}
            size={20}/>)}
            onPress={handleLogout}
          />
      </DrawerContentScrollView>
    )}
    screenOptions={{
      swipeEnabled:true,
      drawerType:'front',
      drawerStyle:{
        backgroundColor:theme.colors.background,
        paddingTop:hp(5),
      },
    }}>
      <Drawer.Screen
      name='Home'
      component={TabNavigation}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="home"
          color={theme.colors.tertiary}
          size={size}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary,
          fontSize:24
        },
        headerShown:false,
      }}/>
    <Drawer.Screen
      name='Settings'
      component={SettingsScreenWrapper}
      options={{
        drawerIcon:({focused,color,size}) => (
          <Icon
          source="cog-outline"
          color={theme.colors.tertiary}
          size={size}/>
        ),
        drawerLabelStyle:{
          color:theme.colors.tertiary,
          fontSize:24
        },
        headerShown:false,
      }}/>
    </Drawer.Navigator>

  )
}

export default DrawerNavigation
