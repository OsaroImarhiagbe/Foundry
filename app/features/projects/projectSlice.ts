import { createSlice,PayloadAction } from "@reduxjs/toolkit";

interface Project{
    id:string;
}
interface ProjectId {
    id:string
}
interface ProjectState {
    projectid: Project[],
    currentId:ProjectId
}

const initialState:ProjectState = {
    projectid: [],
    currentId: { id: '' }
}
export const projectSlice = createSlice({
    name:'project',
    initialState,
    reducers:{
        addprojectId:(state,action: PayloadAction<Project>) => {
            state.projectid.push(action.payload)
        },
        currentProjectId:(state,action) => {
            state.currentId = action.payload.currentId
        }
    }
})


export const {addprojectId, currentProjectId} = projectSlice.actions

export default projectSlice.reducer