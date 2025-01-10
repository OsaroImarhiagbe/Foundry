import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screen/LoginScreen';
import { lazy,Suspense, useEffect,useState } from 'react';
import { ActivityIndicator } from 'react-native';
import ProjectScreen from '../screen/ProjectScreen';
import LocationScreen from '../screen/LocationScreen';
import { useNavigation } from '@react-navigation/native';
import {useAuth} from '../authContext'
import AsyncStorage from '@react-native-async-storage/async-storage';
const RegisterScreen = lazy(() => import('../screen/RegisterScreen'))
const DrawerNavigation = lazy(() => import('./DrawerNavigation'))
const ReportBugScreen = lazy(() => import('../screen/ReportBugScreen'))
const ContactUsScreen = lazy(() => import('../screen/ContactUsScreen'))
const ProjectEntryScreen = lazy(() => import('../screen/ProjectEntryScreen'))
const SkillsScreen = lazy(() => import('../screen/SkillsScreen'))
const OnboardingScreen = lazy(()=> import('../screen/OnboardingScreen'))
const RegisterScreenWrapper = (props) => {
  
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <RegisterScreen/>
    </Suspense>
  
    )
}
//AsyncStorage.clear()
const DrawerNavigationWrapper = (props) => {
  
    return (
      <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
      <DrawerNavigation/>
    </Suspense>
  
    )
}
const ReportBugScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <ReportBugScreen/>
  </Suspense>

  )
}
const ContactUsScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <ContactUsScreen/>
  </Suspense>

  )
}
const SkillsScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <SkillsScreen/>
  </Suspense>

  )
}

const ProjectEntryScreenWrapper = (props) => {
  
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <ProjectEntryScreen/>
  </Suspense>

  )
}

const OnboardingScreenWrapper = () =>{
  return (
    <Suspense fallback={<ActivityIndicator size='small' color='#fff'/>}>
    <OnboardingScreen/>
  </Suspense>
  )
}
const AuthNavigation = () => {
  const navigation = useNavigation()
  const [user, setUser] = useState(null)
  const [loading,setLoading] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(undefined)
  const [showOnboarding,setShowOnboarding] = useState(null)

  const {updateUserData} = useAuth()

    useEffect(() =>{
      setLoading(true)
      const getAuthState = async () => {
          const currentUser = await AsyncStorage.getItem('authUser')
          if(currentUser !== null){
              setIsAuthenticated(true)
              setUser(currentUser)
              updateUserData(currentUser.uid)
              navigation.navigate('Drawer',{screen:'Home'})
              setLoading(false)
          }else{
              setIsAuthenticated(false);
              setUser(null)
              setLoading(false)
          }
      }
      getAuthState()
  },[])

  useEffect(() => {
    checkifOnboard()
  },[])


  const  checkifOnboard = async () => {
      const onboardkey = await AsyncStorage.getItem('onboarded')
      if(onboardkey==1){
        setShowOnboarding(false)
      }else{
        setShowOnboarding(true)
      }
    }
  



    const Stack = createStackNavigator()


    if(showOnboarding==null){
      return null
    }
    if(loading === null && showOnboarding === null){
      return (
          <Stack.Navigator
          initialRouteName='Register'
          >    
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown:false,
                gestureEnabled:false,
                animation:'fade_from_bottom'
                
              }}
            /> 
            <Stack.Screen
            name="Register"
            component={RegisterScreenWrapper}
            options={{
              headerShown:false,
              gestureEnabled:false
            }}/>
            <Stack.Screen
            name="Onboarding"
            component={OnboardingScreenWrapper}
            options={{
              headerShown:false,
              presentation:'modal',
            }}/>
            <Stack.Screen
            name='Drawer'
            component={DrawerNavigationWrapper}
            options={{
              headerShown:false,
              gestureEnabled:false,
              animation:'fade_from_bottom'
            }}/>
              <Stack.Screen
            name="ProjectScreen"
            component={ProjectScreen}
            options={{
              headerShown:false,
              presentation:'modal',
            }}/>
                <Stack.Screen
            name="LocationScreen"
            component={LocationScreen}
            options={{
              headerShown:false,
              presentation:'modal',
            }}/>
            <Stack.Screen
            name="ReportBugScreen"
            component={ReportBugScreenWrapper}
            options={{
              headerShown:false,
              presentation:'modal',
            }}/>
              <Stack.Screen
            name="ContactUsScreen"
            component={ContactUsScreenWrapper}
            options={{
              headerShown:false,
              presentation:'modal',
            }}/>
            <Stack.Screen
            name="ProjectEntryScreen"
            component={ProjectEntryScreenWrapper}
            options={{
              headerShown:false,
              presentation:'modal',
            }}/>
             <Stack.Screen
            name="SkillsScreen"
            component={SkillsScreenWrapper}
            options={{
              headerShown:false,
              presentation:'modal',
            }}/>
          </Stack.Navigator>
        )
    }else{
      return (
        <Stack.Navigator>    
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown:false,
              gestureEnabled:false,
              animation:'fade_from_bottom'
              
            }}
          /> 
          <Stack.Screen
          name="Register"
          component={RegisterScreenWrapper}
          options={{
            headerShown:false,
            gestureEnabled:false
          }}/>
          <Stack.Screen
          name="Onboarding"
          component={OnboardingScreenWrapper}
          options={{
            headerShown:false,
            presentation:'modal',
          }}/>
          <Stack.Screen
          name='Drawer'
          component={DrawerNavigationWrapper}
          options={{
            headerShown:false,
            gestureEnabled:false,
            animation:'fade_from_bottom'
          }}/>
            <Stack.Screen
          name="ProjectScreen"
          component={ProjectScreen}
          options={{
            headerShown:false,
            presentation:'modal',
          }}/>
              <Stack.Screen
          name="LocationScreen"
          component={LocationScreen}
          options={{
            headerShown:false,
            presentation:'modal',
          }}/>
          <Stack.Screen
          name="ReportBugScreen"
          component={ReportBugScreenWrapper}
          options={{
            headerShown:false,
            presentation:'modal',
          }}/>
            <Stack.Screen
          name="ContactUsScreen"
          component={ContactUsScreenWrapper}
          options={{
            headerShown:false,
            presentation:'modal',
          }}/>
          <Stack.Screen
          name="ProjectEntryScreen"
          component={ProjectEntryScreenWrapper}
          options={{
            headerShown:false,
            presentation:'modal',
          }}/>
           <Stack.Screen
          name="SkillsScreen"
          component={SkillsScreenWrapper}
          options={{
            headerShown:false,
            presentation:'modal',
          }}/>
        </Stack.Navigator>
      )
    }

  }

export default AuthNavigation