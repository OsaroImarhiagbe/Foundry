import { formatDistanceToNow } from 'date-fns'


export const getRoomID = (userdId1:string, userId2:string) => {
    const sortedId = [userdId1, userId2].sort();

    const roomId = sortedId.join('-')

    return roomId

}

export const blurhash =
  '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[';


export const formatDate = (date:Date) => {
    let day = date.getDate()
    let monthsNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    let month = monthsNames[date.getMonth()]


    let formattedDate = day+ ' '+ month
    return formattedDate
}


export const TimeAgo = (timestamp:number) => {
  if(!timestamp) return 'just now'
  const date = new Date(timestamp)

  return formatDistanceToNow(date,{addSuffix:true})

}
