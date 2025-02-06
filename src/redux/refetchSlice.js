import { createSlice } from "@reduxjs/toolkit";


const refetchSlice = createSlice({
    name: 'refetch',
    initialState: {
      refetch: false, // Default state is false
    },
    reducers: {
      setRefetch: (state, action) => {
        state.refetch = action.payload; // Toggle or set refetch state
      },
    },
  });
  
  export const { setRefetch } = refetchSlice.actions;
  export default refetchSlice.reducer;