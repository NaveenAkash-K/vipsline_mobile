import {Text, View, StyleSheet, Image} from "react-native";
import Colors from "../../constants/Colors";
import textTheme from "../../constants/TextTheme";
import BulletListView from "../../components/marketing/BulletListView";
import PrimaryButton from "../../ui/PrimaryButton";
import CreateSMSCampaignModal from "../../components/marketing/CreateSMSCampaignModal";
import React, {useState} from "react";

export default function SMSCampaignLandingPage(props) {
    const data = [
        "Easy contact selection - select the target audience from your database or load them using ‘file upload’",
        "Quick launch - send messages to a large audience in a short span of time",
        "Track performance with detailed reports",
    ]

    const [createCampaignVisibility, setCreateCampaignVisibility] = useState(false);



    return (<View style={styles.SMSCampaignLandingPage}>
        {
            createCampaignVisibility &&
            <CreateSMSCampaignModal
                visible={createCampaignVisibility}
                onClose={() => setCreateCampaignVisibility(false)}
                onSave={() => {
                    props.onSave();
                    setCreateCampaignVisibility(false);
                }}
                toastRef={props.toastRef}

            />

        }
        <View style={styles.content}>

            <Image source={require("../../assets/icons/marketingIcons/smsCampaign/mobile.png")} style={styles.mobileIcon} />

            <Text style={[textTheme.titleMedium, {marginTop: 24, textAlign: 'center'}]}>SMS Campaigns</Text>

            <Text style={[textTheme.bodyMedium, {fontWeight: "700", letterSpacing: 0.1, marginTop: 8}]}>Reach out to your customers by launching an SMS campaign today.</Text>

            <BulletListView
                data={data}
                style={styles.bulletList}
                contentContainerStyle={styles.contentContainerStyle}
            />

            <PrimaryButton
                label={"Get Started"}
                buttonStyle={styles.button}
                onPress={() => setCreateCampaignVisibility(true)}


            />


        </View>


    </View>)
}

const styles = StyleSheet.create({
    SMSCampaignLandingPage: {
        flex: 1,
        backgroundColor: Colors.white,
        paddingHorizontal: 12,
        paddingVertical: 18,

    },
    mobileIcon: {
        width: 98,
        height: 98,
        marginTop: 32,
        alignSelf: "center",

    },
    content: {
        borderWidth: 1,
        borderRadius: 8,
        width: "100%",
        borderColor: Colors.grey400,
        paddingHorizontal: 32,
        backgroundColor: Colors.background100
    },
    bulletList: {
        marginTop: 24
    },
    contentContainerStyle: {
        gap: 8
    },
    button: {
        marginVertical: 32
    }
})