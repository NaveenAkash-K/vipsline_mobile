import {Text, View, StyleSheet} from "react-native";
import AnalyticsCountCard from "../../components/marketing/AnalyticsCountCard";
import React, {useEffect, useRef, useState} from "react";
import Colors from "../../constants/Colors";
import PrimaryButton from "../../ui/PrimaryButton";
import SearchBar from "../../ui/SearchBar";
import SMSCampaignListViewCard from "../../components/marketing/SMSCampaignListViewCard";
import moment from "moment";
import InfiniteScrollerList from "../../ui/InfiniteScrollerList";
import textTheme from "../../constants/TextTheme";
import getListOfCampaignAPI from "../../apis/marketingAPI/SMSCampaignAPI/getListOfCampaignAPI";
import getCountOfSMSCampaignByDateAPI from "../../apis/marketingAPI/SMSCampaignAPI/getCountOfSMSCampaignByDateAPI";
import getSMSCreditBalanceAPI from "../../apis/marketingAPI/SMSCampaignAPI/getSMSCreditBalanceAPI";
import CreateSMSCampaignModal from "../../components/marketing/CreateSMSCampaignModal";
import Toast from "../../ui/Toast";
import toast from "../../ui/Toast";
import SMSCampaignLandingPage from "./SMSCampaignLandingpage";

export default function Dashboard() {
    const [analyticsCard, setAnalyticsCard] = useState([
        {
            count: 0,
            text: "Total Sent SMS",
            source: require("../../assets/icons/marketingIcons/smsCampaign/kite.png")
        },
        {
            count: 0,
            text: "Sent today",
            source: require("../../assets/icons/marketingIcons/smsCampaign/kite.png")
        },
        {
            count: 0,
            text: "Sent this week",
            source: require("../../assets/icons/marketingIcons/smsCampaign/kite.png")
        },
        {
            count: 0,
            text: "Available Credits",
            source: undefined
        }
        ]);

    const [pageNo, setPageNo] = useState(0);
    const [campaignList, setCampaignList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [createCampaignVisibility, setCreateCampaignVisibility] = useState(false);

    const toastRef = useRef();

    function renderItem({item}) {
        const dateTime = item.date_time.split(",");

        return <SMSCampaignListViewCard
            date={dateTime[0]}
            time={dateTime[1]}
            name={item.campaign_name}
            type={item.customer_type_name === null ? "-" : item.customer_type_name}
            count={item.total_count}
            status={item.status}

        />
    }

    function listHeaderComponent() {
        return <>
        <View style={styles.statisticContainer}>
            {
                analyticsCard.map((item, index) => {
                    return <AnalyticsCountCard
                        count={item.count}
                        text={item.text}
                        source={item.source}
                    />
                })
            }
        </View>
        <PrimaryButton
            label={"Create Campaign"}
            buttonStyle={styles.button}
            pressableStyle={styles.pressable}
            onPress={() => {setCreateCampaignVisibility(true)}}
        />
        <SearchBar
            placeholder={"Search by Campaign name"}
            // searchContainerStyle={styles.searchContainer}
            logoAndInputContainer={styles.searchContainer}

        />
        </>
    }

    function fetchData() {
        getListOfCampaignAPI(0, 10).then((response) => {
            setCampaignList(response.data.data[0].campaign_list);
            setTotalCount(response.data.data[0].total_count);
            setAnalyticsCard(prev =>
                prev.map((item, index) =>
                    index === 0 ? {...item, count: response.data.data[0].no_of_campaigns} : item
                ))
        });

        getCountOfSMSCampaignByDateAPI(moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")).then((response) => {
            setAnalyticsCard(prev =>
                prev.map((item, index) =>
                    index === 1 ? {...item, count: response.data.other_message} : item
                ))
        })

        getCountOfSMSCampaignByDateAPI(
            moment().startOf("week").format("YYYY-MM-DD"),
            moment().endOf("week").format("YYYY-MM-DD")
        ).then((response) => {
            setAnalyticsCard(prev =>
                prev.map((item, index) =>
                    index === 2 ? {...item, count: response.data.other_message} : item
                ))
        })

        getSMSCreditBalanceAPI().then((response) => {
            setAnalyticsCard(prev =>
                prev.map((item, index) =>
                    index === 3 ? {...item, count: response.data.other_message} : item
                ))
        })
    }

    useEffect(() => {
        fetchData();
    }, [])





    return (
        campaignList.length === 0 ?
            <SMSCampaignLandingPage
                onSave={fetchData}
                toastRef={toastRef}

            /> :
            <View style={styles.dashboard}>
                {
                    createCampaignVisibility &&
                    <CreateSMSCampaignModal
                        visible={createCampaignVisibility}
                        onClose={() => setCreateCampaignVisibility(false)}
                        onSave={() => {
                            fetchData();
                            setCreateCampaignVisibility(false);
                        }}
                        toastRef={toastRef}

                    />

                }
                <Toast ref={toastRef}/>
                    <InfiniteScrollerList
                        scrollEventThrottle={100}
                        style={{marginBottom: 32}}
                        onFetchTrigger={() => {
                            setIsLoading(true);
                            getListOfCampaignAPI(pageNo + 1, 10).then((response) => {
                                setCampaignList([...campaignList, ...response.data.data[0].campaign_list]);
                                setTotalCount(response.data.data[0].total_count);
                                setAnalyticsCard(prev =>
                                    prev.map((item, index) =>
                                        index === 0 ? {...item, count: response.data.data[0].no_of_campaigns} : item
                                ))
                            });
                            setPageNo(pageNo + 1);
                            setIsLoading(false);
                        }}
                        fallbackTextOnEmptyData={"No data"}
                        triggerThreshold={100}
                        totalLength={totalCount}
                        data={campaignList}
                        isLoading={isLoading}
                        endOfListMessage={""}
                        fallbackTextContainerStyle={{height: 500}}
                        fallbackTextStyle={{color: "black", ...textTheme.titleMedium}}
                        renderItem={renderItem}
                        scrollEnabled
                        contentContainerStyle={{gap: 16}}
                        ListHeaderComponent={() => listHeaderComponent()}
                        // customLoader={() => <ActivityIndicator color={"black"} size={20} />}

                    />
            </View>
    )
}

const styles = StyleSheet.create({
    dashboard: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    statisticContainer: {
        marginBottom: "4%",
        flexWrap: "wrap",
        flexDirection: "row",
        rowGap: 25,
        columnGap: 25,
        justifyContent: "center",
        marginTop: 32,
    },
    button: {
        marginTop: 16,
        marginHorizontal: 24
    },
    searchContainer: {
        borderWidth: 1,
        borderColor: Colors.grey400,
        backgroundColor: Colors.white,
        width: "100%",
        marginRight: 24,
        marginLeft: 24,
        marginTop: 32
    }
})