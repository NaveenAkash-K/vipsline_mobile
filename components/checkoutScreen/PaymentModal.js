import { FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from "react-native";
import textTheme from "../../constants/TextTheme";
import PrimaryButton from "../../ui/PrimaryButton";
import { Feather, Ionicons } from "@expo/vector-icons";
import Divider from "../../ui/Divider";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Colors from "../../constants/Colors";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CustomTextInput from "../../ui/CustomTextInput";
import Entypo from '@expo/vector-icons/Entypo';
import InvoiceModal from "./InvoiceModal";
import splitPaymentAPI from "../../util/apis/SplitPaymentAPI";
import DropdownModal from "../../ui/DropdownModal";
import checkoutBooking from "../../util/apis/checkoutBookingAPI";
import checkoutBookingAPI from "../../util/apis/checkoutBookingAPI";
import { useDispatch, useSelector } from "react-redux";
import {
    loadBookingDetailsFromDb,
    loadInvoiceDetailsFromDb,
    loadWalletPriceFromDb,
    updateBookingId
} from "../../store/invoiceSlice";
import updateAPI from "../../util/apis/updateAPI";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import updateLiveStatusAPI from "../../util/apis/updateLiveStatusAPI";
import { shadowStyling } from "../../util/Helpers";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import {
    clearCalculatedPrice,
    clearLocalCart, clearSalesNotes,
    modifyClientMembershipId,
    modifyPrepaidDetails,
    updateCalculatedPrice,
    updateRewardAmount
} from "../../store/cartSlice";
import calculateCartPriceAPI from "../../util/apis/calculateCartPriceAPI";
import Loader from 'react-native-three-dots-loader'
import ThreeDotActionIndicator from "../../ui/ThreeDotActionIndicator";
import clearCartAPI from "../../util/apis/clearCartAPI";
import DeleteClient from "../clientSegmentScreen/DeleteClientModal";
import { clearClientInfo } from "../../store/clientInfoSlice";
import * as Haptics from "expo-haptics";
import Toast from "../../ui/Toast";
import { MaterialIcons } from '@expo/vector-icons';
import RewardPointModal from "./RewardPointModal";
import { useFirstRender } from "../../hooks/useFirstRender";

const PaymentModal = (props) => {
    const dispatch = useDispatch();

    const fullClientData = useSelector(state => state.clientInfo);
    const clientInfo = useSelector(state => state.clientInfo.details);
    const isZeroPayment = props.price === 0;
    const isPrepaidInCart = useSelector(state => state.cart.prepaid_wallet[0].wallet_amount) !== "";
    const isPrepaidAvailable = !isPrepaidInCart && clientInfo.wallet_status && clientInfo.wallet_balance !== undefined && clientInfo.wallet_balance !== 0;
    const [selectedPaymentOption, setSelectedPaymentOption] = useState(isPrepaidAvailable ? isZeroPayment ? null : clientInfo.wallet_balance > props.price ? "prepaid" : "split_payment" : null);
    const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
    const [totalPrice, setTotalPrice] = useState(props.price);
    const [splitResponse, setSplitResponse] = useState([]);
    const [addedSplitPayment, setAddedSplitPayment] = useState(null);
    const [stopAPI, setStopAPI] = useState(false);
    const [isSplitPaymentDropdownVisible, setIsSplitPaymentDropdownVisible] = useState(false)
    const [recentlyChanged, setRecentlyChanged] = useState([]);
    const [paymentOrder, setPaymentOrder] = useState(isPrepaidAvailable ? isZeroPayment ? null : ["prepaid"] : [])
    const [isError, setIsError] = useState(true);
    const [bodyData, setBodyData] = useState([])
    const [shownCount, setShownCount] = useState(0)
    const invoiceDetails = useSelector(state => state.invoice.details);
    const moreInvoiceDetails = useSelector(state => state.invoice.invoiceDetails);
    const [isLoading, setIsLoading] = useState(false);
    const [isOptionsDropdownModalVisible, setIsOptionsDropdownModalVisible] = useState(false)
    const [isCancelSalesModalVisible, setIsCancelSalesModalVisible] = useState(false)
    const [isRewardModalVisible, setIsRewardModalVisible] = useState(false)
    const businessDetails = useSelector(state => state.businesses.businessNotificationDetails);
    const isRewardActive = (businessDetails?.data[0]?.rewardsEnabled !== undefined && businessDetails?.data[0]?.rewardsEnabled && clientInfo.reward_balance !== 0)
    const [rewardValue, setRewardValue] = useState(0);
    const [rewardValueToggle, setRewardValueToggle] = useState(0);
    const [initialSplitChange, setInitialSplitChange] = useState([
        {
            mode: "cash",
            shown: true,
            amount: 0,
            name: "Cash"
        }, {
            mode: "card",
            shown: true,
            amount: 0,
            name: "Credit / Debit Card"
        }, {
            mode: "digital payments",
            shown: false,
            amount: 0,
            name: "Digital payment"
        }, {
            mode: "prepaid",
            shown: false,
            amount: 0,
            name: "Prepaid"
        }, {
            mode: "Rewards",
            shown: false,
            amount: 0,
            name: "Reward Points"
        }
    ])
    const [splitUpState, setSplitUpState] = useState([
        {
            mode: "cash",
            shown: true,
            amount: 0,
            name: "Cash"
        }, {
            mode: "card",
            shown: true,
            amount: 0,
            name: "Credit / Debit Card"
        }, {
            mode: "digital payments",
            shown: false,
            amount: 0,
            name: "Digital payment"
        }, {
            mode: "prepaid",
            shown: false,
            amount: 0,
            name: "Prepaid"
        }, {
            mode: "Rewards",
            shown: false,
            amount: 0,
            name: "Reward Points"
        }
    ]
    )
    // const [splitUpState, setSplitUpState] = useState(47)
    const [initialSplit, setInitialSplit] = useState(47);

    const firstRender = useFirstRender();

    const cartSliceState = useSelector((state) => state.cart);
    const prepaidWallet = useSelector((state) => state.cart.prepaid_wallet);
    const details = useSelector(state => state.clientInfo.details);

    const toastRef = useRef(null)

    useEffect(() => {
        if (addedSplitPayment !== null) setPaymentOrder(prev => [...prev, addedSplitPayment]);
        setSplitUpState(prev => prev.map((split) => {
            setShownCount(prev.reduce((acc, item) => {
                return item.shown ? acc + 1 : acc;
            }, 0))
                if (split.name === addedSplitPayment) {
                    if (shownCount === 0) {
                        return ({
                            ...split,
                            amount: props.price,
                            shown: true
                        })
                    } else {
                        return ({
                            ...split,
                            shown: true
                        })
                    }
                }
            return split;
        }))
        setAddedSplitPayment(null);
    }, [addedSplitPayment]);

    useLayoutEffect(() => {
        setTotalPrice(props.price);
        if (isPrepaidAvailable && isRewardActive) {
            if (clientInfo.wallet_balance < props.price) {
                setInitialSplitChange([
                    {
                        mode: "prepaid",
                        shown: true,
                        amount: clientInfo.wallet_balance,
                        name: "Prepaid"
                    }, {
                        mode: "Rewards",
                        shown: false,
                        amount: 0,
                        name: "Reward Points"
                    }, {
                        mode: "cash",
                        shown: true,
                        amount: props.price - clientInfo.wallet_balance,
                        name: "Cash"
                    }, {
                        mode: "card",
                        shown: false,
                        amount: 0,
                        name: "Credit / Debit card"
                    }, {
                        mode: "digital payments",
                        shown: false,
                        amount: 0,
                        name: "Digital payment"
                    }
                ])
            } else {
                setInitialSplitChange([
                    {
                        mode: "prepaid",
                        shown: true,
                        amount: 0,
                        name: "Prepaid"
                    }, {
                        mode: "Rewards",
                        shown: false,
                        amount: 0,
                        name: "Reward Points"
                    }, {
                        mode: "cash",
                        shown: true,
                        amount: 0,
                        name: "Cash"
                    }, {
                        mode: "card",
                        shown: false,
                        amount: 0,
                        name: "Credit / Debit card"
                    }, {
                        mode: "digital payments",
                        shown: false,
                        amount: 0,
                        name: "Digital payment"
                    }
                ])
            }
        } else if (isPrepaidAvailable && !isRewardActive) {
            if (clientInfo.wallet_balance < props.price) {
                setInitialSplitChange([
                    {
                        mode: "prepaid",
                        shown: true,
                        amount: clientInfo.wallet_balance,
                        name: "Prepaid"
                    }, {
                        mode: "cash",
                        shown: true,
                        amount: props.price - clientInfo.wallet_balance,
                        name: "Cash"
                    }, {
                        mode: "card",
                        shown: false,
                        amount: 0,
                        name: "Credit / Debit card"
                    }, {
                        mode: "digital payments",
                        shown: false,
                        amount: 0,
                        name: "Digital payment"
                    }
                ])
            } else {
                setInitialSplitChange([
                    {
                        mode: "prepaid",
                        shown: true,
                        amount: 0,
                        name: "Prepaid"
                    }, {
                        mode: "cash",
                        shown: true,
                        amount: 0,
                        name: "Cash"
                    }, {
                        mode: "card",
                        shown: false,
                        amount: 0,
                        name: "Credit / Debit card"
                    }, {
                        mode: "digital payments",
                        shown: false,
                        amount: 0,
                        name: "Digital payment"
                    },
                ])
            }
        }
        else if (isRewardActive) {
            setInitialSplitChange([
                {
                    mode: "Rewards",
                    shown: false,
                    amount: 0,
                    name: "Reward Points"
                }, {
                    mode: "cash",
                    shown: true,
                    amount: 0,
                    name: "Cash"
                }, {
                    mode: "card",
                    shown: true,
                    amount: 0,
                    name: "Credit / Debit card"
                }, {
                    mode: "digital payments",
                    shown: false,
                    amount: 0,
                    name: "Digital payment"
                }
            ])
        }
        else {
            setInitialSplitChange([
                {
                    mode: "cash",
                    shown: true,
                    amount: 0,
                    name: "Cash"
                }, {
                    mode: "card",
                    shown: true,
                    amount: 0,
                    name: "Credit / Debit card"
                }, {
                    mode: "digital payments",
                    shown: false,
                    amount: 0,
                    name: "Digital payment"
                },
            ])
        }
    }, [props.price, props.isVisible]);

    useEffect(() => {
        setInitialSplit(initialSplitChange);
    }, [initialSplitChange]);

    useEffect(() => {
        setSplitUpState(initialSplitChange);
    }, [initialSplitChange]);

    useEffect(() => {
        setSplitResponse([]);
        setTotalPrice(props.price);
    }, [selectedPaymentOption]);

    const callSplitAPI = () => {
        if (stopAPI) return;

        const splitApi = async () => {
            let data;
            if (selectedPaymentOption === "split_payment") {
                // const shownCount = splitUpState.reduce((acc, item) => {
                //     return item.shown ? acc + 1 : acc;
                // }, 0);
                const aiyoda = recentlyChanged.slice(Math.abs(recentlyChanged.length - shownCount), recentlyChanged.length - 1);
                // return;
                data = {
                    booking_amount: props.price,
                    paid_amount: splitUpState.map(split => {

                        if (split.mode === "cash" && split.shown) {
                            if (shownCount === 4 && paymentOrder.at(-1) === "cash") {
                                return {
                                    mode: "CASH",
                                    amount: 0
                                }
                            }
                            if (shownCount === 3 && paymentOrder.at(-1) === "cash") {
                                return {
                                    mode: "CASH",
                                    amount: 0
                                }
                            }
                            if (shownCount === 2 && aiyoda.includes(split.mode)) {
                                return {
                                    mode: "CASH",
                                    amount: 0
                                }
                            }
                            return {
                                mode: "CASH",
                                amount: split.amount
                            }
                        } else if (split.mode === "card" && split.shown) {
                            if (shownCount === 4 && paymentOrder.at(-1) === "card") {
                                return {
                                    mode: "CARD",
                                    amount: 0
                                }
                            }
                            if (shownCount === 3 && paymentOrder.at(-1) === "card") {
                                return {
                                    mode: "CARD",
                                    amount: 0
                                }
                            }
                            if (shownCount === 2 && aiyoda.includes(split.mode)) {
                                return {
                                    mode: "CARD",
                                    amount: 0
                                }
                            }
                            return {
                                mode: "CARD",
                                amount: split.amount
                            }
                        } else if (split.mode === "digital payments" && split.shown) {
                            if (shownCount === 4 && paymentOrder.at(-1) === "digital payments") {
                                return {
                                    mode: "DIGITAL PAYMENTS",
                                    amount: 0
                                }
                            }
                            if (shownCount === 3 && paymentOrder.at(-1) === "digital payments") {
                                return {
                                    mode: "DIGITAL PAYMENTS",
                                    amount: 0
                                }
                            }
                            if (shownCount === 2 && aiyoda.includes(split.mode)) {
                                return {
                                    mode: "DIGITAL PAYMENTS",
                                    amount: 0
                                }
                            }
                            return {
                                mode: "DIGITAL PAYMENTS",
                                amount: split.amount
                            }
                        } else if (split.mode === "prepaid" && split.shown) {
                            if (shownCount === 4 && paymentOrder.at(-1) === "prepaid") {
                                return {
                                    mode: "PREPAID",
                                    amount: 0
                                }
                            }
                            if (shownCount === 3 && paymentOrder.at(-1) === "prepaid") {
                                return {
                                    mode: "PREPAID",
                                    amount: 0
                                }
                            }
                            if (shownCount === 2 && aiyoda.includes(split.mode)) {
                                return {
                                    mode: "PREPAID",
                                    amount: 0
                                }
                            }
                            return {
                                mode: "PREPAID",
                                amount: split.amount
                            }
                        } else if (split.mode === "Rewards" && split.shown) {
                            if (shownCount === 4 && paymentOrder.at(-1) === "Rewards") {
                                return {
                                    mode: "REWARDS",
                                    amount: rewardValue
                                }
                            }
                            if (shownCount === 3 && paymentOrder.at(-1) === "Rewards") {
                                return {
                                    mode: "REWARDS",
                                    amount: rewardValue
                                }
                            }
                            if (shownCount === 2 && aiyoda.includes(split.mode)) {
                                return {
                                    mode: "REWARDS",
                                    amount: rewardValue
                                }
                            }
                            return {
                                mode: "REWARDS",
                                amount: split.amount
                            }
                        }
                        return null;
                    }).filter(item => item !== null)
                }
            }


            const response = await splitPaymentAPI(data);
            setSplitResponse(response[0]);
            setStopAPI(true);
        }
        splitApi();
    }

    useEffect(() => {
        let totalCount = 0;
        splitUpState.map((prev => {
            if (prev.shown) {
                totalCount += Number(prev.amount);
            }
        }))
        if (totalCount === props.price)
            setIsError(false);
        else setIsError(true)
        
    }, [splitUpState, rewardValue]);

    useEffect(() => {
        const objectEntries = Object.entries(splitResponse);

        setSplitUpState(prev => prev.map(state => {
            const foundEntry = objectEntries.find(entry => entry[0].toUpperCase() === state.mode.toUpperCase());
            if (foundEntry) {
                return {
                    ...state,
                    amount: parseFloat(foundEntry[1]),
                    shown: true,
                }
            }
            return state;
        }));

        setShownCount(splitUpState.reduce((acc, item) => {
            return item.shown ? acc + 1 : acc;
        }, 0))
    }, [splitResponse]);

    const callCashAPI = () => {
        if (selectedPaymentOption === "card" || selectedPaymentOption === "digital payments" || selectedPaymentOption === "prepaid") {
            if (parseFloat(totalPrice) > props.price) {
                setTotalPrice(props.price);
            }
        }

        const splitApi = async () => {
            if (selectedPaymentOption === "cash") {
                const response = await splitPaymentAPI({
                    booking_amount: props.price,
                    paid_amount: [{ mode: "CASH", amount: totalPrice }]
                });
                setSplitResponse(response);
            } else if (selectedPaymentOption === "split_payment") { 
                const response = await splitPaymentAPI({
                    booking_amount: props.price,
                    paid_amount: [{ mode: "CASH", amount: totalPrice }]
                });
                setSplitResponse(response);
            }
        }
        splitApi();
    }
    const insets = useSafeAreaInsets();
    const findIsPrepaid = () => {
        return cartSliceState.items.find(item => item.gender === "prepaid");
    }
    useLayoutEffect(() => {
        console.log("hello");
        
        if (rewardValue !== 0 && rewardValue < props.price) {
            setSelectedPaymentOption("split_payment")
            const splitApi = async () => {
                // if (selectedPaymentOption === "split_payment") {
                const checkSplitActive = splitUpState.filter(e => e.shown).reduce((acc, item) => { return item.amount + acc }, 0);
                let splitState = splitUpState.map(item => ({ mode: item.mode, amount: item.amount, shown: item.shown }));
                const removedZeroSplitState = splitState.filter(e => e.shown).map(item => ({ mode: (item.mode).toUpperCase(), amount: item.amount }));
                let validatedSplitState = removedZeroSplitState;
                // const isGreaterSplit = removedZeroSplitState.reduce((acc,item) => { return item.amount + acc },0) >= props.price;
                // if(isGreaterSplit){
                //     let len = validatedSplitState.length;
                //     validatedSplitState = validatedSplitState.map((item,index) => {
                //         if(index === len-1){
                //             return ({...item ,mode: item.mode.toUpperCase(),amount : 0})
                //         }
                //         else {
                //             return ({...item ,mode: item.mode.toUpperCase(),amount : item.amount})
                //         }
                //     })
                // }
                console.log("checkSplitActive");
                console.log(checkSplitActive);
                
                if (checkSplitActive === 0) {
                    let flexSplitState;
                    let updated;
                    let isPrepaidChosen;

                    await splitPaymentAPI({
                        booking_amount: props.price,
                        paid_amount: checkSplitActive === 0 ? [{ mode: "REWARDS", amount: rewardValue }, { mode: "CASH", amount: 0 }] : undefined
                    }).then(res => {
                        setSplitResponse(res);
                        if (res[0] !== undefined) {
                            const activeModes = Object.entries(res[0]).reduce((map, [key, value]) => {
                                map[key.toLowerCase()] = value;
                                return map;
                            }, {});
                            flexSplitState = splitUpState.map(item => {
                                const matchingSplit = splitState.find(splitItem => splitItem.mode === item.mode);
                                return {
                                    ...item,
                                    ...(matchingSplit ? { amount: matchingSplit.amount } : {}),
                                };
                            });

                            updated = flexSplitState.map((item) => ({
                                ...item,
                                shown: !!activeModes[item.mode.toLowerCase()],
                                amount: activeModes[item.mode.toLowerCase()] ?? 0,
                            }));
                            isPrepaidChosen = splitUpState.filter(e => e.shown).some(e => e.shown && e.mode === "prepaid")
                            let prepaidValue = isPrepaidChosen ? splitUpState.filter(e => e.shown).find(e => e.mode === "prepaid")?.amount : 0;
                            dispatch(updateCalculatedPrice(details.id, isPrepaidChosen ? prepaidValue === 0 ? false : true : false, isPrepaidChosen ? prepaidValue : 0, updated));
                            setSplitUpState(updated)

                        }
                    });
                }
                else {
                    isPrepaidChosen = splitUpState.filter(e => e.shown).some(e => e.shown && e.mode === "prepaid")
                    let prepaidValue = isPrepaidChosen ? splitUpState.filter(e => e.shown).find(e => e.mode === "prepaid")?.amount : 0;
                    const updatedSplitState = splitUpState.map(item =>
                        item.mode.toLowerCase() === "rewards"
                            ? { ...item, shown: true, amount: rewardValue }
                            : item
                    );
                    dispatch(updateCalculatedPrice(details.id, isPrepaidChosen ? prepaidValue === 0 ? false : true : false, isPrepaidChosen ? prepaidValue : 0, updatedSplitState));
                    setSplitUpState(updatedSplitState);
                }
                // }
            }
            splitApi()
        }
    }, [rewardValueToggle])
    
    function onRewardValueChange(value){
        console.log("value");
        console.log(value);
        
        setRewardValue(value);
        setRewardValueToggle(prev => !prev);
    }

    
    
    return <Modal style={styles.paymentModal} visible={props.isVisible} animationType={"slide"}
    // presentationStyle="pageSheet" onRequestClose={props.onCloseModal}
    >
        <Toast ref={toastRef} />

        {
            isSplitPaymentDropdownVisible &&
            <DropdownModal isVisible={isSplitPaymentDropdownVisible}
                onCloseModal={() => {

                    setIsSplitPaymentDropdownVisible(false)
                }}
                dropdownItems={isPrepaidAvailable && isRewardActive ? ["Prepaid", "Cash", "Credit / Debit card", "Digital payment", "Reward Points"]
                    : isPrepaidAvailable && !isRewardActive ? ["Prepaid", "Cash", "Credit / Debit card", "Digital payment", "Reward Points"]
                        : isRewardActive ? ["Cash", "Credit / Debit card", "Digital payment", "Reward Points"]
                            : ["Cash", "Credit / Debit card", "Digital payment"]}
                onChangeValue={(value) => {
                    setAddedSplitPayment(value)
                    if (value === "Reward Points") {
                        setIsRewardModalVisible(true);
                    }
                }} />
        }
        {isCancelSalesModalVisible && <DeleteClient
            isVisible={isCancelSalesModalVisible}
            onCloseModal={() => {
                setIsCancelSalesModalVisible(false)
                // setModalVisibility(false);
                // dispatch(loadClientInfoFromDb(props.id))
            }}
            ActionOptionName={"Cancel Sale"}
            header={"Cancel Sale"}
            content={"If you cancel this sale transaction will not be processed."}
            onCloseClientInfoAfterDeleted={async () => {
                await clearCartAPI();
                dispatch(modifyClientMembershipId({ type: "clear" }))
                dispatch(clearSalesNotes());
                dispatch(clearLocalCart());
                dispatch(clearClientInfo());
                dispatch(clearCalculatedPrice())
            }}
            checkoutScreenToast={() => {
                props.checkoutScreenToast()
            }}
        />}
        {isRewardModalVisible && <RewardPointModal
            isVisible={isRewardModalVisible}
            perPointValue={props.calculatedPrice[0].reward_details.pointValue}
            price={props.price}
            onCloseModal={() => setIsRewardModalVisible(false)}
            setRewardValue={setRewardValue}
            rewardValue={rewardValue}
            setSplitUpState={setSplitUpState}
            onRewardValueChange={onRewardValueChange}
            setSelectedPaymentOption={setSelectedPaymentOption} />
        }
        {
            isOptionsDropdownModalVisible && <DropdownModal isVisible={isOptionsDropdownModalVisible}
                onCloseModal={() => setIsOptionsDropdownModalVisible(false)}
                dropdownItems={["Cancel Sales"]}
                imageWidth={25}
                imageHeight={25}
                primaryViewChildrenStyle={{
                    flexDirection: "row",
                    alignItems: "center"
                }}
                iconImage={[require("../../assets/icons/checkout/actionmenu/cancelsale.png")]}
                onChangeValue={(value) => {
                    if (value === "Cancel Sales") setIsCancelSalesModalVisible(true)
                }} />
        }
        {
            isInvoiceModalVisible && Object.keys(invoiceDetails).length !== 0 && Object.keys(moreInvoiceDetails).length !== 0 ?
                <InvoiceModal data={props.data} isVisible={isInvoiceModalVisible} onCloseModal={() => {

                    setIsInvoiceModalVisible(false);
                    props.onCloseModal();
                }} /> :
                null
        }

        <View
            style={[styles.headingAndCloseContainer, shadowStyling]}>
            <Text style={[textTheme.titleLarge, styles.heading]}>Select Payment</Text>
            <PrimaryButton
                buttonStyle={styles.closeButton}
                onPress={() => {
                    dispatch(updateRewardAmount(0))
                    setSplitUpState(initialSplit);
                    props.onCloseModal()
                }}
            >
                <Ionicons name="close" size={25} color="black" />
            </PrimaryButton>
        </View>
        <ScrollView>
            <View style={styles.modalContent}>
                {isZeroPayment && <View style={styles.zeroPaymentNote}>
                    <View style={styles.zeroPaymentNoteBar} />
                    <Text style={[textTheme.labelLarge, { paddingLeft: 20, padding: 10 }]}>
                        There is no payment required for this sale. you can save it now.
                    </Text>
                </View>}
                <View style={styles.paymentOptionsContainer}>
                    <View style={styles.paymentOptionsRow}>
                        <PrimaryButton
                            disableRipple={isZeroPayment}
                            buttonStyle={[styles.paymentOptionButton, selectedPaymentOption === "cash" ? styles.paymentOptionSelected : {}]}
                            onPress={isZeroPayment ? () => { } : () => {
                                setSelectedPaymentOption("cash")
                            }}
                            pressableStyle={styles.paymentOptionButtonPressable}>
                            {selectedPaymentOption === "cash" ? <View style={styles.tickContainer}>
                                <MaterialCommunityIcons name="checkbox-marked-circle" size={24}
                                    color={Colors.highlight} />
                            </View> : null}
                            <MaterialCommunityIcons name="cash" size={30} color={isZeroPayment ? Colors.grey400 : Colors.green} />
                            <Text>Cash</Text>
                        </PrimaryButton>
                        <PrimaryButton
                            disableRipple={isZeroPayment}
                            buttonStyle={[styles.paymentOptionButton, selectedPaymentOption === "card" ? styles.paymentOptionSelected : {}]}
                            onPress={isZeroPayment ? () => { } : () => {
                                setSelectedPaymentOption("card")
                            }}
                            pressableStyle={styles.paymentOptionButtonPressable}>
                            {selectedPaymentOption === "card" ? <View style={styles.tickContainer}>
                                <MaterialCommunityIcons name="checkbox-marked-circle" size={24}
                                    color={Colors.highlight} />
                            </View> : null}
                            <Ionicons name="card-outline" size={30} color={isZeroPayment ? Colors.grey400 : Colors.green} />
                            <Text>Debit / Credit card</Text>
                        </PrimaryButton>
                    </View>
                    <View style={styles.paymentOptionsRow}>
                        <PrimaryButton
                            disableRipple={isZeroPayment}
                            buttonStyle={[styles.paymentOptionButton, selectedPaymentOption === "digital payments" ? styles.paymentOptionSelected : {}]}
                            onPress={isZeroPayment ? () => { } : () => {
                                setSelectedPaymentOption("digital payments")
                            }}
                            pressableStyle={styles.paymentOptionButtonPressable}>
                            {selectedPaymentOption === "digital payments" ? <View style={styles.tickContainer}>
                                <MaterialCommunityIcons name="checkbox-marked-circle" size={24}
                                    color={Colors.highlight} />
                            </View> : null}
                            <MaterialCommunityIcons name="contactless-payment" size={30} color={isZeroPayment ? Colors.grey400 : Colors.green} />
                            <Text>Digital Payments</Text>
                        </PrimaryButton>
                        <PrimaryButton
                            disableRipple={isZeroPayment}
                            buttonStyle={[styles.paymentOptionButton, selectedPaymentOption === "split_payment" ? styles.paymentOptionSelected : {}]}
                            onPress={isZeroPayment ? () => { } : () => {
                                
                                setSplitUpState(initialSplit)
                                dispatch(updateRewardAmount(0))
                                setSelectedPaymentOption("split_payment")
                            }}
                            pressableStyle={styles.paymentOptionButtonPressable}>
                            {selectedPaymentOption === "split_payment" ? <View style={styles.tickContainer}>
                                <MaterialCommunityIcons name="checkbox-marked-circle" size={24}
                                    color={Colors.highlight} />
                            </View> : null}
                            <MaterialCommunityIcons name="table-split-cell" size={30} color={isZeroPayment ? Colors.grey400 : Colors.green} />
                            <Text>Split Payment</Text>
                        </PrimaryButton>
                    </View>
                    <View style={styles.paymentOptionsRow}>
                        {isRewardActive && <PrimaryButton
                            disableRipple={isZeroPayment}
                            buttonStyle={[
                                styles.paymentOptionRewardButton,
                                isRewardActive && isPrepaidAvailable
                                    ? { flex: 0.5 }
                                    : isRewardActive
                                        ? { flex: 1 }
                                        : {}, // Default to an empty object if no condition is met
                                selectedPaymentOption === "reward points"
                                    ? styles.paymentOptionSelected
                                    : {}
                            ]}

                            onPress={isZeroPayment ? () => { } : () => {
                                dispatch(updateRewardAmount(0));
                                // setSelectedPaymentOption("reward points")
                                setSplitUpState(initialSplit)
                                setIsRewardModalVisible(true)
                            }}
                            pressableStyle={styles.paymentOptionButtonPressable}>
                            {selectedPaymentOption === "reward points" ? <View style={styles.tickContainer}>
                                <MaterialCommunityIcons name="checkbox-marked-circle" size={24}
                                    color={Colors.highlight} />
                            </View> : null}
                            <Image source={require("../../assets/icons/checkout/payment/rewardIcon.png")} style={{ width: 30, height: 30 }} />
                            <Text>Reward Points {fullClientData.rewardPointBalance} </Text>
                        </PrimaryButton>}
                        {(isPrepaidAvailable) &&
                            <PrimaryButton
                                disableRipple={isZeroPayment}
                                buttonStyle={[styles.paymentOptionButton, isRewardActive && isPrepaidAvailable ? { flex: 0.5 } : isPrepaidAvailable ? { flex: 1, marginBottom: 20 } : {}, selectedPaymentOption === "prepaid" ? styles.paymentOptionSelected : {}]}
                                onPress={isZeroPayment ? () => { } : () => {

                                    if (clientInfo.wallet_balance < props.price) {
                                        setSelectedPaymentOption("split_payment")
                                    } else {
                                        setSelectedPaymentOption("prepaid")
                                    }
                                }}
                                pressableStyle={styles.paymentOptionButtonPressable}>
                                {selectedPaymentOption === "prepaid" ? <View style={styles.tickContainer}>
                                    <MaterialCommunityIcons name="checkbox-marked-circle" size={24}
                                        color={Colors.highlight} />
                                </View> : null}
                                <FontAwesome6 name="indian-rupee-sign" size={24} color={isZeroPayment ? Colors.grey400 : Colors.green} />
                                <Text>Prepaid <Text
                                    style={{
                                        color: isZeroPayment ? Colors.grey400 : Colors.highlight,
                                        fontWeight: "bold"
                                    }}>₹ {clientInfo.wallet_balance}</Text>
                                </Text>
                            </PrimaryButton>}
                    </View>
                </View>
                {selectedPaymentOption === "cash" || selectedPaymentOption === null || selectedPaymentOption === "card" || selectedPaymentOption === "digital payments" || selectedPaymentOption === "prepaid" ? <>
                    <CustomTextInput type={"number"} label={"Payment"} value={totalPrice.toString()}
                        readOnly={isZeroPayment}
                        placeholder={"Price"}
                        onChangeText={(price) => {
                            if (price.trim().length === 0) {
                                setTotalPrice(0)
                                return
                            }
                            if (price.split(" ").length > 1) return;
                            if (price.split(".").length > 2) return;

                            setTotalPrice(price.trim());
                        }}
                        onEndEditing={(value) => {
                            if (parseFloat(value) < props.price) {
                                setSelectedPaymentOption("split_payment")
                            }
                            callCashAPI()
                        }}
                    />
                    {selectedPaymentOption === "cash" && splitResponse.length > 0 && splitResponse[0] !== undefined ?
                        <CustomTextInput type={"number"} label={"Change"}
                            value={splitResponse[0].change_to_be_given === undefined ? "" : splitResponse[0].change_to_be_given.toString()}
                            readOnly={true} /> : null}
                </> : null}
                {selectedPaymentOption === "split_payment" ? <View>
                    <FlatList scrollEnabled={false} data={splitUpState} renderItem={({ item, index }) => {
                        // const shownCount = splitUpState.reduce((acc, item) => {
                        //     return item.shown ? acc + 1 : acc;
                        // }, 0);
                        if (item.shown) {
                            return <View style={styles.splitInputAndCloseContainer}>
                                {
                                    // item.name === "Reward Points" ?
                                    //     <View style={[styles.commonContainer, { flex: 1 }]}>
                                    //         {
                                    //             <Text style={[TextTheme.bodyMedium, styles.labelText]}>Reward Points</Text>
                                    //         }
                                    //         <TextInput
                                    //             style={[
                                    //                 TextTheme.bodyLarge,
                                    //                 styles.textInput,
                                    //                 // { borderColor: error ? Colors.error : Colors.grey400 },
                                    //             ]}
                                    //             placeholderTextColor={Colors.grey400}
                                    //             // onBlur={() => handleSave()}
                                    //             // onChangeText={(text) => {
                                    //             //     props.onChangeText(text);
                                    //             //     if (error && props.validator && props.validator(text) === true) {
                                    //             //         setError(false);
                                    //             //         setErrorMessage("");
                                    //             //     }
                                    //             // }}
                                    //             // cursorColor={props.cursorColor}
                                    //             // onFocus={props.onFocus}
                                    //             // secureTextEntry={props.secureTextEntry}
                                    //         />
                                    //         {/* {content}
                                    //         {error && <Text style={[textTheme.bodyMedium, styles.errorText, props.errorStyle]}>{errorMessage}</Text>} */}
                                    //     </View>
                                    // :
                                    <CustomTextInput
                                        onFocus={() => {
                                            if (item.name === "Reward Points") {
                                                setIsRewardModalVisible(true);
                                            }
                                        }}
                                        textInputStyle={isError ? { borderColor: Colors.error } : { borderColor: Colors.green }}
                                        type={"number"} label={item.name} value={item.amount.toString()} flex={1}
                                        readOnly={shownCount === 4 && item.name === paymentOrder.at(-1)}
                                        onChangeText={(text) => {
                                            if (text.split(" ").length > 1) return;
                                            if (text.split(".").length > 2) return;
                                            setSplitUpState(prev => prev.map((split) => {
                                                if (split.mode === item.mode) {
                                                    if (text.trim().at(-1) === ".") {
                                                        return ({
                                                            ...split,
                                                            amount: text.trim()
                                                        })
                                                    } else {
                                                        return ({
                                                            ...split,
                                                            amount: text.trim().length === 0 ? 0 : text
                                                        })
                                                    }
                                                }
                                                return split;
                                            }))
                                            setStopAPI(false);
                                            setRecentlyChanged(prev => {
                                                if (prev.at(-1) === item.mode) return prev
                                                else return [...prev, item.mode]
                                            }
                                            );
                                        }}
                                        onEndEditing={(text) => {
                                            if (item.mode === "prepaid") {
                                                if (parseFloat(text) > clientInfo.wallet_balance) {
                                                    // ToastAndroid.show("Prepaid split amount is greater than the prepaid balance", ToastAndroid.LONG);
                                                    // TODO

                                                    // Toast.show("Prepaid split amount is greater than the prepaid balance", {
                                                    //     duration: Toast.durations.LONG,
                                                    //     position: Toast.positions.BOTTOM,
                                                    //     shadow: false,
                                                    //     backgroundColor: "black",
                                                    //     opacity: 1
                                                    // })
                                                    toastRef.current.show("Prepaid split amount is greater than the prepaid balance", 2000);
                                                    return;
                                                }
                                            }
                                            const totalValue = splitUpState.reduce((acc, ele) => {
                                                if (ele.shown) {
                                                    if (ele.mode === item.mode) return acc + parseFloat(text)
                                                    return acc + ele.amount;
                                                }
                                                return acc;
                                            }, 0)

                                            if (totalValue > props.price) {
                                                setIsError(true);
                                                // ToastAndroid.show("Split Payments are not summing upto transaction total. Please check.", ToastAndroid.SHORT);
                                                // TODO

                                                // Toast.show("Split Payments are not summing upto transaction total. Please check.", {
                                                //     duration: Toast.durations.SHORT,
                                                //     position: Toast.positions.BOTTOM,
                                                //     shadow: false,
                                                //     backgroundColor: "black",
                                                //     opacity: 1
                                                // })
                                                toastRef.current.show("Split Payments are not summing upto transaction total. Please check.", 2000);
                                                return;
                                            } else if (totalValue === props.price) {
                                                setIsError(false);
                                            }

                                            callSplitAPI();
                                        }}
                                    />}
                                <PrimaryButton buttonStyle={styles.splitInputCloseButton} onPress={() => {
                                    if (item.name === "Reward Points") {
                                        dispatch(updateRewardAmount(0));
                                    }
                                    // setPaymentOrder(prev => prev.slice(0, prev.length - 1));
                                    setPaymentOrder(prev => prev.filter((order) => order !== item.mode));
                                    setRecentlyChanged(prev => prev.filter(ele => ele !== item.mode));
                                    setSplitUpState(prev => prev.map((split) => {
                                        if (split.mode === paymentOrder.at(0) && shownCount === 2) {
                                            return ({
                                                ...split,
                                                amount: props.price,
                                            })
                                        }
                                        return split;
                                    }))
                                    // if ((split.mode === paymentOrder.at(0) || split.mode === paymentOrder.at(1)) && shownCount === 3) {
                                    //     if (split.mode === paymentOrder.at(0)){
                                    //         return ({
                                    //             ...split,
                                    //             amount: props.price,
                                    //         })
                                    //     } else if (split.mode === paymentOrder.at(1)){
                                    //         return ({
                                    //             ...split,
                                    //             amount: 0,
                                    //         })
                                    //     }
                                    // }
                                    setSplitUpState(prev => prev.map((split) => {
                                        setShownCount(prev => prev - 1);
                                        if (split.mode === item.mode) {
                                            return ({
                                                ...split,
                                                amount: 0,
                                                shown: false
                                            })
                                        }
                                        return split;
                                    }))


                                }}>
                                    <Ionicons name="close" size={24} color="black" />
                                </PrimaryButton>
                            </View>
                        }
                    }} />
                    {isPrepaidAvailable ? shownCount !== 4 ?
                        <View style={styles.addPaymentButtonContainer}>
                            <PrimaryButton onPress={() => {

                                setIsSplitPaymentDropdownVisible(true)
                            }}
                                buttonStyle={styles.addPaymentButton}
                                pressableStyle={styles.addPaymentButtonPressable}>
                                <Entypo name="plus" size={15} color="black" />
                                <Text style={[textTheme.bodyMedium]}>Add payment method</Text>
                            </PrimaryButton>
                        </View> :
                        null :
                        shownCount !== 4 ?
                            <View style={styles.addPaymentButtonContainer}>
                                <PrimaryButton onPress={() => {

                                    setIsSplitPaymentDropdownVisible(true)
                                }}
                                    buttonStyle={styles.addPaymentButton}
                                    pressableStyle={styles.addPaymentButtonPressable}>
                                    <Entypo name="plus" size={15} color="black" />
                                    <Text style={[textTheme.bodyMedium]}>Add payment method</Text>
                                </PrimaryButton>
                            </View> : null}
                </View> : null}
            </View>
        </ScrollView>
        <Divider />
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom }]}>
            <PrimaryButton buttonStyle={styles.optionButton} onPress={() => {
                setIsOptionsDropdownModalVisible(true)
            }}>
                <Entypo name="dots-three-horizontal" size={24} color="black" />
            </PrimaryButton>
            <PrimaryButton buttonStyle={styles.checkoutButton}
                pressableStyle={[styles.checkoutButtonPressable, isLoading ? {
                    justifyContent: "center",
                    paddingVertical: 0,
                    paddingHorizontal: 0
                } : null]}
                onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    if (!isZeroPayment && selectedPaymentOption === null) {
                        toastRef.current.show("Please select any payment method", 2000);
                        return;
                    }
                    setIsLoading(true);
                    if (isZeroPayment) {
                        await checkoutBookingAPI(details, cartSliceState, undefined, undefined, splitUpState).then(response => {
                            if (response.data === null || response.message === "Something went wrong") {
                                toastRef.current.show(response.other_message, 2000);
                                return;
                            } else {
                                props.setIsInvoiceModalVisible(true);
                                setTimeout(() => {
                                    props.onCloseModal();
                                }, 100)
                            }
                            updateAPI(response.data[0], "NIL", splitUpState, clientInfo);
                            setTimeout(() => {
                                updateLiveStatusAPI(response.data[0].booking_id);
                                dispatch(loadInvoiceDetailsFromDb(response.data[0].booking_id))
                                dispatch(updateBookingId(response.data[0].booking_id));
                                dispatch(loadWalletPriceFromDb(details.id));
                                dispatch(loadBookingDetailsFromDb(response.data[0].booking_id));
                            }, 500);
                        });
                        return;
                    }
                    if (selectedPaymentOption === "prepaid" || (selectedPaymentOption === "split_payment" && splitUpState.some(item => (item.mode === "prepaid" && item.shown)))) {
                        if (selectedPaymentOption === "prepaid") {
                            dispatch(updateCalculatedPrice(details.id, true, props.price, splitUpState));
                            try {
                                await checkoutBookingAPI(details, cartSliceState, true, props.price, splitUpState).then(response => {
                                    if (response.data === null || response.message === "Something went wrong") {
                                        // TODO

                                        // Toast.show({
                                        //     type: ALERT_TYPE.DANGER,
                                        //     title: "Something went wrong",
                                        //     textBody: "Adjust the stock quantity on the products page to make it available for sale",
                                        // autoClose: 1500,
                                        // });
                                        toastRef.current.show("Something went wrong", 2000);
                                        return;
                                    } else {
                                        props.setIsInvoiceModalVisible(true);
                                        setTimeout(() => {
                                            props.onCloseModal();
                                        }, 100)
                                    }

                                    updateAPI(response.data[0], selectedPaymentOption, splitUpState, clientInfo);
                                    setTimeout(() => {
                                        updateLiveStatusAPI(response.data[0].booking_id);
                                        dispatch(loadInvoiceDetailsFromDb(response.data[0].booking_id))
                                        dispatch(updateBookingId(response.data[0].booking_id));
                                        dispatch(loadWalletPriceFromDb(details.id));
                                        dispatch(loadBookingDetailsFromDb(response.data[0].booking_id));
                                    }, 500);
                                });
                            } catch (error) {
                                console.error("An error occurred:", error);
                            }
                        } else if (selectedPaymentOption === "split_payment") {
                            if (splitUpState.some(state => {
                                if (state.mode === "prepaid" && state.shown) {
                                    return state.amount > clientInfo.wallet_balance;
                                }
                                return false;
                            })) {
                                //TODO
                                toastRef.current.show("Entered prepaid value is greater than prepaid balance", 2000);
                                setIsLoading(false);
                                return;
                            }
                            let totalPrice = splitUpState.reduce((acc, item) => {
                                if (item.shown) {
                                    console.log("typeof(item.amount)");
                                    
                                    console.log(typeof(item.amount));
                                    console.log(item.amount);
                                    
                                    return Number(Number(item.amount) + Number(acc));
                                }
                                return Number(acc);
                            }, 0)
                            const price = Math.round(totalPrice * 100) / 100
                            if (price < props.price || price > props.price) {
                                //TODO
                                
                                toastRef.current.show("Split up not summing to the price", 2000);
                                setIsLoading(false)
                                return;
                            }
                            dispatch(updateCalculatedPrice(details.id, true, splitUpState.filter(item => {
                                if (item.mode === "prepaid") return true;
                            })[0].amount
                            ), splitUpState);
                            try {
                                await checkoutBookingAPI(details, cartSliceState, true, splitUpState.filter(item => {
                                    if (item.mode === "prepaid") return true;
                                })[0].amount, splitUpState).then(response => {
                                    if (response.data === null || response.message === "Something went wrong") {
                                        // TODO
                                        toastRef.current.show("Something went wrong", 2000);

                                        // Toast.show({
                                        //     type: ALERT_TYPE.DANGER,
                                        //     title: "Something went wrong",
                                        //     textBody: "Adjust the stock quantity on the products page to make it available for sale",
                                        // autoClose: 1500,
                                        // });
                                        return;
                                    } else {
                                        props.setIsInvoiceModalVisible(true);
                                        setTimeout(() => {
                                            props.onCloseModal();
                                        }, 100)
                                    }

                                    updateAPI(response.data[0], selectedPaymentOption, splitUpState, clientInfo);
                                    setTimeout(() => {
                                        updateLiveStatusAPI(response.data[0].booking_id);
                                        dispatch(loadInvoiceDetailsFromDb(response.data[0].booking_id))
                                        dispatch(updateBookingId(response.data[0].booking_id));
                                        dispatch(loadWalletPriceFromDb(details.id));
                                        dispatch(loadBookingDetailsFromDb(response.data[0].booking_id));
                                    }, 500);
                                });
                            } catch (error) {
                                console.error("An error occurred:", error);
                            }
                        }
                    }
                    try {
                        if (selectedPaymentOption === "split_payment") {
                            // let totalPrice = splitUpState.reduce((acc, item) => {
                            //     if (item.shown) {
                            //         return item.amount + acc;
                            //     }
                            //     return acc;
                            // }, 0)
                            let totalCount = 0;
                            splitUpState.map((prev => {
                                if (prev.shown) {
                                    totalCount += Number(prev.amount);
                                }
                            }))
                            const count = Math.round(totalCount * 100) / 100
                            if (count < props.price || count > props.price) {
                                //TODO
                                toastRef.current.show("Split up not summing to the price", 2000);
                                // Toast.show({
                                //     type: ALERT_TYPE.WARNING,
                                //     title: "The split amounts do not add up to the total price",
                                //     autoClose: 1500,
                                // });
                                setIsLoading(false)
                                return;
                            }
                        }
                        await checkoutBookingAPI(details, cartSliceState, undefined, undefined, splitUpState).then(response => {
                            if (response.data === null || response.message === "Something went wrong") {
                                // TODO

                                // Toast.show({
                                //     type: ALERT_TYPE.DANGER,
                                //     title: "Something went wrong",
                                //     textBody: "Adjust the stock quantity on the products page to make it available for sale",
                                // autoClose: 1500,
                                // });
                                toastRef.current.show(response.other_message, 2000);

                                return;
                            } else {
                                props.setIsInvoiceModalVisible(true);
                                setTimeout(() => {
                                    props.onCloseModal();
                                }, 100)
                            }
                            updateAPI(response.data[0], selectedPaymentOption, splitUpState, clientInfo);
                            setTimeout(() => {
                                updateLiveStatusAPI(response.data[0].booking_id);
                                dispatch(loadInvoiceDetailsFromDb(response.data[0].booking_id))
                                dispatch(updateBookingId(response.data[0].booking_id));
                                dispatch(loadWalletPriceFromDb(details.id));
                                dispatch(loadBookingDetailsFromDb(response.data[0].booking_id));
                            }, 500);
                        });
                    } catch (error) {
                        console.error("An error occurred:", error);
                    }
                    setIsLoading(false);
                }
                }
            >
                {
                    isLoading ?
                        <View style={{ flex: 1 }}>
                            <ThreeDotActionIndicator />
                        </View>
                        :
                        <Text style={[textTheme.titleMedium, styles.checkoutButtonText]}>Total Amount</Text>
                }
                {
                    !isLoading ?
                        <View style={styles.checkoutButtonAmountAndArrowContainer}>
                            {/* <Text style={[textTheme.titleMedium, styles.checkoutButtonText]}>₹ {props.totalPriceToPay ?? 0}</Text> */}
                            <Text style={[textTheme.titleMedium, styles.checkoutButtonText]}>₹ {props.price ?? 0}</Text>
                            <Feather name="arrow-right-circle" size={24} color={Colors.white} />
                        </View> :
                        <></>
                }


            </PrimaryButton>
        </View>
        {/*</AlertNotificationRoot>*/}
    </Modal>
}

const styles = StyleSheet.create({
    paymentModal: {
        flex: 1,
    },
    commonContainer: {
        marginBottom: 15
    },
    labelText: {
        fontWeight: 500,
    },
    textInput: {
        flexDirection: "row",
        alignItems: "center",
        textAlignVertical: "center",
        borderWidth: 1,
        borderRadius: 5,
        paddingRight: 20,
        marginVertical: 5,
        paddingHorizontal: 15,
        paddingVertical: 7,
    },
    headingAndCloseContainer: {
        marginTop: Platform.OS === "ios" ? 50 : 0,
        paddingVertical: 15,
        alignItems: "center",
    },
    heading: {
        fontWeight: 500
    },
    closeButton: {
        position: "absolute",
        right: 0,
        top: 5,
        backgroundColor: Colors.background,
    },
    modalContent: {
        flex: 1,
        padding: 25,
    },
    zeroPaymentNoteBar: {
        position: "absolute",
        backgroundColor: Colors.highlight,
        width: 5,
        left: 0,
        height: "100%",
    },
    zeroPaymentNote: {
        backgroundColor: "#e7e8ff",
        borderRadius: 8,
        overflow: "hidden"
    },
    paymentOptionsContainer: {
        marginTop: 10,
        gap: 15,
        marginBottom: 25,
    }
    ,
    paymentOptionsRow: {
        gap: 15,
        flexDirection: "row",
    }
    ,
    paymentOptionButton: {
        backgroundColor: Colors.background,
        overflow: "visible",
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        flex: 1,
        borderColor: Colors.grey400,
    },
    paymentOptionRewardButton: {
        backgroundColor: Colors.background,
        overflow: "visible",
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
        borderColor: Colors.grey400,
    },
    paymentOptionSelected: {
        borderRadius: 10,
        borderColor: Colors.highlight,
        borderWidth: 2,
    },
    tickContainer: {
        position: "absolute",
        right: -15,
        top: -15,
        zIndex: 10,
    },
    paymentOptionButtonPressable: {
        paddingHorizontal: 0,
        paddingVertical: 20,
    },
    addPaymentButtonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center"
    },
    addPaymentButton: {
        backgroundColor: Colors.grey100,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: Colors.grey400,
        alignSelf: "flex-start"
    },
    addPaymentButtonPressable: {
        paddingVertical: 5,
        paddingHorizontal: 20,
        gap: 5,
        justifyContent: "flex-start",
        flexDirection: "row",
    },
    buttonContainer: {
        flexDirection: "row",
        margin: 10,
        gap: 10,
        padding: 3,
    },
    optionButton: {
        backgroundColor: Colors.transparent,
        borderColor: Colors.grey900,
        borderWidth: 1,
    },
    checkoutButton: {
        flex: 1,
    },
    checkoutButtonPressable: {
        // flex:1,
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "space-between",
        // alignItems:"stretch",
        // alignSelf:"auto",
    },
    checkoutButtonAmountAndArrowContainer: {
        flexDirection: "row",
        gap: 25,
    },
    checkoutButtonText: {
        color: Colors.white
    },
    splitInputAndCloseContainer: {
        gap: 10,
        flexDirection: "row",
    },
    splitInputCloseButton: {
        backgroundColor: Colors.background,
    }
})

export default PaymentModal