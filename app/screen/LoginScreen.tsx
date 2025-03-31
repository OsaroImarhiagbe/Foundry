import {
    View,
    StyleSheet,
    Platform,
    SafeAreaView,
    useWindowDimensions,
    GestureResponderEvent,
    } from 'react-native'
import AppTextInput from '../components/AppTextInput'
import color from '../../config/color'
import { useState,useEffect, useCallback} from 'react'
import * as Yup from 'yup';
import { Formik} from 'formik';
import { useAuth } from '../authContext'
import CustomKeyboardView from '../components/CustomKeyboardView'
import { 
    Button,
    Text, 
    TextInput,
    useTheme ,
    HelperText} from 'react-native-paper'
import {GoogleSigninButton,
statusCodes,
} from '@react-native-google-signin/google-signin';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {log,recordError} from '@react-native-firebase/crashlytics'
import { crashlytics } from '../FirebaseConfig';




const LoginScreen = () => {
    const [isLoading, setLoading] = useState<boolean>(false)
    const { login,googleSignIn } = useAuth()
    const [focus,setFocus] = useState<string>('')
    const {width,height} = useWindowDimensions();
    const navigation = useNavigation()
    const theme = useTheme()
    const {top} = useSafeAreaInsets()
    


    const LoginPress = useCallback(async (values:any,{resetForm}:any) => {
        log(crashlytics,'Login Screen: Login Press')
        setLoading(true);
        try{
            const response = await login(values.email, values.password)
            if(response){
                resetForm({values: ''})
                navigation.navigate('Drawer' as never); 
            }
        }catch(error:unknown | any){
            recordError(crashlytics,error)
            console.error(`Unauthorized username and password ${error.message}`)
        }finally{
            setLoading(false)
        }
    },[])
    const RegisterPress = useCallback(() => {
        navigation.navigate('Register' as never)
    },[])
    const validationSchema = Yup.object().shape({
        email: Yup.string()
        .email('Invalid email')
        .required('Please enter your email'),
        password: Yup.string()
        .min(8, 'Password must contain at least 8 characters')
        .max(50)
        .required('Password is required')
        .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
      });

      const initialValues = {
            email:'',
            password:''
        }


    // const handleGoogelIn = async () =>{
    //     await googleSignIn()
    // }
  return (
          <CustomKeyboardView inChat={true}>
            <SafeAreaView style={{flex:1,backgroundColor:theme.colors.background,marginVertical:50}}>
            <View style={{
                alignItems:
                'center',
                justifyContent:
                'center',
                paddingTop:Platform.OS === 'ios' ? top: 0,}}>
            <Image
              source={require('../assets/images/icon.png')}
              style={{
                width:100,
                height:100}}
              /> 
            </View> 
            <View style={{padding:5}}>
            <Text variant='titleLarge' style={{textAlign:'center',color:theme.colors.tertiary,fontSize:30}}>Foundry</Text>
           </View>
           <View style={{marginVertical:40}}>
           <Formik
           initialValues={initialValues}
           onSubmit={LoginPress}
           validationSchema={validationSchema}
           >
           {({handleSubmit,handleChange,values, errors,touched, setFieldTouched,isValid}) => (
                   <>
                   <View style={{padding:20,alignItems:'center',justifyContent:'center'}}>
                   <AppTextInput
                   icon='account' 
                   placeholder='E-mail' 
                   backgroundColor="transparnet"
                   borderColor={focus === 'email' ? '#00BF63' : '#8a8a8a'}
                   onChangeText={handleChange('email')}
                   onFocus={() => setFocus('email')}
                   values={values.email}
                   onBlur={() => setFieldTouched('email')}
                   iconcolor={color.button}/>
                   {
                       touched.email && errors.email && (
                           <HelperText type='error' visible style={{textAlign:'center',color:theme.colors.primary}}>{errors.email}</HelperText>
                       )
                   }
                   <AppTextInput
                   icon='lock'
                   secureTextEntry
                   placeholder='Password'
                   backgroundColor="transparent"
                   borderColor={focus === 'password' ? '#00BF63' : '#8a8a8a'}
                   onChangeText={handleChange('password')}
                   values={values.password}
                   onFocus={() => setFocus('password')}
                   onBlur={() => setFieldTouched('password')}
                   iconcolor={color.button}
                   right={<TextInput.Icon icon="eye"/>}
                   />
                   { touched.password && errors.password && (
                       <HelperText type='error' visible style={{textAlign:'center',color:theme.colors.primary}}>{errors.password}</HelperText>
                   )}
                   </View>
                   <View style={{padding:10,marginTop:5}}>
                    <Button
                    disabled={!isValid}
                    mode='outlined'
                    textColor={theme.colors.tertiary}
                    onPress={(e: GestureResponderEvent) => {
                        handleSubmit();
                      }}
                    >Login</Button>
                       <View style={{marginTop:15,flexDirection:'row',alignSelf:'center'}}>
                           <Text
                           variant='bodySmall'
                           style={{color:theme.colors.tertiary,textAlign:'center'}}>
                               Don't have an account?
                           </Text>
                           <TouchableWithoutFeedback onPress={RegisterPress}>
                           <Text
                           variant='bodySmall'
                           style={{color:theme.colors.tertiary,textAlign:'center',marginLeft:5}}>Sign Up</Text>
                           </TouchableWithoutFeedback>
                       </View>
                       </View> 
                   </>
           )}
           </Formik>
           </View>
           {/* <View style={{justifyContent:'center',alignItems:'center',paddingTop:50}}>
           <Text
           variant='bodySmall'
           style={{textAlign:'center',color:theme.colors.tertiary}}>Or Login with</Text>
           </View>
           <View style={{marginVertical:10,flexDirection:'row',justifyContent:'space-between',padding:30}}>
            <GoogleSigninButton
            style={{borderRadius:20}} 
            color={GoogleSigninButton.Color.Light}
            size={GoogleSigninButton.Size.Icon}

            />
            <GoogleSigninButton
            onPress={handleGoogelIn}
            color={GoogleSigninButton.Color.Light}
            size={GoogleSigninButton.Size.Icon}/>
           <GoogleSigninButton
            color={GoogleSigninButton.Color.Light}
            size={GoogleSigninButton.Size.Icon}/>
            </View> */}
            </SafeAreaView>
   
        </CustomKeyboardView>
  
 
  
  )
}


const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    logo:{
        width:30,
        height:30,
        alignSelf:'auto',
        marginBottom:20,
    },
    UserContainer:{
        marginTop:20,
        padding:10
    },
    registercontainer:{
        marginTop:15
    },
    footer:{
        flex:1,
        height:100
    },
    footerContainer:{
        justifyContent:'center',
        alignItems:'center',
    }
})

export default LoginScreen
