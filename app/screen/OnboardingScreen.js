import React from 'react'
import {View,Text,StyleSheet,Dimensions} from 'react-native'
import Onboarding from 'react-native-onboarding-swiper'
import LottieView from 'lottie-react-native';
import color from '../../config/color';

const {width,height} = Dimensions.get('window')
const OnboardingScreen = () => {
  return (
    <View style={styles.screen}>
    <Onboarding
        containerStyles={{paddingHorizontal:15}}
        pages={[
            {
            backgroundColor: '#00bf63',
            titleStyles:{
                fontFamily:color.textFont
            },
            image:(
               <>
               <LottieView style={styles.lottie} source={require('../assets/animations/animation1.json')} autoPlay loop />;
               </>
            ),
            title: 'Welcome to DevGuides',
            subtitle: 'Your journey to becoming a better developer starts here!',
            },
            {
            backgroundColor: color.grey,
            image:(
                <View>
                    <Text>Hello World</Text>
                </View>
            ),
            title: 'Connect with Developers Worldwide',
            subtitle: 'Collaborate with developers from all skill levels and backgrounds.',
            },
            {
            backgroundColor: '#fff',
            image:(
                <View>
                    <Text>Hello World</Text>
                </View>
            ),
            title: 'Bring Your Ideas to Life',
            subtitle: 'From concepts to code, DevGuides is here to help you make it happen.',
            },
            {
            backgroundColor: '#fff',
            image:(
                <View>
                    <Text>Hello World</Text>
                </View>
            ),
            title: 'Launch Your Next Big Idea',
            subtitle: 'Turn your side projects into real-world applications with DevGuides.',
            },
            {
            backgroundColor: '#fff',
            image:(
                <View>
                    <Text>Hello World</Text>
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
        height:width
    }
})
export default OnboardingScreen