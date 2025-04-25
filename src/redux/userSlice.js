import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import useAxiosProtect from '../utils/useAxiosProtect';




export const fetchPresentUser = createAsyncThunk(
  'user/fetchPresentUser',
  async (userEmail, { rejectWithValue }) => {
    try {
      const axiosProtect = useAxiosProtect(); // Call the hook *inside* the thunk
      const response = await axiosProtect.get('/getCurrentUser', {
        params: { userEmail },
      });
      return response.data;
    } catch (error) {
      toast.error('Error fetching user data jjjjj');
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    presentUser: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearUserData: (state) => {
      state.presentUser = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPresentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPresentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.presentUser = action.payload;
      })
      .addCase(fetchPresentUser.rejected, (state, action) => {
        state.loading = false;
        state.presentUser = null;
        state.error = action.payload;
      });
  },
});

export const { clearUserData } = userSlice.actions;
export const selectPresentUser = (state) => state.user.presentUser;
export default userSlice.reducer;