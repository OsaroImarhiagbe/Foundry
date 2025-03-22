import React from 'react'
import { ActivityIndicator } from 'react-native-paper'
import {View} from 'react-native'

const FallBackComponent = () => {
  return (
    <View>
        <ActivityIndicator color='#fff' size='large' style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#000'}}/>
    </View>
  )
}

export default FallBackComponent