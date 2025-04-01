import {Text, View, StyleSheet, Image} from "react-native";
import Colors from "../../constants/Colors";
import textTheme from "../../constants/TextTheme";
import BulletListView from "../../components/marketing/BulletListView";
import PrimaryButton from "../../ui/PrimaryButton";
import ConfigureReminderModal from "../../components/marketing/ServiceReminders/ConfigureReminderModal";
import getListOfServiceRemindersAPI from "../../apis/marketingAPI/serviceRemindersAPI/getListOfServiceRemindersAPI";
import {useState} from "react";

export default function ServiceRemaindersLandingPage(props) {
    const data = [
        "Easy contact selection - select the target audience from your database or load them using ‘file upload’",
        "Quick launch - send messages to a large audience in a short span of time",
        "Track performance with detailed reports",
    ]

    const [configureReminderVisibility, setConfigureReminderVisibility] = useState()


    return (<View style={styles.SMSCampaignLandingPage}>
        {
            configureReminderVisibility &&
            <ConfigureReminderModal
                visible={configureReminderVisibility}
                onClose={() => {
                    setConfigureReminderVisibility(false);
                    getListOfServiceRemindersAPI().then((response) => {
                        props.setListOfServiceReminders(response.data.data[0].campaign_list);
                        if (response.data.data[0].campaign_list.length === 0) {
                            props.setIsCampaignListEmpty(true);
                        }
                        else {
                            props.setIsCampaignListEmpty(false);
                        }
                    })
                    props.setEdit(false);
                }}
                toastRef={props.toastRef}
                edit={false}
                selectedReminderData={[]}
            />
        }
        <View style={styles.content}>

            <Image source={require("../../assets/icons/marketingIcons/serviceReminders/bell.png")} style={styles.mobileIcon} />

            <Text style={[textTheme.titleMedium, {marginTop: 24, textAlign: 'center'}]}>Automated Service Reminders</Text>

            <Text style={[textTheme.bodyMedium, {marginTop: 8, textAlign: 'center'}]}>Send automated service reminders to your customers based on their previous visits</Text>

            {/*<BulletListView*/}
            {/*    data={data}*/}
            {/*    style={styles.bulletList}*/}
            {/*    contentContainerStyle={styles.contentContainerStyle}*/}
            {/*/>*/}

            <PrimaryButton
                label={"Configure Reminders"}
                buttonStyle={styles.button}
                onPress={() => setConfigureReminderVisibility(true)}


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