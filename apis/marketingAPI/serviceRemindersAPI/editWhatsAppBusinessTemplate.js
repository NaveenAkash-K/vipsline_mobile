import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default async function editWhatsAppBusinessTemplate(assigned_template_id, wa_business_template_id) {
    try {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URI}/messaging/editWABusinessTemplate`, {
            assigned_template_id: assigned_template_id,
            wa_business_template_id: wa_business_template_id
        }, {
            headers: {
                'Authorization': `Bearer ${await SecureStore.getItemAsync('authKey')}`
            }
        })
        return response;
    } catch (e) {
        console.log("Error: edit whatsapp business template by id API")
        return e.response;
    }
}