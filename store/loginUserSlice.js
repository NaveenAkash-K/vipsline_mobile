import {createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import {EXPO_PUBLIC_API_URI, EXPO_PUBLIC_BUSINESS_ID, EXPO_PUBLIC_AUTH_KEY} from "@env";
import * as SecureStore from 'expo-secure-store';

const initialClientState = {
    details: {},
    isFetching: false,
};

export const loadLoginUserDetailsFromDb = () => async (dispatch) => {
    let response = "";
    try {
        response = await axios.get(
            process.env.EXPO_PUBLIC_API_URI + '/user/profile',
            {
                headers: {
                    authorization: "Bearer " + await SecureStore.getItemAsync('authKey')
                }
            }
        );
        console.log("after api")
        dispatch(updateUserDetails(response.data.data[0]));
    } catch (e) {
        console.error(e);
    }
};

export const loginUser = createSlice({
    name: "loginUser",
    initialState: initialClientState,
    reducers: {
        updateUserDetails(state, action) {
            state.details = action.payload;
        },
    }
});

export const {updateUserDetails} = loginUser.actions;

export default loginUser.reducer;
