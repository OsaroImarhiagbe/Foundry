import {View,Text} from 'react-native'

const SmallButton = ({name,isTrue}) => {
  return (

   
         <View style={{backgroundColor:isTrue ? '##3b3b3b' : '#00BF63', padding:10, borderRadius:100,width:100, borderWidth: isTrue ? 1: 0,borderColor:isTrue ? '#00BF63':''}}>
            <Text style={{textAlign:'center',fontFamily:'Helvetica-light',fontSize:15,color: isTrue ? "#fff":"#000" }}>{name}</Text></View>
   
    
  )
}

export default SmallButton