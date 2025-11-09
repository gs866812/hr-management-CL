import { configureStore } from '@reduxjs/toolkit';
import refetchReducer from './refetchSlice';
import userReducer from './userSlice';
import userNameReducer from './userNameSlice';

export const store = configureStore({
  reducer: {
    refetch: refetchReducer,
    user: userReducer,
    userName: userNameReducer,
  },
});

export default store;
