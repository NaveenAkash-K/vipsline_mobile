import {ActivityIndicator, Modal, StyleSheet, Text, View} from "react-native";
import {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import PrimaryButton from "../../ui/PrimaryButton";
import Colors from "../../constants/Colors";
import CustomTextInput from "../../ui/CustomTextInput";
import DatePickerForwardBackward from "../../ui/DatePickerForwardBackward";
import DateRangePicker from "./DateRangePicker";
import {
    loadExpensesFromDb,
    updateCurrentCategoryId,
    updateCustomRangeStartEndDate,
    updateFilters,
    updateOldCopy
} from "../../store/ExpensesSlice";
import {Ionicons} from "@expo/vector-icons";
import textTheme from "../../constants/TextTheme";
import colors from "../../constants/Colors";

export default function ExpenseFilters({ isVisible, onClose, setLoading, loading }) {
    const dispatch = useDispatch();

    const { category, range, fromDate, toDate, oldCopy } = useSelector(state => state.expenses);
    const customRangeStartDate = useSelector(state => state.expenses.customRangeStartDate);
    const customRangeEndDate =   useSelector(state => state.expenses.customRangeEndDate);

    const [startDateRangeIsValid, setStartDateRangeIsValid] = useState(true);
    const [endDateRangeIsValid, setEndDateRangeIsValid] = useState(true);

    useEffect(() => {
        setStartDateRangeIsValid(true);
        setEndDateRangeIsValid(true);
    }, [range]);


    const categories = useSelector(state => state.expenses.categories);

    useEffect(() => {
        dispatch(updateOldCopy({ fromDate, toDate, category, range, customRangeStartDate, customRangeEndDate }));
    }, []);



    const handleApply = async () => {
        setLoading(true);
        dispatch(updateFilters({ fromDate, toDate, category, range, customRangeStartDate, customRangeEndDate }));
        dispatch(updateCurrentCategoryId(category === "All expenses" ? -1 : categories.find(item => item.name === category).id))

        if(range === "Custom range") {
            if(customRangeEndDate === "" && customRangeStartDate === "") {
                setEndDateRangeIsValid(false);
                setStartDateRangeIsValid(false);
                setLoading(false)
                return
            }
            if(customRangeStartDate === "") {
                setStartDateRangeIsValid(false);
                setLoading(false)
                return
            }
            if(customRangeEndDate === "") {
                setEndDateRangeIsValid(false);
                setLoading(false)
                return
            }
            if(customRangeStartDate !== "" && customRangeEndDate !== "") {
                setStartDateRangeIsValid(true)
                setEndDateRangeIsValid(true);
                setLoading(false);
            }
        }
        await dispatch(loadExpensesFromDb());
        setLoading(false);
        onClose();

    };

    return (
        <Modal style={{ flex: 1 }} visible={isVisible} animationType="slide" presentationStyle={"formSheet"} onRequestClose={onClose}>
            <View style={styles.advancedFilters}>
                <View style={styles.header}>
                    <Text style={[styles.headerText, textTheme.titleLarge]}>Filters</Text>
                    <PrimaryButton
                        buttonStyle={styles.closeButton}
                        onPress={() => {
                            onClose();
                            dispatch(updateFilters(oldCopy));
                        }}
                    >
                        <Ionicons name="close" size={25} color="black" />
                    </PrimaryButton>
                </View>
                <View style={styles.body}>
                    <CustomTextInput
                        label="Category"
                        type="dropdown"
                        dropdownItems={["All expenses"].concat(( categories.map(item => item.name)))}
                        onChangeValue={(value) => dispatch(updateFilters({ category: value, range, fromDate, toDate, customRangeStartDate, customRangeEndDate }))}
                        value={category}
                    />
                    <CustomTextInput
                        label="Select Range"
                        type="dropdown"
                        dropdownItems={["Today", "Week", "Month", "Year", "Custom range"]}
                        onChangeValue={(value) => dispatch(updateFilters({ range: value, category, fromDate, toDate, customRangeStartDate, customRangeEndDate }))}
                        value={range}
                    />
                    {range === "Custom range" ? (
                        <DateRangePicker
                            category={category}
                            range={range}
                            fromDate={customRangeStartDate}
                            toDate={customRangeEndDate}
                            startDateRangeIsValid={startDateRangeIsValid}
                            endDateRangeIsValid={endDateRangeIsValid}
                        />
                    ) : (
                        <DatePickerForwardBackward
                            label="Date"
                            type={range}
                            fromDate={fromDate}
                            toDate={toDate}
                            category={category}
                            range={range}
                            customRangeStartDate={customRangeStartDate}
                            customRangeEndDate={customRangeEndDate}
                        />
                    )}
                </View>
            </View>
            <View style={styles.bottomButtonContainer}>
                <PrimaryButton
                    label="Clear filters"
                    buttonStyle={styles.clearButton}
                    textStyle={[textTheme.titleMedium, {color: Colors.highlight}]}
                    onPress={async () => {
                        dispatch(updateFilters({
                            fromDate: moment().format("YYYY-MM-DD"),
                            toDate: moment().format("YYYY-MM-DD"),
                            category: "All expenses",
                            range: "Today",
                            customRangeStartDate: "",
                            customRangeEndDate: ""
                        }));
                        await dispatch(loadExpensesFromDb());
                    }}
                />
                {
                    loading ?
                        <PrimaryButton buttonStyle={styles.applyButton}>
                            <ActivityIndicator color={colors.white}/>
                        </PrimaryButton> :
                        <PrimaryButton label="Apply" buttonStyle={styles.applyButton} onPress={handleApply} />

                }
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    advancedFilters: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        width: '100%',
        backgroundColor: Colors.grey150,
        justifyContent: 'center'

    },
    body: {
        marginTop: 32,
        paddingHorizontal: 16
    },
    closeButton: {
        position: "absolute",
        right: 0,
        backgroundColor: Colors.grey150,
    },
    closeButtonPressable: {
        alignItems: "flex-end",
    },
    headerText: {
        paddingVertical: 12
    },
    advancedFiltersText: {
        marginLeft: 16
    },
    dropdownContainer: {
        paddingHorizontal: 16,
        marginTop: 8
    },
    lastVisitedText: {
        marginTop: 16,
        marginLeft: 16
    },
    dateInputContainer: {
        marginHorizontal: 12
    },
    filterDateContainer: {
        borderWidth: 1,
        marginHorizontal: 16,
        borderColor: Colors.grey250,
        marginTop: 8,
        paddingVertical: 24,
        borderRadius: 4
    },
    bottomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
        paddingVertical: 20,
        paddingHorizontal: 16,
        width: "100%",
        borderTopWidth: 1
    },
    clearButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey250,
        flex: 1
    },
    applyButton: {
        borderWidth: 1,
        borderColor: Colors.grey250,
        flex: 1
    },
    applyText: {
        color: Colors.white
    },
    clearFilterText: {
        color: Colors.black
    },

})