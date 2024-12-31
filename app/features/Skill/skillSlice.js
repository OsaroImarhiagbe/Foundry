import { createSlice } from "@reduxjs/toolkit";


export const skillSlice = createSlice({
    name:'skill',
    initialState:{
        searchedSkills:[]
    },
    reducers:{
        addSkills:(state,action) =>{
            if(!state.searchedSkills.includes(action.payload)){
                state.searchedSkills.push(action.payload)
            }
        }
    }
})

export const {addSkills} = skillSlice.actions

export default skillSlice.reducer