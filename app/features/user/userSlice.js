import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentuserID:'',
    profileimg:''
  },
  reducers: {
    addId:(state,action) =>{
      state.currentuserID = action.payload.currentuserID;
    },
    addImage:(state,action) => {
      state.profileimg = action.payload.profileimg
    }
  }
})
export const { addId,addImage } = userSlice.actions

export default userSlice.reducer