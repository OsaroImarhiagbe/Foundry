import { useNavigation } from '@react-navigation/native';
import {useState} from 'react'
import { 
  View,
  TouchableOpacity, 
  StyleSheet, 
  Switch,
  ScrollView} from 'react-native'
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
              icon:'earth', 
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
              type:'toggle',},
          {
            id:3,
            tag:'Use sevice settings',
            icon:'theme-light-dark',
            color:'green',
            label:'Use device settings',
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
          {id:6,icon:'mail', color:'blue',label:'Contact us', type:'link',screen:'ContactUsScreen'},
          {id:7,icon:'newspaper', color:'blue',label:'Privacy and Policy', type:'link',screen:'ContactUsScreen'},
          {id:8,icon:'account', color:'blue',label:'User Agreement', type:'link',screen:'ContactUsScreen'},
          {id:9,icon:'license', color:'blue',label:'End User License Agreement', type:'link',screen:'ContactUsScreen'},
          {id:10,icon:'logout', color:'blue',label:'Sign Out', type:'link',screen:'ContactUsScreen'},
          {id:11, color:'blue',label:'Version',screen:'ContactUsScreen'},]
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
    <View style={{flex:1,backgroundColor:theme.colors.background,paddingTop:top}}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{padding:10}}>
          <Icon
          size={25}
          source='arrow-left-circle'/>
        </TouchableOpacity>
       <ScrollView
       contentContainerStyle={{bottom:20,padding:20}}
       style={{flex:1}}>
       <View style={{marginTop:top,padding:10}}>
            {Sections.map(({header, items,id}) => (
                <View key={id} >
                  <View style={{flexDirection:'row'}}>
                    {
                      header === 'Settings' && <View style={{borderColor:theme.colors.backdrop, borderRadius:100,borderWidth:2}}><Image style={{height:hp(8), aspectRatio:1, borderRadius:100,}}
                      source={
                        user.profileUrl ? user.profileUrl : require('../assets/user.png')
                      }
                      placeholder={{blurhash}}
                      cachePolicy='none'/></View>
                    }
                    <Text
                    variant='titleLarge'
                    style={{
                      color:theme.colors.tertiary,
                      marginBottom:10,
                      marginLeft:10}}>{header}</Text>
                    </View>
                    {items.map(({id, icon, label, type,screen}) => (
                        <TouchableOpacity
                            key={id}
                            onPress={label === 'Language' ? () => setModalVisible(true):() => navigation.navigate(screen as never)}>
                        <View style={styles.row}>
                           { label !== 'Version' ? <View style={{ backgroundColor: '#3b3b3b', borderRadius: 5, width: 30, padding: 5 }}>
                                <View style={{ alignItems: 'center' }} >
                                <Icon source={icon} size={16} color='#fff'/>
                                </View>
                            </View> : <></>}
                            <Text variant='bodyLarge' style={{color:theme.colors.tertiary,paddingLeft:10,fontSize:20}}>{label}</Text>
                            <View style={{flex:1}}/>
                            {type === 'toggle' && 
                            <Switch value={true}
                            onValueChange={value => setForm({...form,[id]: value})}/>}
                            {label !=='Version' && type === 'link' ? 
                            <View style={{ backgroundColor: '#3b3b3b', borderRadius: 5, width: 30, padding: 5 }}>
                                <View style={{ alignItems: 'center' }}>
                                <Feather name='chevron-right' size={15} color='#fff'/>
                                </View>
                            </View> : <></>
                          }
                        </View>
                        </TouchableOpacity>
                    ))}
                </View>
            ))}
            </View> 
        </ScrollView> 
    </View>
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
    marginVertical:8

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
