import React from 'react'
import {View,Text,StyleSheet,Dimensions} from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'
import LottieView from 'lottie-react-native';
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width,height} = Dimensions.get('window')
const OnboardingScreen = () => {
    const navigation = useNavigation()

    const handleDone = async () => {
        await AsyncStorage.setItem('onboarded','1')
        navigation.navigate('Drawer',{screen:'Home'})
    }
  return (
    <View style={styles.screen}>
    <Onboarding
        onDone={handleDone}
        onSkip={handleDone}
        containerStyles={{paddingHorizontal:15}}
        pages={[
            {
            backgroundColor: '#00bf63',
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <View>
               <LottieView style={styles.lottie} source={require('../assets/animations/animation1.json')} autoPlay loop />;
               </View>
            ),
            title: 'Welcome to DevGuides',
            subtitle: 'Your journey to becoming a better developer starts here!',
            },
            {
            backgroundColor: color.grey,
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <View>
                <LottieView  style={styles.lottie}source={require('../assets/animations/animation2.json')} autoPlay loop />;
                </View>
            ),
            title: 'Connect with Developers Worldwide',
            subtitle: 'Collaborate with developers from all skill levels and backgrounds.',
            },
            {
            backgroundColor: '#0097b2',
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <View>
                <LottieView style={styles.lottie} source={require('../assets/animations/animation3.json')} autoPlay loop />;
                </View>
            ),
            title: 'Bring Your Ideas to Life',
            subtitle: 'From concepts to code, DevGuides is here to help you make it happen.',
            },
            {
            backgroundColor: '#fff',
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <View>
                <LottieView style={styles.lottie} source={require('../assets/animations/animation4.json')} autoPlay loop />;
                </View>
            ),
            title: 'Launch Your Next Big Idea',
            subtitle: 'Turn your side projects into real-world applications with DevGuides.',
            },
            {
            backgroundColor: color.backgroundcolor,
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <View>
                    <LottieView style={styles.lottie} source={require('../assets/animations/animation5.json')} autoPlay loop />;
                </View>
                
            ),
            title: 'Join the DevGuides Community',
            subtitle: 'Meet like-minded developers, build connections, and grow your network.',
            },
            
        ]}
        />
    </View>
  )
}

const styles = StyleSheet.create({
    screen:{
        flex:1
    },
    lottie:{
        width:width*0.9,
        height:width,
    }
})
export default OnboardingScreen