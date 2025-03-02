import {
    View,
    StyleSheet, 
    TouchableOpacity,
    ScrollView,
    Switch,
    Modal,
    Platform} from 'react-native'
import { useState,useEffect } from 'react';
import ChatRoomHeader from '../components/ChatRoomHeader';
import color from '../../config/color';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../authContext';
import {collection,doc,onSnapshot,updateDoc} from '@react-native-firebase/firestore'
import { Image } from 'expo-image';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { blurhash } from '../../utils/index';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import * as ImagePicker from 'expo-image-picker';
import storage from '@react-native-firebase/storage';
import { useSelector,useDispatch } from 'react-redux';
import { addImage } from '../features/user/userSlice';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import crashlytics from '@react-native-firebase/crashlytics'
import { db } from 'FIrebaseConfig';
import { useTheme, Text,Icon } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


{/** NEED TO SEE IS IT WORTH HAVE MORE SCREENS FOR EDITING OR USING A MODAL FOR EDITING?????? */}
type NavigationProp = {
    Profile:{user:any},
    Message:undefined
}

type Navigation = NativeStackNavigationProp<NavigationProp>
interface Edit {
    id?:string,
    name?:string,
    jobTitle?:string,
    email?:string,
    phone?:string
    profileUrl?:string
}
  
const EditScreen = () => {


    const {i18n,t} = useTranslation()
    const [language, setLanguage] = useState<string>('en');
    const navigation = useNavigation<Navigation>();
    const [edit,setEdit] = useState<Edit | null>(null)
    const [filename,setFile] = useState(null)
    const [image,setImage] = useState(null)
    const dispatch = useDispatch()
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const profileImage = useSelector((state:any) => state.user.profileimg)
    const {user} = useAuth()
    const theme = useTheme()
    const {top} = useSafeAreaInsets()

    const [form, setForm] = useState({
        darkMode:true,
        wifi:false,
        showCollaborators:true,
        accessibilityMode: false
    })
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
    const sections = [
        {header:'About Me',
            id:1,
          items:[{
              id:1,
              icon:'person',
              name:edit?.name,
              type:'Username',
              screen:'EditUser',
              color:'#fff',
              nav:'keyboard-arrow-right'
          },
          {
              id:2,
              icon:'email',
              name:edit?.email,
              type:'Email',
              screen:'EditEmail',
              color:'#fff',
              nav:'keyboard-arrow-right'
          },
          {
              id:3,
              icon:'phone',
              name:edit?.phone,
              type:'Phone',
              screen:'EditPhone',
              color:'#fff',
              nav:'keyboard-arrow-right'
          },
          {
              id:4,
              icon:'work',
              name:edit?.jobTitle,
              type:'Job title',
              screen:'EditJob',
              color:'#fff',
              nav:'keyboard-arrow-right'
          }
          
      ]
        }
    
      ]

    useEffect(() => {
        crashlytics().log('Edit Screen: Grabbing user')
        const docRef = doc(db,'users',user?.userId)
        const unsub = onSnapshot(docRef,(documentSnapshot) => {
        if(documentSnapshot.exists){
            const data:Edit ={
                ...documentSnapshot.data(),
                id:documentSnapshot.id};
            setEdit(data)
        }else{
            console.error('Error doc doesnt exists:')
            setEdit(null)
            }
        }, (error) => {
            crashlytics().recordError(error)
            console.error('Error fetching document:',error.message)
        });
        return () => unsub()
    },[user])

    const pickImage = async () => {
        crashlytics().log('Edit Screen: Pick Image')
        try{
            let results = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing:true,
                quality:1
              })
            if(!results.canceled){
                const uri = results?.assets[0]?.uri
                const filename = uri.split('/').pop()
                const ref = storage().ref(`/users/profile/${user.userId}/${filename}`)
                await ref.putFile(uri)
                const url = await ref.getDownloadURL()
                const docRef = doc(db,'users',user.userId)
                await updateDoc(docRef,{
                    profileUrl:url
                })
                dispatch(addImage({profileimg:url}))
            }
        }catch(error:any){
            crashlytics().recordError(error)
            console.error('Error picking image and uploading to Cloud Storage:',error.message)
        }
        }
      
    const handleLanguageChange = async (lang:string) => {
            i18n.changeLanguage(lang);
            setLanguage(lang);
            await AsyncStorage.setItem('language',lang)
            setModalVisible(false);
          };
  

  return (
    <View style={[styles.screen,{backgroundColor:theme.colors.background,paddingTop:Platform.OS === 'ios' ? top : 0}]}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={{padding:10}}>
        <Icon
        source='arrow-left-circle'
        size={hp(3)}
        />
      </TouchableOpacity>
        <ScrollView
        contentContainerStyle={{paddingBottom:10}}
        zoomScale={1.0}
        showsVerticalScrollIndicator
        alwaysBounceVertical
        >
        <View style={{padding:40}}>
        <View style={{flexDirection:'row'}}>
        <Image
            style={{height:hp(8), aspectRatio:1, borderRadius:100}}
            source={edit?.profileUrl || user.profileUrl}
            placeholder={{blurhash}}
            transition={500}
            cachePolicy='none'/>
        <View style={{marginLeft:40,marginTop:10}}>
        <Text style={{color:theme.colors.tertiary,fontSize:20}}>{edit?.name}</Text>
        <TouchableOpacity style={{marginTop:5}} onPress={pickImage}>
        <Text style={{color:theme.colors.tertiary,fontSize:12}}>Edit picture</Text>
        </TouchableOpacity>
        </View>
        </View>
        <View style={{marginTop:40}}>
            {sections.map(({header,items,id})=>( 
                <View>
                     <Text
                     variant='bodyLarge'
                     key={id} style={{color:theme.colors.tertiary,fontSize:20}}>
                  {header}
                        </Text>
                {items.map(({id,icon,nav,name,type,screen})=>(
                     <TouchableOpacity key={id} onPress={()=>navigation.navigate(screen as never)}>
                      <View style={{ marginTop: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ backgroundColor: '#3b3b3b', borderRadius: 5, width: 30, padding: 5 }}>
                          <View style={{ alignItems: 'center' }}>
                          <MaterialIcons name={icon} size={15} color="#ffffff" />
                              </View>
                              </View>
                      <View style={{ paddingLeft: 10, flex: 1}}>
                      <Text variant='bodySmall' style={{ fontSize: 16,color:theme.colors.tertiary}}>@{name}</Text>
                      <View style={{ marginTop: 3 }}>
                      <Text variant='bodySmall' style={{ fontSize: 12,color:theme.colors.tertiary}}>{type}</Text>
                      </View>
                      </View>
                      <View style={{ backgroundColor: '#3b3b3b', borderRadius: 5, width: 30, padding: 5 }}>
                      <View style={{ alignItems: 'center' }}>
                      <MaterialIcons name={nav} size={15} color="#ffffff"/>
                      </View>
                      </View>
                      </View>
                      </TouchableOpacity>
                ))}
                </View>
            ))}
            <View style={{marginTop:20}}>
            {Sections.map(({header, items,id}) => (
                <View key={id}>
                    <Text
                    variant='bodyLarge'
                    style={{color:theme.colors.tertiary,fontSize:20,marginBottom:10}}>{header}</Text>

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
                            <Text variant='bodySmall' style={{ fontSize: 16,color:theme.colors.tertiary,paddingLeft:10 }}>{label}</Text>
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
        </View>
        </View>
        </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>
            <Picker
                selectedValue={language}
                style={{width:250,borderRadius: 100,}}
                onValueChange={handleLanguageChange}>
                <Picker.Item color="#000" label="English" value="en" />
                <Picker.Item color="#000" label="Spanish" value="es" />
                <Picker.Item color="#000" label="French" value="fr" />
                <Picker.Item color="#000" label="German" value="de" />
                <Picker.Item color="#000" label="Italian" value="it" />
                </Picker>
          </View>
        </View>
      </Modal>
    </View>
  )
}


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

export default EditScreen
