import React from 'react';
import { StyleSheet,  View,SafeAreaView  } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useTheme } from 'react-native-paper';


const SplashScreen = () => {
    const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container,{backgroundColor:theme.colors.background}]}>
      <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
        <ActivityIndicator size='large' animating={true} color={theme.colors.background ? '#fff' :'#000'}/>
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

