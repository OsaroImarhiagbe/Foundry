import { createSlice} from "@reduxjs/toolkit";

export const searchSlice = createSlice({
    name:'search',
    initialState:{
        searchID:''
    },
    reducers:{
        addsearchID:(state,action) =>{
            const {id} = action.payload;
            state.searchID = id
        }
    }
})

export const {addsearchID} = searchSlice.actions

export default searchSlice.reducer