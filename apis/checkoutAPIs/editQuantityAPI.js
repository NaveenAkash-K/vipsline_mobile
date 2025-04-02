import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default async function editQuantityAPI(data) {
    try {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URI}/cart/editQuantityByResourceCategory`, {
            business_id: await SecureStore.getItemAsync('businessId'),
            ...data
        }, {
            headers: {
                'Authorization': `Bearer ${await SecureStore.getItemAsync('authKey')}`
            }
        })
        return response;
    } catch (e) {
        console.log("Error: Edit Quantity API")
        return e.response;
    }
}