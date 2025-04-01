import {Text, View, StyleSheet, FlatList} from "react-native";
import ServiceRemindersCard from "../../components/marketing/ServiceReminders/ServiceRemindersCard";
import moment from "moment";
import {FAB} from "react-native-paper";
import Colors from "../../constants/Colors";
import {useEffect, useRef, useState} from "react";
import ConfigureReminderModal from "../../components/marketing/ServiceReminders/ConfigureReminderModal";
import getListOfServiceRemindersAPI from "../../apis/marketingAPI/serviceRemindersAPI/getListOfServiceRemindersAPI";
import Toast from "../../ui/Toast";
import updateServiceReminderAPI from "../../apis/marketingAPI/serviceRemindersAPI/updateServiceReminderAPI";
import ServiceRemaindersLandingPage from "./ServiceRemaindersLandingPage";

export default function Reminders(props) {
    const [configureReminderVisibility, setConfigureReminderVisibility] = useState(false);
    const [listOfServiceReminders, setListOfServiceReminders] = useState([]);
    const [edit, setEdit] = useState(false);
    const [selectedReminderData, setSelectedReminderData] = useState({});
    const [isCampaignListEmpty, setIsCampaignListEmpty] = useState(false)

    const toastRef = useRef(null);

    function renderItem({item}) {
        const date_time = item.updated_at.split(" ");

        // console.log(date_time);

        const date = date_time[0] +" " +  date_time[1];
        const time = date_time[2];

        return <ServiceRemindersCard
            date={moment(date, "DD MMM,YYYY").format("YYYY-MM-DD")}
            time={moment(time, "HH:mm").format("HH:mm") + " " + date_time[3]}
            name={item.group_name}
            type={item.services[0].res_cat_id}
            count={item.serviceLength}
            notification={item.notification_type}
            active_status={item.sms_status}
            onPress={() => {
                setSelectedReminderData(item);
                setEdit(true);
                setConfigureReminderVisibility(true);
            }}
            onToggle={() => {
                updateServiceReminderAPI({
                    id: item.id,
                    sms_status: item.notification_type === "sms" ? !item.sms_status : undefined,
                    whatsapp_status: item.notification_type === "whatsapp" ? !item.whatsapp_status : undefined,
                }).then((res) => {
                    getListOfServiceRemindersAPI().then((response) => {
                        setListOfServiceReminders(response.data.data[0].campaign_list);
                        if (response.data.data[0].campaign_list.length === 0) {
                            setIsCampaignListEmpty(true);
                        }
                        else {
                            setIsCampaignListEmpty(false);
                        }
                    })
                })
            }}
            toggleStatus={item.notification_type === "sms" ? item.sms_status : item.whatsapp_status}

        />
    }

    useEffect(() => {
        getListOfServiceRemindersAPI().then((response) => {
            setListOfServiceReminders(response.data.data[0].campaign_list);
            if (response.data.data[0].campaign_list.length === 0) {
                setIsCampaignListEmpty(true);
            }
            else {
                setIsCampaignListEmpty(false);
            }
        })
    }, []);




    return (
        <View style={styles.reminders}>
            <Toast ref={toastRef}/>
            {
                configureReminderVisibility &&
                <ConfigureReminderModal
                    visible={configureReminderVisibility}
                    onClose={() => {
                        setConfigureReminderVisibility(false);
                        getListOfServiceRemindersAPI().then((response) => {
                            setListOfServiceReminders(response.data.data[0].campaign_list);
                            if (response.data.data[0].campaign_list.length === 0) {
                                setIsCampaignListEmpty(true);
                            }
                            else {
                                setIsCampaignListEmpty(false);
                            }
                        })
                        setEdit(false);
                    }}
                    toastRef={toastRef}
                    edit={edit}
                    selectedReminderData={selectedReminderData}
                />
            }

            {
                isCampaignListEmpty ?
                    <ServiceRemaindersLandingPage
                        setListOfServiceReminders={setListOfServiceReminders}
                        toastRef={toastRef}
                        setEdit={setEdit}
                        setIsCampaignListEmpty={setIsCampaignListEmpty}
                    /> :
                    <>
                        <FlatList
                            data={listOfServiceReminders}
                            renderItem={renderItem}
                            contentContainerStyle={{gap: 16}}
                            style={{marginVertical: 16 }}
                        />

                        <FAB
                            color={Colors.white}
                            style={styles.addButton}
                            icon={"plus"}
                            onPress={() => setConfigureReminderVisibility(true)}
                        />
                    </>
            }



        </View>
    )
}

const styles = StyleSheet.create({
    reminders: {
        flex: 1
    },
    addButton:  {
        position: "absolute",
        bottom: 40,
        right: 40,
        backgroundColor: Colors.highlight,
    }
})