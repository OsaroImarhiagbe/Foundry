import React, {useCallback, useState} from 'react'
import {
    View,
    StyleSheet,
    SafeAreaView,
    useWindowDimensions,
    GestureResponderEvent} from 'react-native';
import { Formik} from 'formik';
import AppTextInput from '../components/AppTextInput';
import color from '../../config/color';
import * as Yup from 'yup';
import { useAuth} from '../authContext';
import CustomKeyboardView from '../components/CustomKeyboardView';
import { useNavigation } from '@react-navigation/native';
import { TextInput,Text,HelperText,ActivityIndicator} from 'react-native-paper';
import LottieView from 'lottie-react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Button,useTheme } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {log,recordError} from '@react-native-firebase/crashlytics'
import { crashlytics } from '../FirebaseConfig';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';



type NavigationProp = {
    Onboarding:undefined
  }
  
type Navigation = NativeStackNavigationProp<NavigationProp>;

const RegisterScreen = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const navigation = useNavigation<Navigation>();
    const {width} = useWindowDimensions()
    const { register } = useAuth();
    const theme = useTheme()
    const {top} = useSafeAreaInsets();

    const handleRegister = useCallback(async (values:any, {resetForm}:any )=> {
        log(crashlytics,'Register Screen: Handle Register')
        setLoading(true);
        try{
            const response = await register(values.username, values.email, values.password)
            if(response){
                setLoading(false)
            }
            Toast.show({
                type: 'success',
                text1: 'Welcome to Foundry!',
                position:'top',
                autoHide:true,
                visibilityTime:5000,
                topOffset:top,
              });
            resetForm({values:initialValues})
        }catch(error: unknown | any){
            recordError(crashlytics,error)
            console.error('error with register',error)
        }finally{
            setLoading(false)
        }
    },[])   

    const validationSchema = Yup.object().shape({
        username: Yup.string()
        .min(8)
        .max(10)
        .required('Username is required'),
        email: Yup.string()
        .email('Invalid email')
        .required('Please enter your email'),
        password: Yup.string()
        .min(8, 'Password must contain at least 8 characters')
        .max(50)
        .required('Please enter your password')
        .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
        confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
        .required('Please enter password again'),
      });
    const initialValues = {
        username:'',
        email:'', 
        password:'', 
        confirmPassword:''}

    return (
            <SafeAreaView style={styles.screen}>
                <View
                style={[styles.backImage,{backgroundColor:theme.colors.backdrop}]}
                >
                  <Text>
                  <LottieView
               style={{
                width:width*0.9,
                height:hp('40%'),
                alignItems:'center',
                justifyContent:'center'}}
                renderMode={'SOFTWARE'}
                source={require('../assets/animations/animation1.json')} autoPlay loop />;
                  </Text>
                </View>
                <View style={[styles.whitesheet,{backgroundColor:theme.colors.background}]}>
                <View style={styles.headingcontainer}>
                    <Text
                    variant='titleLarge'
                    style={{textAlign:'center',color:theme.colors.tertiary,fontFamily:color.textFont}}>Register</Text>
                    <Text
                    variant='titleMedium'
                    style={{textAlign:'center',color:theme.colors.tertiary,fontFamily:color.textFont}}
                     >Create a new account</Text>
                </View>
                <CustomKeyboardView inChat={true}>
                 <View>  
                <Formik
                   initialValues={initialValues}
                    onSubmit={handleRegister}
                    validationSchema={validationSchema}
                >
                    {({handleChange, handleSubmit, values, setFieldTouched,touched, errors, isValid}) => (
                        <View>
                            <View>
                            <AppTextInput
                                    icon='account'
                                    placeholder='Username'
                                     backgroundColor='transparent'
                                    borderColor='#8a8a8a'
                                    values={values.username}
                                     color={theme.colors.tertiary}
                                    onChangeText={handleChange('username')}
                                    onBlur={() => setFieldTouched('username')}
                                    iconcolor={color.button}
                                />
                                {touched.username && errors.username &&( <HelperText
                                    type='error'
                                    visible
                                    style={styles.errormessage}>{errors.username}</HelperText>)}
                                <AppTextInput
                                    icon='email'
                                     color={theme.colors.tertiary}
                                    placeholder='Email'
                                    backgroundColor='transparent'
                                    borderColor='#8a8a8a'
                                    values={values.email}
                                    onChangeText={handleChange('email')}
                                    onBlur={() => setFieldTouched('email')}
                                    iconcolor={color.button}
                                />
                                {touched.email && errors.email && (<HelperText type='error' visible style={styles.errormessage}>{errors.email}</HelperText>)}
                                <AppTextInput
                                    icon='lock'
                                    secureTextEntry
                                    placeholder='Password'
                                    color={theme.colors.tertiary}
                                    backgroundColor='transparent'
                                    borderColor='#8a8a8a'
                                    values={values.password}
                                    onChangeText={handleChange('password')}
                                    onBlur={() => setFieldTouched('password')}
                                    iconcolor={color.button}
                                    right={<TextInput.Icon  icon="eye" />}
                                />
                                {touched.password && errors.password  && (<HelperText  type='error' visible style={styles.errormessage}>{errors.password}</HelperText>)}
                                <AppTextInput
                                    icon='lock'
                                    secureTextEntry
                                    placeholder='Confirm Password'
                                    backgroundColor='transparent'
                                    borderColor='#8a8a8a'
                                    color={theme.colors.tertiary}
                                    values={values.confirmPassword}
                                    onChangeText={handleChange('confirmPassword')}
                                    onBlur={() => setFieldTouched('confirmPassword')}
                                    iconcolor={color.button}
                                    right={<TextInput.Icon  icon="eye" />}
                                />
                                {touched.confirmPassword && errors.confirmPassword &&( <HelperText   type='error' visible style={styles.errormessage}>{errors.confirmPassword}</HelperText>)}
                            </View>
                            <View style={{marginTop:5}}>
                                <Button
                                disabled={!isValid}
                                loading={loading}
                                textColor={theme.colors.tertiary}
                                onPress={(e: GestureResponderEvent) => {
                                    handleSubmit();
                                  }}
                                mode="outlined">Sign Up</Button>
                            </View>
                            <View style={styles.textContainer}>
                                    <Text
                                    variant='bodySmall'
                                    style={{color:theme.colors.tertiary,textAlign:'center'}}>Have an account?</Text>
                                <TouchableWithoutFeedback onPress={() => navigation.navigate('Login' as never )}>
                                    <Text
                                    variant='bodySmall'
                                    style={{color:theme.colors.tertiary,marginLeft:10,textAlign:'center'}}
                                    >Login</Text>
                                </TouchableWithoutFeedback>
                            </View>
                        </View>
                    )}
                </Formik>
                </View>
                </CustomKeyboardView>
                </View>
            </SafeAreaView>
            
    )
}



const styles = StyleSheet.create({
    backImage:{
        width:wp('100%'),
        position:'absolute',
        resizeMode: 'cover'
      }, 
    whitesheet:{
        width:wp('100%'),
        height:hp('65%'),
        position:'absolute',
        bottom:0,
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60,
        padding:20
  } ,
    errormessage:{
        color: color.danger,
        textAlign:'center',
        fontFamily:color.textFont
    },
    screen:{
        flex:1

    },
    headingcontainer:{
       padding:30
    },
    textContainer:{
        marginTop:10,
        flexDirection:'row',
        alignSelf:'center'
    },
})
export default RegisterScreen
