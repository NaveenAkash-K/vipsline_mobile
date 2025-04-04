import {ScrollView, Text, View, StyleSheet} from "react-native";
import CampaignReportTable from "./CampaignReportTable";
import React, {useEffect, useState} from "react";
import whatsappReportByBusinessAPI from "../../apis/marketingAPI/serviceRemindersAPI/whatsappReportByBusinessAPI";
import useDateRange from "../../hooks/useDateRange";
import {formatAndFilterCardData} from "../../data/ReportData";
import moment from "moment/moment";
import DatePicker from "../../ui/DatePicker";
import Colors from "../../constants/Colors";
import EntryPicker from "../../components/common/EntryPicker";
import CustomPagination from "../../components/common/CustomPagination";
import greetingSMSReportAPI from "../../apis/marketingAPI/greetingsAPI/greetingSMSReportAPI";

export default function GreetingSMSReport() {
    const whatsAppListHeader = ["SENT DATE & TIME", "GREETING TYPE  ", "GROUP NAME", "SMS SENT", "DELIVERED", "FAILED", "SMS DEDUCTED"];

    const tableHeaderList = [
        {key: "r.name", sortKey: "r.name", title: "SENT DATE & TIME"},
        {key: "shift", sortKey: "shift", title: "GREETING TYPE"},
        {key: "firstCheckinTime", sortKey: "firstCheckinTime", title: "GROUP NAME"},
        {key: "lastCheckoutTime", sortKey: "lastCheckoutTime", title: "SMS SENT"},
        {key: "duration", sortKey: "duration", title: "DELIVERED"},
        {key: "status", sortKey: "", title: "FAILED"},
        {key: "lk,ominujbhytg", sortKey: "", title: "SMS DEDUCTED"},
    ]

    const [dataList, setDataList] = useState([]);
    const [maxPageCount, setMaxPageCount] = useState(0);
    const [pageNo, setPageNo] = useState(0);
    const [maxEntry, setMaxEntry] = useState(10);
    const [isEntryModalVisible, setIsEntryModalVisible] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(false);



    function renderItem(data, index) {
        return (
            <Text style={{padding: 8}}>{data}</Text>
        )
    }

    const {
        isCustomRange,
        isLoading,
        dateData,
        selectedValue,
        date,
        selectedFromCustomDate,
        selectedToCustomDate,
        handleSelection,
        handleCustomDateConfirm,
        currentFromDate,
        currentToDate,
        handleCustomDate,
    } = useDateRange({
        onDateChangeDays: (firstDate, SecondDate) => {
            fetchData(firstDate, SecondDate, pageNo, maxEntry);
        },
        onDateChangeMonth: (firstDate, SecondDate) => {
            fetchData(firstDate, SecondDate, pageNo, maxEntry);
        },
        onFirstCustomRangeSelected: (firstDate, SecondDate) => {
            fetchData(firstDate, SecondDate, pageNo, maxEntry);
        },
        onFirstOptionCustomChange: (firstDate, SecondDate) => {
            fetchData(firstDate, SecondDate, pageNo, maxEntry);
        },
        onSecondOptionCustomChange: (firstDate, SecondDate) => {
            fetchData(firstDate, SecondDate, pageNo, maxEntry);
        },
    });

    function fetchData(fromDate, toDate, pageNo, pageSize) {
        greetingSMSReportAPI(
            fromDate,
            toDate,
            pageNo,
            pageSize,
        ).then((res) => {
            setDataList(res.data.data[0].campaign)
            setMaxPageCount(res.data.data[0].count)
        })
    }

    useEffect(() => {
        fetchData(currentFromDate, currentToDate, 0, 10);
    }, []);

    return (
        <View style={styles.whatsappReport}>
            {isEntryModalVisible && (
                <EntryPicker
                    setIsModalVisible={setIsEntryModalVisible}
                    onPress={(number) => {
                        setMaxEntry(number);
                        setIsEntryModalVisible(false);
                    }}
                    maxEntry={maxEntry}
                    isVisible={isEntryModalVisible}
                />
            )}
            <DatePicker
                isCustomRange={isCustomRange}
                handleSelection={handleSelection}
                isLoading={isLoading}
                handleCustomDateConfirm={handleCustomDateConfirm}
                handleCustomDate={handleCustomDate}
                dateData={dateData}
                selectedValue={selectedValue}
                date={date}
                selectedToCustomDate={selectedToCustomDate}
                selectedFromCustomDate={selectedFromCustomDate}
            />
            <ScrollView horizontal={true} style={{flexGrow: 0}} showsHorizontalScrollIndicator={false}>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <CampaignReportTable
                        pageNo={10}
                        dataList={dataList}
                        tableHeaderList={tableHeaderList}
                        currentToDate={new Date()}
                        apiFunction={() => {}}
                        currentFromDate={new Date()}
                        maxEntry={10}
                        onChangeData={(data) => {}}
                        tableWidthHeader = {whatsAppListHeader}
                        renderItem={renderItem}
                        mergedColumns={["date", "type", "name", "totalSms", "delivered", "failed", "creditsDeducted"]}

                    />
                </ScrollView>
            </ScrollView>

            {
                maxPageCount > 10 &&
                <CustomPagination
                    setIsModalVisible={setIsEntryModalVisible}
                    maxEntry={maxEntry}
                    incrementPageNumber={() => setPageNo(prev => prev + 1)}
                    decrementPageNumber={() => setPageNo(prev => prev - 1)}
                    refreshOnChange={async () => {
                        fetchData(currentFromDate, currentToDate, pageNo, maxEntry);
                    }}
                    currentCount={dataList?.length ?? 1}
                    totalCount={maxPageCount}
                    resetPageNo={() => {
                        setPageNo(0);
                    }}
                    isFetching={isPageLoading}
                    currentPage={pageNo}
                />
            }

        </View>
    )
}

const styles = StyleSheet.create({
    whatsappReport: {
        flex: 1,
        padding: 12,
        backgroundColor: Colors.white
    }
})