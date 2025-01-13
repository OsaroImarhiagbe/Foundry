import React from 'react'
import {View, StyleSheet, TextInput} from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const AppTextInput = ({placeholder,backgroundColor,borderColor,secureTextEntry,icon, onChangeText, onBlur,textAlign,maxLength,iconcolor,values,onFocus}) => {
  return (
    
  
    <View style={[styles.Container,{backgroundColor:backgroundColor,borderColor:borderColor}]}>
      <TextInput
      value={values}
      secureTextEntry={secureTextEntry}
      textAlign={textAlign}
      maxLength={maxLength}
      style={styles.Container}
      placeholder={placeholder}
      placeholderTextColor='#8a8a8a'
      onChangeText={onChangeText}
      onBlur={onBlur}
      onFocus={onFocus}
      />  
      <View style={styles.inputContainer}>
        {icon && <MaterialCommunityIcons name={icon} size={20} style={styles.icon} color={iconcolor}/>}
       </View>
      </View>
      
   
  )
}


const styles = StyleSheet.create({
  Container: {
    borderRadius: 5,
    flexDirection:'row',
    padding: 10,
    height:60,
    justifyContent:'space-between',
    borderWidth:1,
    alignItems:'center',
    color:'#ffffff'
    
  },
  icon:{
    margin:10
},

});


export default AppTextInput
