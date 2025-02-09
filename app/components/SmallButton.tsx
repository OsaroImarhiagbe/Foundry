import {View,Text} from 'react-native'
import { Button,useTheme } from 'react-native-paper'

interface Button{
  name?:string,
  isTrue?:boolean
}

const SmallButton: React.FC<Button> = ({name,isTrue}) => {
  const theme = useTheme()
  return (

   
         <Button
         mode='outlined'
         style={{backgroundColor:'transparent', borderRadius:100, borderWidth: isTrue ? 1: 1,borderColor:isTrue ? '#00BF63':theme.colors.tertiary}}
        >
            {name}</Button>
   
    
  )
}

export default SmallButton