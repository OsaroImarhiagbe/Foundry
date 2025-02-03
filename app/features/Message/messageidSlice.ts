import { createSlice } from "@reduxjs/toolkit";

export const messageidSlice = createSlice({
    name:'message',
    initialState:{
        messagesID:[]
    },
    reducers:{
        addID: (state,action) =>{
            if(!state.messagesID.includes(action.payload as never )){
                state.messagesID.push(action.payload as never)
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