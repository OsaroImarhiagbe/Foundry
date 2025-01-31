import { createSlice} from "@reduxjs/toolkit";

export const searchSlice = createSlice({
    name:'search',
    initialState:{
        searchID:''
    },
    reducers:{
        addsearchID:(state,action) =>{
            state.searchID = action.payload.searchID
        }
    }
})

export const {addsearchID} = searchSlice.actions

export default searchSlice.reducer