import { SafeAreaView, View, StyleSheet,Text, Image, ActivityIndicator,Alert} from 'react-native'
import AppTextInput from '../components/AppTextInput'
import color from '../../config/color'
import Button from '../components/Button'
import { useState} from 'react'
import * as Yup from 'yup';
import { Formik} from 'formik';
import { useAuth } from '../authContext'
import CustomKeyboardView from '../components/CustomKeyboardView'
import { StatusBar } from 'expo-status-bar';
import {GoogleSigninButton,
statusCodes,
} from '@react-native-google-signin/google-signin';



const LoginScreen = ({navigation}) => {
    const [isLoading, setLoading] = useState(false)
    const { login } = useAuth()
    const [focus,setFocus] = useState('')
    
    
    const LoginPress = async (values,{resetForm}) => {
        setLoading(true);
        try{
            const response = await login(values.email, values.password)
            if(response){
                setTimeout(() => {
                    setLoading(false);
                    resetForm({values: ''})
                    navigation.navigate('Drawer');
                    Alert.alert('Success!!', 'you have logged in!');
                }, 2000); 
            }else{
                setLoading(false)
            }
        }catch(error){
            setLoading(false)
            console.log(`Unauthorized username and password ${error}`)
            Alert.alert('Login failed','Invalid username or password')  
        }
    }
    const RegisterPress = () => {
        navigation.navigate('Register')
    }
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
      



  return (
   
  
   
           <CustomKeyboardView>
            <SafeAreaView style={styles.screen}>
            <Image
           source={require('../assets/DevGuide.png')}
           style={styles.logo}/>
           <View style={styles.welcome}>
            <View style={styles.welcomeHcontainer}>
            <Text style={styles.welcomeText}>Welcome to </Text>
            <Text style={styles.welcomeStext}>DevGuiide</Text>
            </View>
            <View style={styles.welcomeLcontainer}>
            <Text style={styles.welcomeLtext}>The Most Popular Social Media App For All.</Text>
            </View>
           </View>
           <SafeAreaView>
           <Formik
           initialValues={initialValues}
           onSubmit={LoginPress}
           validationSchema={validationSchema}
           >
           {({handleSubmit,handleChange,values, errors,touched, setFieldTouched,isValid}) => (
                   <>
                   <View style={styles.UserContainer}>
                   <AppTextInput
                   keyboardTYpe='email-address'
                   icon='account' 
                   placeholder='E-mail' 
                   backgroundColor="#252525"
                   borderColor={focus === 'email' ? '#00BF63' : '#8a8a8a'}
                   onChangeText={handleChange('email')}
                   onFocus={() => setFocus('email')}
                   values={values.username}
                   onBlur={() => setFieldTouched('email')}
                   iconcolor={color.button}/>
                   {
                       touched.username && errors.username && (
                           <Text style={styles.errormessage}>{errors.username}</Text>
                       )
                   }
                   <AppTextInput
                   icon='lock'
                   secureTextEntry
                   placeholder='Password'
                   backgroundColor="#252525"
                   borderColor={focus === 'password' ? '#00BF63' : '#8a8a8a'}
                   onChangeText={handleChange('password')}
                   values={values.password}
                   onFocus={() => setFocus('password')}
                   onBlur={() => setFieldTouched('password')}
                   iconcolor={color.button}/>
                   { touched.password && errors.password && (
                       <Text style={styles.errormessage}>{errors.password}</Text>
                   )}
                   </View>
                   <View style={styles.LoginContainer}>
                       {isLoading ? ( 
                       <ActivityIndicator size='large' color={color.white} />) : (
                       <Button fontSize={15} onPress={handleSubmit} title='Login'color={isValid ? color.white:color.grey} disabled={!isValid}/>
                       )
                       }
                       <View style={styles.textContainer}>
                           <Text style={styles.text}>
                               Don't have an account?
                           </Text>
                           <Text onPress={RegisterPress} style={styles.text1}>Sign Up</Text>
                       </View>
                       </View> 
                   </>
           )}
           </Formik>
           </SafeAreaView>
           <View style={{marginVertical:30,flexDirection:'row',justifyContent:'space-between',padding:30}}>
            <GoogleSigninButton/>
            <Text>hi</Text>
            <Text>hi</Text>
            </View>
           <StatusBar style="light" />
            </SafeAreaView>
    </CustomKeyboardView>
        
  
 
  
  )
}


const styles = StyleSheet.create({
    screen:{
        backgroundColor:color.backgroundcolor,
        flex:1,
    }
    ,
    welcome:{
        padding:5,
    },
  
    welcomeText:{
        fontSize:30,
        marginLeft:20,
        color:'#ffffff',
        fontFamily:color.textFont
    },
    welcomeStext:{
        fontSize:30,
        color:'#7ed957',
        fontFamily:color.textFont
        
    },
    welcomeLtext:{
        fontSize:15,
        color:'#ffffff',
        fontFamily:color.textFont
    },
    welcomeHcontainer:{
        padding:8,
        flexDirection:'row'
    }
    ,
    welcomeLcontainer:{
        padding:10,
        marginLeft:20
    },
  
    errormessage:{
        color: color.danger,
        textAlign:'center',
        fontFamily:color.textFont
    },
    container:{
        flex:1,
    },
    LoginContainer:{
        padding:20,
        marginTop:10,
    },
    logo:{
        width:120,
        height:120,
        alignSelf:'left',
        marginVertical:110,
        marginBottom:20,
    },
    UserContainer:{
        marginTop:20,
        padding:10
    },
    textContainer:{
        marginTop:15,
        flexDirection:'row',
        alignSelf:'center'
    },
    text:{
        color:color.grey,
        textAlign:'center',
        fontSize: 15,
        fontFamily:color.textFont
    },
    text1:{
        color:color.grey,
        fontSize: 15,
        marginLeft:10,
        fontFamily:color.textFont
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
