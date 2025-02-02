import { createSlice,PayloadAction } from '@reduxjs/toolkit'


interface Post{
  id?:string,
  content?:string
  comments?:string[]
}
interface Comment {
  id: string;
  content: string;
  replies: string[];
}

interface Reply {
  id: string;
  content: string;
}
interface SocialState {
  posts: {
    byId: Record<string, Post>; 
    allIds: string[];
  };
  comments: {
    byId: Record<string, Comment>; 
    allIds: string[]; 
  };
  replies: {
    byId: Record<string, Reply>; 
    allIds: string[]; 
  };
}

const initialState: SocialState = {
  posts: {
    byId: {},
    allIds: [],
  },
  comments: {
    byId: {},
    allIds: [],
  },
  replies: {
    byId: {},
    allIds: [],
  },
}

export const socialSlice = createSlice({
  name: 'social',
 initialState,
  reducers: {
    addPost:(state,action:PayloadAction<{ id: string; content: string }>) => {
        const {id, content } = action.payload;
        state.posts.byId[id] = {id, content,comments:[]};
        state.posts.allIds.push(id)
    },
    addComment:(state,action:PayloadAction<{ id: string; postId: string; content: string }>) => {
        const {id, postId,content } = action.payload;
        state.comments.byId[id] = {id, content,replies:[]};
        state.comments.allIds.push(id as never)
        state?.posts?.byId[postId]?.comments?.push(id)
        
    },
    addReply:(state,action:PayloadAction<{ id: string; commentId: string; content: string }>) => {
        const {id, commentId,content } = action.payload;
        state.replies.byId[id] = {id, content};
        state.replies.allIds.push(id)
        if (state.comments.byId[commentId]) {
          state.comments.byId[commentId].replies.push(id);
        }
    },
  }
})


export const { addPost,addComment,addReply } = socialSlice.actions

export default socialSlice.reducer