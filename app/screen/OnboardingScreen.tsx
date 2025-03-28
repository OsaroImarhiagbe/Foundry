import React, { useCallback } from 'react'
import {View,Text,StyleSheet,useWindowDimensions} from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'
import LottieView from 'lottie-react-native';
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';




type NavigationProp ={
    Drawer:{
        screen:string
    }
}
type Navigation = NativeStackNavigationProp<NavigationProp>
const OnboardingScreen = () => {
    const navigation = useNavigation<Navigation>()
    const theme = useTheme()
    const {width} = useWindowDimensions()

    const handleDone = useCallback(async () => {
        await AsyncStorage.setItem('onboarded','1')
    },[])
  return (
    <View style={styles.screen}>
    <Onboarding
        onDone={handleDone}
        onSkip={handleDone}
        containerStyles={{paddingHorizontal:15}}
        pages={[
            {
            backgroundColor:theme.colors.background,
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <Text>
               <LottieView style={{
                height:width,
                width:width*0.9
               }} renderMode={'SOFTWARE'} source={require('../assets/animations/animation1.json')} autoPlay loop />;
               </Text>
            ),
            title: 'Welcome to Foundry',
            subtitle: 'Your journey to becoming a better developer starts here!'
            },
            {
                backgroundColor: theme.colors.background,
                titleStyles:{
                    fontFamily:color.textFont
                },
                image:(
                    <Text>
                    <LottieView style={{
                height:width,
                width:width*0.9
               }}renderMode={'SOFTWARE'} source={require('../assets/animations/animation4.json')} autoPlay loop />;
                    </Text>
                ),
                title: 'Launch Your Next Big Idea',
                subtitle: 'Turn your side projects into real-world applications with Foundry'
                },
            {
            backgroundColor:theme.colors.background,
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <Text>
                <LottieView style={{
                height:width,
                width:width*0.9
               }} renderMode={'SOFTWARE'} source={require('../assets/animations/animation3.json')} autoPlay loop />;
                </Text>
            ),
            title: 'Bring Your Ideas to Life',
            subtitle: 'From concepts to code, Foundry is here to help you make it happen'
            },
            {
                backgroundColor: theme.colors.background,
                titleStyles:{
                    fontFamily:color.textFont
                },
                image:(
                    <Text>
                    <LottieView style={{
                height:width,
                width:width*0.9
               }} renderMode={'SOFTWARE'} source={require('../assets/animations/animation2.json')} autoPlay loop />;
                    </Text>
                ),
                title: 'Connect with Developers Worldwide',
                subtitle: 'Collaborate with developers from all skill levels and backgrounds'
                },
            {
            backgroundColor:theme.colors.background,
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
                <Text>
                    <LottieView style={{
                height:width,
                width:width*0.9
               }} source={require('../assets/animations/animation5.json')} autoPlay loop />;
                </Text>
                
            ),
            title: 'Join the Foundry Community',
            subtitle: 'Meet like-minded developers, build connections, and grow your network'
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
})
export default OnboardingScreen