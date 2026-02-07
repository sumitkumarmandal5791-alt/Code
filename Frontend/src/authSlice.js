import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosClient from "./utils/axios"

export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/user/register", userData);

            return response.data.user;
        }
        catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const loginUser = createAsyncThunk(
    "auth/login",
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/user/login", userData);
            return response.data.user;
        }
        catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.get("/user/check");
            return response.data.user;
        }
        catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

export const logoutUser = createAsyncThunk(
    "auth/logoutUser",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosClient.post("/user/logout");
            return null
        }
        catch (error) {
            return rejectWithValue(error.response.data);
        }
    }
)

const slicer = createSlice({
    name: "slicers",
    initialState: {
        isAuthentication: false,
        loading: false,
        error: null,
        user: null
    },
    reducers: {},
    extraReducers: (bulider) => {
        bulider
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthentication = !!action.payload;
                state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            //login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthentication = !!action.payload;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            //userAuth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthentication = !!action.payload;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            //logout
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.isAuthentication = false;
                state.user = null;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthentication = false;
                state.error = action.payload;
                state.user = null;
            })


    }

})


export default slicer.reducer;

// response = {
//     data: {
//         user: reply,
//         message: "User is registered"

//     }
//     status_code:

// }