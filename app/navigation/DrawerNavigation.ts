import { createDrawerNavigator } from '@react-navigation/drawer';
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import { lazy,Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
import TestScreen from '../screen/TestScreen';

const Drawer = createDrawerNavigator();


const TabNavigation = lazy(() => import('./TabNavigation'))


const TabNavigationWrapper = (props) =>{
  return (

    <Suspense fallback={<ActivityIndicator size='small' color='#000' />}>
    <TabNavigation {...props}/>
  </Suspense>

  )
}

const DrawerNavigation = ({route}) => {
  const navigation = useNavigation();

  return (

    <Drawer.Navigator 
    initialRouteName='Home'
    screenOptions={{
      drawerStyle:{
        backgroundColor:color.white,
      }
    }}>
      <Drawer.Screen
      name='Home'
      component={TabNavigationWrapper}
      initialParams={{route}}
      options={{headerShown:false,
      }}/>
       <Drawer.Screen
      name='Resource'
      component={TestScreen}/>
       <Drawer.Screen
      name='Code'
      component={TestScreen}/>
    </Drawer.Navigator>

  )
}

export default DrawerNavigation
