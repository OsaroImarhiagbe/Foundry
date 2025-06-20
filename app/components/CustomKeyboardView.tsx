import React,{ReactNode} from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useTheme } from 'react-native-paper';

const ios = Platform.OS === 'ios'

interface KeyboardProp {
    children: ReactNode;
}

interface CustomKeyboardProp extends KeyboardProp{
    inChat?:boolean

}
const CustomKeyboardView = ({children,inChat = false}: CustomKeyboardProp) => {
    const theme = useTheme()

    

    let kavConfig = {}
    let ScrollConfig = {}

    if(inChat){
        kavConfig = {keyboardVerticalOffset:0}
        ScrollConfig = {contentContainerStyle:{flex:1}}
    }
  return (
   <KeyboardAvoidingView
   behavior='padding'
   keyboardVerticalOffset={0}
   style={{flex:1,backgroundColor:inChat ? theme.colors.background :'#1f1f1f'}}
   {...kavConfig}
   >
    <ScrollView
    keyboardShouldPersistTaps='handled'
    style={{flex:1}}
    bounces={false}
    showsVerticalScrollIndicator={false}
    {...ScrollConfig}
    >
        {children}
    </ScrollView>
   </KeyboardAvoidingView>
  )
}

export default CustomKeyboardView
