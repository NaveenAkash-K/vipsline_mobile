import axios from "axios";
import * as SecureStore from "expo-secure-store";

export default async function getListWhatsAppBusinessTemplate(template_for) {
    try {
        const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URI}/messaging/getListOfWABusinessTemplateDetailsByType`, {
            business_id: await SecureStore.getItemAsync('businessId'),
            template_for: template_for
        }, {
            headers: {
                'Authorization': `Bearer ${await SecureStore.getItemAsync('authKey')}`
            }
        })
        return response;
    } catch (e) {
        console.error(`Error: get list of WA template for ${template_for} API`)
        return e.response;
    }
}