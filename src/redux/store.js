import { configureStore } from '@reduxjs/toolkit';
import refetchReducer from './refetchSlice';

export const store = configureStore({
  reducer: {
    refetch: refetchReducer,
  },
});

export default store;
