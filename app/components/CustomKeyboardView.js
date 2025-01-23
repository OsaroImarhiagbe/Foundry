import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'

const ios = Platform.OS === 'ios'

const CustomKeyboardView = ({children,inChat}) => {

    

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
