import React,{ReactNode} from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'

const ios = Platform.OS === 'ios'

interface KeyboardProp {
    children: ReactNode;
}

interface CustomKeyboardProp extends KeyboardProp{
    inChat?:boolean

}
const CustomKeyboardView = ({children,inChat = false}: CustomKeyboardProp) => {

    

    let kavConfig = {}
    let ScrollConfig = {}

    if(inChat){
        kavConfig = {keyboardVerticalOffset:0}
        ScrollConfig = {contentContainerStyle:{flex:1}}
    }
  return (
   <KeyboardAvoidingView
   behavior='padding'
   keyboardVerticalOffset={60}
   style={{flex:1,backgroundColor: inChat ? '#121212':'#1f1f1f'}}
   {...kavConfig}
   >
    <ScrollView
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
