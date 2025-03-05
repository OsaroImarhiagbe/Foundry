import { createSlice } from "@reduxjs/toolkit";
import { act } from "react";

export const projectSlice = createSlice({
    name:'project',
    initialState:{
        projectId:''
    },
    reducers:{
        addprojectId:(state,action) => {
            state.projectId = action.payload.projectId
        }
    }
})


export const {addprojectId} = projectSlice.actions

export default projectSlice.reducer