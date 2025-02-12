import React from 'react'
import {View, StyleSheet} from 'react-native'
import { TextInput } from 'react-native-paper'
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';


interface TextInputProp {
  placeholder?: string;
  backgroundColor?: string;
  borderColor?: string;
  secureTextEntry?: boolean;
  icon?: string;
  color?:string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  textAlign?: 'left' | 'center' | 'right';
  maxLength?: number;
  iconcolor?: string;
  values?: string | undefined;
  onFocus?: () => void;
  right?: any;
}
const AppTextInput:React.FC<TextInputProp> = ({
  placeholder,
  backgroundColor,
  borderColor,
  secureTextEntry,
  icon,
  onChangeText,
  onBlur,
  textAlign,
  maxLength,
  iconcolor,
  values,
  color,
  onFocus,right}) => {
  return (
    
  
    <View style={{flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    borderRadius: 10,
    marginVertical:10}}>
    <TextInput
    value={values}
    secureTextEntry={secureTextEntry}
    textAlign={textAlign}
    maxLength={maxLength}
    style={[styles.Container,{backgroundColor:backgroundColor,color:color,}]}
    placeholder={placeholder}
    placeholderTextColor='#8a8a8a'
    onChangeText={onChangeText}
    onBlur={onBlur}
    onFocus={onFocus}
    right={right}
    />  
    </View>
      
   
  )
}


const styles = StyleSheet.create({
  Container: {
    width:wp('90%') ,
  },
});


export default AppTextInput
