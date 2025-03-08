import { useNavigation } from '@react-navigation/native';
import {useState} from 'react'
import { 
  View,
  TouchableOpacity, 
  StyleSheet, 
  Switch, 
  SafeAreaView } from 'react-native'
import { Avatar, Icon, Text,useTheme } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image
 } from 'expo-image';
import { blurhash } from 'utils';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { useAuth } from 'app/authContext';


const Sections = [
  {
      header: 'Settings',
      icon: 'settings',
      id:1,
      items:[
          {
              id:1,
              icon:'globe', 
              color:'orange',
              label:'Language', 
              type:'link',
              screen:'LanguageScreen'
          },
          {
              id:2,
              icon:'navigation',
              color:'green',
              label:'Location', 
              type:'link',},
          {
              id:3,
              tag:'showusers',
              icon:'users',
              color:'green',
              label:'Show',
              type:'toggle'
          },
          {
              id:4,
              tag:'accessmode',
              icon:'airplay',
              color:'#fd2d54',
              label:'Access',
              type:'toggle'
          }, 
      ],
  },
  {
      header:'Help',
      icon:'help-circle',
      id:2,
      items:[
          {id:5,icon:'flag', color:'grey',label:'Report Bug', type:'link',screen:'ReportBugScreen'},
          {id:6,icon:'mail', color:'blue',label:'Contact us', type:'link',screen:'ContactUsScreen'},]
  },
];

const SettingsScreen = () => {
  const theme = useTheme()
  const [modalVisible,setModalVisible] = useState(false)
  const navigation = useNavigation();
  const { top } = useSafeAreaInsets()
  const {user} = useAuth()
  const [form, setForm] = useState({
    darkMode:true,
    wifi:false,
    showCollaborators:true,
    accessibilityMode: false
})
  return (
    <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background}}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding:10}}>
          <Icon
          size={25}
          source='arrow-left-circle'/>
        </TouchableOpacity>
      <View style={{marginTop:top,padding:10}}>
            {Sections.map(({header, items,id}) => (
                <View key={id} >
                  <View style={{flexDirection:'row'}}>
                    {
                      header === 'Settings' && <Image style={{height:hp(3.3), aspectRatio:1, borderRadius:100}}
                      source={
                        user.profileUrl ? user.profileUrl : require('../assets/user.png')
                      }
                      placeholder={{blurhash}}
                      cachePolicy='none'/>
                    }
                    <Text
                    variant='titleLarge'
                    style={{color:theme.colors.tertiary,marginBottom:10,marginLeft:10}}>{header}</Text>
                    </View>
                    {items.map(({id, icon,tag, label, type,screen}) => (
                        <TouchableOpacity
                            key={id}
                            onPress={label === 'Language' ? () => setModalVisible(true):() => navigation.navigate(screen as never)}>
                        <View style={styles.row}>
                            <View style={{ backgroundColor: '#3b3b3b', borderRadius: 5, width: 30, padding: 5 }}>
                                <View style={{ alignItems: 'center' }} >
                                <Feather name={icon} size={15} color='#fff'/>
                                </View>
                            </View>
                            <Text variant='bodyLarge' style={{color:theme.colors.tertiary,paddingLeft:10 }}>{label}</Text>
                            <View style={{flex:1}}/>
                            {type === 'toggle' && 
                            <Switch value={true}
                            onValueChange={value => setForm({...form,[id]: value})}/>}
                            {type === 'link' && 
                            <View style={{ backgroundColor: '#3b3b3b', borderRadius: 5, width: 30, padding: 5 }}>
                                <View style={{ alignItems: 'center' }}>
                                <Feather name='chevron-right' size={15} color='#fff'/>
                                </View>
                                 
                            </View>
                          }
                        </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
            </View> 

    </SafeAreaView>
  )
}

export default SettingsScreen

const styles = StyleSheet.create({
  screen:{
    flex:1,
},
row:{
    flexDirection:'row',
    height:50,
    justifyContent:'flex-start',
    alignItems:'center',
    marginBottom:12,
    borderRadius:8,

},
title: {
    fontSize: 20,
    marginBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
  },

})
