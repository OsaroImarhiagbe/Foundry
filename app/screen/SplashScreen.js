import React,{useEffect,useState} from 'react';
import { StyleSheet, Image, View,Dimensions,SafeAreaView  } from 'react-native';
import color from '../../config/color';
import { ActivityIndicator } from 'react-native-paper';


const SplashScreen = () => {

    const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      setLoading(false)
    },3000)
  },[])
  return (
    <SafeAreaView style={styles.container}>
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size='large' animating={loading} color='#000'/>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff',
    alignItems:'center',
    justifyContent:'center'
  },
  
});

export default SplashScreen;

