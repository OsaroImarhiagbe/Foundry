import React from 'react'
import {View, Text, StyleSheet, TouchableOpacity, TouchableHighlight} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';

const Button = ({ onPress,title, backgroundColor, color, disabled, borderColor,fontSize}) => {

    

  
  return (
   
    <View >
             <LinearGradient
          colors={['#0097b2', '#7ed957']} // Gradient colors
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        >
        <TouchableHighlight
        disabled={disabled}
        style={styles.buttonContainer}
        underlayColor='transparent'
        onPress={onPress}
        >
          <Text style={[styles.text,{color:color,fontSize:fontSize,fontFamily:'Helvetica-light'}]}>{title}</Text>
       
        </TouchableHighlight>
        </LinearGradient>
    </View>
  )
  
}

const styles = StyleSheet.create({

    buttonContainer:{
        padding:5,
    },
    text:{
        textAlign:'center',
        
    },
    gradientContainer: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        padding:5,
      },

});
export default Button
