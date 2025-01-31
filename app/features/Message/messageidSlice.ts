import { createSlice } from "@reduxjs/toolkit";

export const messageidSlice = createSlice({
    name:'message',
    initialState:{
        messagesID:[]
    },
    reducers:{
        addID: (state,action) =>{
            if(!state.messagesID.includes(action.payload)){
                state.messagesID.push(action.payload)
            }
        },
        removeID: (state,action) => {
            return {
                ...state,
                messagesID:state.messagesID.filter((id) => id !== action.payload )
        }
           
    }
}
})

export const {addID,removeID} = messageidSlice.actions

export default messageidSlice.reducer