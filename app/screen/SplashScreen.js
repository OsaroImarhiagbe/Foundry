import React,{useEffect,useState} from 'react';
import { StyleSheet, Image, View,Dimensions,SafeAreaView  } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import color from '../../config/color';
const { width } = Dimensions.get('window');


const SplashScreen = () => {

    const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
        setProgress((prev) => {
            if(prev < 1){
                return prev + 0.01
            }
            clearInterval(timer)
            return prev
        })
    },10)
    return () => clearInterval(timer)
  },[])
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headingContainer}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('../assets/DevGuide.png')}
            style={styles.image}
            resizeMode="contain" 
          />
            <View style={{justifyContent:'center',alignItems:'center'}}>
      <ProgressBar 
      progress={progress} 
      width={width*0.8} 
      height={20} 
      color='#7ed957'/>
      </View>
        </View>
      </View>
      <View  style={styles.imageContainer}>
        <Image 
          source={require('../assets/images/People.png')}
          style={styles.footerImage}
          resizeMode='contain'
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:color.backgroundcolor,
    padding:10
  },
  headingContainer: {
    alignItems: 'center',
    padding:10,
  },
  image: {
    width: 170,
    height: 170,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical:50
  },
  footer: {
    position:'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  footerImage: {
    height: 535,
    width: width * 0.8
  },
  
});

export default SplashScreen;

