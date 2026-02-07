import { configureStore } from "@reduxjs/toolkit";
import slicer from "../authSlice";

const store = configureStore({
    reducer: {
        auth: slicer
    }
})
export default store