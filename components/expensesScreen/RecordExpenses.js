import {Modal, Text, View, StyleSheet, ScrollView, ActivityIndicator} from "react-native";
import { shadowStyling} from "../../util/Helpers";
import textTheme from "../../constants/TextTheme";
import PrimaryButton from "../../ui/PrimaryButton";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import React, {useEffect, useRef, useState} from "react";
import Colors from "../../constants/Colors";
import CustomTextInput from "../../ui/CustomTextInput";
import addExpensesAPI from "../../util/apis/addExpensesAPI";
import {useDispatch, useSelector} from "react-redux";
import {
    getExpenseSubCategoryId,
    loadExpensesFromDb,
    resetExpensesPageNo,
    updateMaxEntry
} from "../../store/ExpensesSlice";
import moment from "moment";
import editExpensesAPI from "../../util/apis/editExpensesAPI";
import DeleteExpenseModal from "./DeleteExpenseModal";
import colors from "../../constants/Colors";

export default function RecordExpenses(props) {
    const dispatch = useDispatch();

    const currentExpense = useSelector(state => state.expenses.currentExpense);
    const currentExpenseId = useSelector(state => state.expenses.currentExpensesId);
    const category = useSelector(state => state.expenses.category);
    const currentCategoryId = useSelector(state => state.expenses.currentCategoryId);
    const currentSubId = useSelector(state => state.expenses.currentSubId);

    const [isLoading, setIsLoading] = useState(false);

    const dateRef = useRef(null);
    const amountRef = useRef(null);
    const amountTypeRef = useRef(null);
    const expenseTypeRef = useRef(null);
    const paymentModeRef = useRef(null);


    function parseDate(dateStr) {
        const [day, month, year] = dateStr.split(" ");
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return new Date(year, months.indexOf(month), day);
    }

    const [expenseData, setExpenseData] = useState({
        expenseDate: props.type === "add" ? new Date() : props.searchQuery === "" ? parseDate((currentExpense.date.split(",")[0])) : currentExpense.date,
        expenseAmountType: props.type === "add" ? "" : currentExpense.expense_category,
        expenseType: props.type === "add" ? "" : currentExpense.expense_sub_category,
        amount: props.type === "add" ? "" : currentExpense.amount+"",
        paymentMode: props.type === "add" ? "" : currentExpense.payment_mode,
        reference: props.type === "add" ? "" : currentExpense.reference,
        notes: props.type === "add" ? "" : currentExpense.notes,
    });

    useEffect(() => {
        async function f() {
            // await dispatch(getExpenseSubCategoryId(categories.find(item => item.name === expenseData.expenseAmountType).id));
        }
        f();
    }, [expenseData.expenseAmountType]);

    const [deleteExpenseVisibility, setDeleteExpenseVisibility] = useState(false);
    const subIds = useSelector(state => state.expenses.subId);
    const categories = useSelector(state => state.expenses.categories);



    const updateExpenseData = (field, value) => {
        setExpenseData((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };


    return (
        <Modal
            visible={props.isVisible}
            animationType={"slide"}
            style={styles.modal}
            presentationStyle={"formSheet"}
            onRequestClose={props.closeModal}
        >
            {
                deleteExpenseVisibility &&
                <DeleteExpenseModal
                    isVisible={deleteExpenseVisibility}
                    onCloseModal={() => {
                        setDeleteExpenseVisibility(false);
                    }}
                    id={currentExpenseId}
                    content={"Do you want to delete this expense ?"}
                    oncloseAfterDelete={async () => {
                        props.closeModal();
                        dispatch(updateMaxEntry(10))
                        dispatch(resetExpensesPageNo());
                        props.setClientDetected(prev => !prev);
                        await dispatch(loadExpensesFromDb());

                    }}
                />
            }
            <View style={styles.recordExpense}>
                <View style={[styles.closeAndHeadingContainer, shadowStyling]}>
                    <Text style={[textTheme.titleLarge, styles.selectClientText]}>
                        {props.type === "add" ? "Record Expenses" : "Update Expenses"}
                    </Text>
                    <PrimaryButton
                        buttonStyle={styles.closeButton}
                        pressableStyle={styles.closeButtonPressable}
                        onPress={() => {
                            props.closeModal();
                        }}
                    >
                        <Ionicons name="close" size={25} color="black" />
                    </PrimaryButton>
                </View>
                <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}>
                    <CustomTextInput
                        labelTextStyle={textTheme.titleSmall}
                        label={"Date"}
                        type={"date"}
                        value={expenseData.expenseDate ? new Date(expenseData.expenseDate) : null}
                        onChangeValue={(date) => updateExpenseData("expenseDate", date)}
                        maximumDate={new Date()}
                        required
                        onSave={(callback) => {
                            dateRef.current = callback;
                        }}
                        validator={(text) => {
                            if(text === null || text === "") {
                                return "Date is required";
                            }
                            else {
                                return true
                            }
                        }}

                    />
                    <CustomTextInput
                        label={"Expense Account"}
                        labelTextStyle={textTheme.titleSmall}
                        type={"dropdown"}
                        dropdownItems={categories.map(item => item.name)}
                        value={expenseData.expenseAmountType}
                        onChangeValue={async (value) => {
                            updateExpenseData("expenseAmountType", value);
                            await dispatch(getExpenseSubCategoryId(categories.find(item => item.name === value).id));
                            updateExpenseData("expenseType", "");
                        }}
                        required
                        onSave={(callback) => {
                            amountTypeRef.current = callback;
                        }}
                        validator={(text) => {
                            if(text === null || text === "") {
                                return "Expense account is required";
                            }
                            else {
                                return true
                            }
                        }}
                    />
                    <CustomTextInput
                        label={"Expense Type"}
                        labelTextStyle={textTheme.titleSmall}
                        type={"dropdown"}
                        dropdownItems={subIds.map(item => item.name)}
                        value={expenseData.expenseType}
                        onChangeValue={(value) => updateExpenseData("expenseType", value)}
                        required
                        onSave={(callback) => {
                            expenseTypeRef.current = callback
                        }}
                        validator={(text) => {
                            if(text === null || text === "") {
                                return "Expense type required";
                            }
                            else {
                                return true
                            }
                        }}
                        dropdownOnPress={expenseData.expenseAmountType !== ""}
                    />
                    <CustomTextInput
                        label={"Amount"}
                        labelTextStyle={textTheme.titleSmall}
                        type={"price"}
                        value={expenseData.amount}
                        onChangeText={(value) => updateExpenseData("amount", value)}
                        placeholder={"0.00"}
                        required
                        onSave={(callback) => {
                            amountRef.current = callback
                        }}
                        validator={(text) => {
                            if(text === null || text === "") {
                                return "Amount is required";
                            }
                            else {
                                return true
                            }
                        }}
                    />
                    <CustomTextInput
                        label={"Payment Mode"}
                        labelTextStyle={textTheme.titleSmall}
                        type={"dropdown"}
                        dropdownItems={["Cash", "Card", "Digital Payment"]}
                        value={
                        expenseData.paymentMode === "CASH" || expenseData.paymentMode === "Cash" ?
                            "Cash" : expenseData.paymentMode === "CARD" || expenseData.paymentMode === "Card" ?
                            "Card" : expenseData.paymentMode === "DIGITAL PAYMENT" || expenseData.paymentMode === "Digital Payment"?
                                "Digital Payment" : ""
                    }
                        onChangeValue={(value) => updateExpenseData("paymentMode", value)}
                        required
                        onSave={(callback) => {
                            paymentModeRef.current = callback;
                        }}
                        validator={(text) => {
                            if(text === null || text === "") {
                                return "Payment Mode is required";
                            }
                            else {
                                return true
                            }
                        }}
                    />
                    <CustomTextInput
                        label={"Reference"}
                        labelTextStyle={textTheme.titleSmall}
                        type={"text"}
                        placeholder={"Reference"}
                        value={expenseData.reference}
                        onChangeText={(value) => updateExpenseData("reference", value)}
                    />
                    <CustomTextInput
                        label={"Notes"}
                        labelTextStyle={textTheme.titleSmall}
                        type={"multiLine"}
                        placeholder={"Notes"}
                        value={expenseData.notes}
                        onChangeText={(value) => updateExpenseData("notes", value)}

                    />
                </ScrollView>
                <View style={[styles.bottomButtonContainer, { gap: props.type === "add" ? undefined : 8 }]}>
                    {props.type === "add" ? null : (
                        <PrimaryButton
                            buttonStyle={styles.deleteIcon}
                            onPress={() => {
                                setDeleteExpenseVisibility(true)
                            }}>
                            <AntDesign name="delete" size={24} color="black" />
                        </PrimaryButton>
                    )}
                    {
                        isLoading ?
                            <PrimaryButton
                                buttonStyle={styles.saveButton}
                                pressableStyle={styles.saveButtonPressable}
                            >
                                <ActivityIndicator color={colors.white}/>
                            </PrimaryButton> :
                            <PrimaryButton
                                label={props.type === "add" ? "Save Expense" : "Update Expense"}
                                buttonStyle={styles.saveButton}
                                pressableStyle={styles.saveButtonPressable}
                                onPress={async () => {
                                    setIsLoading(true);
                                    const isDateEntered = dateRef.current();
                                    const isExpenseAmountEntered = amountTypeRef.current();
                                    const isExpenseTypeEntered = expenseTypeRef.current();
                                    const isAmountEntered = amountRef.current();
                                    const isPaymentModeEntered = paymentModeRef.current();


                                    if(!isDateEntered ||
                                        !isExpenseAmountEntered ||
                                        !isExpenseTypeEntered ||
                                        !isAmountEntered ||
                                        !isPaymentModeEntered) {
                                        setIsLoading(false)
                                        return ;
                                    }

                                    await dispatch(getExpenseSubCategoryId(categories.find(item => item.name === expenseData.expenseAmountType).id)).then( async res1 => {

                                        const subId = res1.id;
                                        const catId = await categories.find(item => item.name === expenseData.expenseAmountType).id


                                            if(props.type === "add") {
                                                const res = await addExpensesAPI(expenseData, catId, subId);
                                                if(res) {
                                                    dispatch(loadExpensesFromDb());
                                                    setIsLoading(false);
                                                    props.closeModal();
                                                }
                                                else {
                                                    setIsLoading(false)
                                                }
                                            }
                                            else {
                                                const res = await editExpensesAPI(expenseData, catId, subId, currentExpenseId);
                                                if(res) {
                                                    dispatch(loadExpensesFromDb());
                                                    props.closeModal()
                                                }
                                                else {
                                                    setIsLoading(false)
                                                }
                                            }
                                        }

                                    );

                                    setIsLoading(false);
                                }}
                            />
                    }

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modal: { flex: 1 },
    recordExpense: {
        alignItems: "center",
        flex: 1,
    },
    closeAndHeadingContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 60,
        flexDirection: "row",
    },
    closeButton: {
        position: "absolute",
        right: 0,
        backgroundColor: Colors.white,
    },
    closeButtonPressable: {
        alignItems: "flex-end",
    },
    selectClientText: {
        fontWeight: "500",
        flex: 1,
        justifyContent: "center",
        textAlign: "center",
    },
    saveButton: { flex: 1 },
    saveButtonPressable: {},
    bottomButtonContainer: {
        width: '100%',
        paddingHorizontal: 16,
        paddingVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 0.6,
        borderColor: 'rgba(0,0,0,0.1)',
        flexDirection: 'row'
    },
    deleteIcon: {
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.white,
        borderColor: Colors.grey250
    }
});
