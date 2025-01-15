import React from 'react'
import {View, StyleSheet, TextInput} from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

const AppTextInput = ({placeholder,backgroundColor,borderColor,secureTextEntry,icon, onChangeText, onBlur,textAlign,maxLength,iconcolor,values,onFocus}) => {
  return (
    
  
    <View style={{flexDirection:'row', justifyContent:'space-between',borderColor:borderColor,borderWidth:1,alignItems:'center', borderRadius: 10,marginVertical:10}}>
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
        {icon && <MaterialCommunityIcons name={icon} size={25} style={styles.icon} color={iconcolor}/>}
       </View>
      </View>
      
   
  )
}


const styles = StyleSheet.create({
  Container: {
    padding: 10,
    margin:12,
    height:40,
    alignItems:'center',
    color:'#ffffff',
    borderColor:'#fff',
    width:'80%' 
  },
  icon:{
    margin:10
},

});


export default AppTextInput
