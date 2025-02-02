import { createSlice } from "@reduxjs/toolkit";


export const skillSlice = createSlice({
    name:'skill',
    initialState:{
        searchedSkills:[]
    },
    reducers:{
        addSkills:(state,action) =>{
            if(!state.searchedSkills.includes(action.payload as never )){
                state.searchedSkills.push(action.payload as never )
            }
        }
    }
})

export const {addSkills} = skillSlice.actions

export default skillSlice.reducer