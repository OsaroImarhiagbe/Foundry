import React,{useEffect,useState} from 'react';
import { StyleSheet, Image, View,Dimensions,SafeAreaView  } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useTheme } from 'react-native-paper';


const SplashScreen = () => {

    const [loading, setLoading] = useState<boolean>(false);

    const theme = useTheme();

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    },3000)

    return () => clearTimeout(timer)
  },[])
  return (
    <SafeAreaView style={[styles.container,{backgroundColor:theme.colors.background}]}>
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size='large' animating={loading} color={theme.colors.background ? '#fff' :'#000'}/>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
    justifyContent:'center'
  },
  
});

export default SplashScreen;

