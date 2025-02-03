import React,{useState} from 'react'
import { Banner } from 'react-native-paper';

interface Notification{
  title?:string,
  message?:string,
  visiable?:any
}
const NotificationBanner:React.FC<Notification> = ({title,message,visiable}) => {
    const [isvisible,setVisible] = useState(false)
  return (
    <Banner
    visible={visiable}
    actions={[
        {
          label: 'Fix it',
          onPress: () => setVisible(false),
        },
        {
          label: 'Learn more',
          onPress: () => setVisible(false),
        },
      ]}
    >
       {title}
       {message} 
    </Banner>
  )
}

export default NotificationBanner