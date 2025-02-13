import React from 'react'
import {View,Text,StyleSheet,Dimensions} from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'
import LottieView from 'lottie-react-native';
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
const {width,height} = Dimensions.get('window')


type NavigationProp ={
    Drawer:{
        screen:string
    }
}
type Navigation = NativeStackNavigationProp<NavigationProp>
const OnboardingScreen = () => {
    const navigation = useNavigation<Navigation>()

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
                <Text>
               <LottieView style={styles.lottie} renderMode={'SOFTWARE'} source={require('../assets/animations/animation1.json')} autoPlay loop />;
               </Text>
            ),
            title: <Text style={styles.title}>Welcome to DevGuides</Text>,
            subtitle: <Text style={styles.subtitle}>Your journey to becoming a better developer starts here!</Text>,
            },
            {
                backgroundColor: '#fff',
                titleStyles:{
                    fontFamily:color.textFont
                },
                image:(
                    <Text>
                    <LottieView style={styles.lottie} renderMode={'SOFTWARE'} source={require('../assets/animations/animation4.json')} autoPlay loop />;
                    </Text>
                ),
                title: <Text style={{fontSize: 24,color: '#000',fontFamily:'Helvetica-light' }}>Launch Your Next Big Idea</Text>,
                subtitle: <Text style={{color:'#000',fontSize: 16,textAlign:'center',paddingTop:5,fontFamily:'Helvetica-light'}}>Turn your side projects into real-world applications with DevGuides.</Text>,
                },
            {
            backgroundColor: '#0097b2',
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <Text>
                <LottieView style={styles.lottie} renderMode={'SOFTWARE'} source={require('../assets/animations/animation3.json')} autoPlay loop />;
                </Text>
            ),
            title: <Text style={styles.title}>Bring Your Ideas to Life</Text>,
            subtitle: <Text style={styles.subtitle}>From concepts to code, DevGuides is here to help you make it happen.</Text>
            },
            {
                backgroundColor: color.grey,
                titleStyles:{
                    fontFamily:color.textFont
                },
                image:(
                    <Text>
                    <LottieView style={styles.lottie} renderMode={'SOFTWARE'} source={require('../assets/animations/animation2.json')} autoPlay loop />;
                    </Text>
                ),
                title: <Text style={styles.title}>Connect with Developers Worldwide</Text>,
                subtitle: <Text style={styles.subtitle}>Collaborate with developers from all skill levels and backgrounds.</Text>
                },
            {
            backgroundColor:"#fff",
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <Text>
                    <LottieView style={styles.lottie} source={require('../assets/animations/animation5.json')} autoPlay loop />;
                </Text>
                
            ),
            title: <Text style={{fontSize: 24,color: '#000',fontFamily:'Helvetica-light' }}>Join the DevGuides Community</Text>,
            subtitle: <Text style={{color:'#000',fontSize: 16,textAlign:'center',paddingTop:5,fontFamily:'Helvetica-light'}}>Meet like-minded developers, build connections, and grow your network.</Text>,
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
    },
    title: {
        fontSize: 24,
        color: color.white,
        textAlign:'center',
        fontFamily:'Helvetica-light', 
    },
    subtitle: {
        fontSize: 16,
        color: color.white,
        textAlign:'center',
        paddingTop:5,
        fontFamily:'Helvetica-light',
    }
})
export default OnboardingScreen