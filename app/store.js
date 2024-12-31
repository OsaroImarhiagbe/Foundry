import { configureStore } from '@reduxjs/toolkit'
import socialReducer from './features/PostandComments/socialSlice'
import userReducer from './features/user/userSlice';
import searchReducer from './features/search/searchSlice';
import skillReducer from './features/Skill/skillSlice';
import { persistStore, persistReducer, FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER, } from "redux-persist";
import  messageReducer  from './features/Message/messageidSlice';
import { combineReducers,} from 'redux'
import AsyncStorage from '@react-native-async-storage/async-storage';

const rootReducer = combineReducers({
  social:socialReducer,
  user:userReducer,
  search:searchReducer,
  message:messageReducer,
  skill:skillReducer
})
const persistConfig = {
  key: "root",
  storage:AsyncStorage,
  whitelist:['user','message']
};
const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer:persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH,REHYDRATE,PAUSE,PERSIST,PURGE,REGISTER,],
      },
    }),
})


export const persistor = persistStore(store)

