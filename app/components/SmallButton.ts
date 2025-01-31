import {View,Text} from 'react-native'
import { Button } from 'react-native-paper'


const SmallButton = ({name,isTrue}) => {
  return (

   
         <Button
         mode='contained'
         style={{backgroundColor:isTrue ? '##3b3b3b' : '#00BF63', borderRadius:100, borderWidth: isTrue ? 1: 0,borderColor:isTrue ? '#00BF63':''}}
        >
            {name}</Button>
   
    
  )
}

export default SmallButton