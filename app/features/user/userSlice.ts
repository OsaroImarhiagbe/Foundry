import { createSlice } from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentuserID:'',
    profileimg:'',
    headerimg:'',
  },
  reducers: {
    addId:(state,action) =>{
      state.currentuserID = action.payload.currentuserID;
    },
    addImage:(state,action) => {
      state.profileimg = action.payload.profileimg
    },
    addHeaderImage:(state,action) => {
      state.profileimg = action.payload.headerimg
    }
  }
})
export const { addId,addImage,addHeaderImage } = userSlice.actions

export default userSlice.reducer