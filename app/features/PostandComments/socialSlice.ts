import { createSlice } from '@reduxjs/toolkit'

export const socialSlice = createSlice({
  name: 'social',
  initialState: {
    posts:{
        byId:{},
        allIds:[]
    },
    comments:{
        byId:{},
        allIds:[],
    },
    replies:{
        byId:{},
        allIds:[]
    }
  },
  reducers: {
    addPost:(state,action) => {
        const {id, content } = action.payload;
        state.posts.byId[id] = {id, content,comments:[]};
        state.posts.allIds.push(id)
    },
    addComment:(state,action) => {
        const {id, postId,content } = action.payload;
        state.comments.byId[id] = {id, content,replies:[]};
        state.comments.allIds.push(id)
        state.posts.byId[postId].comments.push(id)
    },
    addReply:(state,action) => {
        const {id, commentId,content } = action.payload;
        state.replies.byId[id] = {id, content};
        state.replies.allIds.push(id)
        state.comments.byId[commentId].push(id)
    },
  }
})

// Action creators are generated for each case reducer function
export const { addPost,addComment,addReply } = socialSlice.actions

export default socialSlice.reducer