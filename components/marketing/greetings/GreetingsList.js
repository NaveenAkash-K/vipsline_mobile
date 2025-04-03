import {Text, View, StyleSheet, FlatList, ActivityIndicator} from "react-native";
import ServiceRemindersCard from "../../../components/marketing/ServiceReminders/ServiceRemindersCard";
import moment from "moment";
import {FAB} from "react-native-paper";
import Colors from "../../../constants/Colors";
import {useEffect, useRef, useState} from "react";
import Toast from "../../../ui/Toast";
import getListOfGreetingsAPI from "../../../apis/marketingAPI/greetingsAPI/getListOfGreetingsAPI";
import ManageGreetingsModal from "./ManageGreetingsModal";
import GreetingsLandingPage from "./GreetingsLandingPage";
import ThreeDotActionIndicator from "../../../ui/ThreeDotActionIndicator";
import updateGreetingsAPI from "../../../apis/marketingAPI/greetingsAPI/updateGreetingsAPI";

export default function GreetingsList(props) {
    const [getGreetingsList, setGetGreetingsList] = useState([]);
    const [edit, setEdit] = useState(false);
    const [selectedGreetingsData, setSelectedGreetingsData] = useState({});
    const [manageGreetingsVisibility, setManageGreetingsVisibility] = useState(false);
    const [isCampaignListEmpty, setIsCampaignListEmpty] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toastRef = useRef(null);

    function renderItem({item}) {
        const date_time = item.updated_at.split(" ");

        const date = date_time[0] +" " +  date_time[1];
        const time = date_time[2];

        return <ServiceRemindersCard
            date={moment(date, "DD MMM,YYYY").format("DD MMM,YYYY")}
            time={moment(time, "HH:mm").format("HH:mm")}
            name={item.group_name}
            type={item.greetings_type}
            notification={item.notification_type}
            active_status={item.sms_status}
            onPress={() => {
                setEdit(true);
                setSelectedGreetingsData(item)
                setManageGreetingsVisibility(true);
            }}
            onToggle={() => {
                updateGreetingsAPI({
                    id: item.id,
                    sms_status: !item.sms_status
                }).then(() => {
                    // setIsLoading(true);
                    getListOfGreetingsAPI().then((response) => {
                        setGetGreetingsList(response.data.data[0].campaign_list);
                        if (response.data.data[0].campaign_list.length === 0) {
                            setIsCampaignListEmpty(true);
                            props.navigation.setOptions({ title: 'Greetings Landing Page' });
                        }
                        else {
                            setIsCampaignListEmpty(false);
                            props.navigation.setOptions({ title: 'Greetings List' });
                        }
                        // setIsLoading(false);
                        toastRef.current.show("SMS status changed successfully!.");
                    })
                })
            }}
            toggleStatus={item.sms_status}
        />
    }
    useEffect(() => {
        setIsLoading(true);
        getListOfGreetingsAPI().then((response) => {
            setGetGreetingsList(response.data.data[0].campaign_list);
            if (response.data.data[0].campaign_list.length === 0) {
                setIsCampaignListEmpty(true);
                props.navigation.setOptions({ title: 'Greetings Landing Page' });
            }
            else {
                setIsCampaignListEmpty(false);
                props.navigation.setOptions({ title: 'Greetings List' });
            }
            setIsLoading(false);
        })
    }, []);


    return (
        isCampaignListEmpty ?
            <GreetingsLandingPage
                setIsCampaignListEmpty={setIsCampaignListEmpty}
                navigation={props.navigation}
                setGetGreetingsList={setGetGreetingsList}
            /> :
        <View style={styles.reminders}>
            <Toast ref={toastRef}/>
            {
                isLoading &&
                <View style={styles.loader}>
                    <ThreeDotActionIndicator
                        color={Colors.highlight}
                    />
                </View>
            }
            {
                manageGreetingsVisibility &&
                <ManageGreetingsModal
                        visible={manageGreetingsVisibility}
                        onClose={() => {
                            setIsLoading(true);
                            setManageGreetingsVisibility(false);
                            getListOfGreetingsAPI().then((response) => {
                                setGetGreetingsList(response.data.data[0].campaign_list);
                                if (response.data.data[0].campaign_list.length === 0) {
                                    setIsCampaignListEmpty(true);
                                    props.navigation.setOptions({ title: 'Greetings Landing Page' });
                                }
                                else {
                                    setIsCampaignListEmpty(false);
                                    props.navigation.setOptions({ title: 'Greetings List' });
                                }
                                setIsLoading(false)

                            })
                            setEdit(false);
                        }}
                        edit={edit}
                        toastRef={toastRef}
                        selectedGreetingsData={selectedGreetingsData}
                />
            }
            <FlatList
                data={getGreetingsList}
                renderItem={renderItem}
                contentContainerStyle={{gap: 16}}
                style={{marginVertical: 16 }}
            />

            <FAB
                color={Colors.white}
                style={styles.addButton}
                icon={"plus"}
                onPress={() => setManageGreetingsVisibility(true)}
            />
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

    },
    loader: {
        backgroundColor: Colors.white,
        position: "absolute",
        height: '100%',
        width: '100%',
        zIndex: 9999,
    }
})