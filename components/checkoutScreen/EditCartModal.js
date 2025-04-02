import {Modal, Platform, StyleSheet, Text, ToastAndroid, View} from "react-native";
import textTheme from "../../constants/TextTheme";
import PrimaryButton from "../../ui/PrimaryButton";
import {Ionicons, Feather} from "@expo/vector-icons";
import React, {useEffect, useRef, useState} from "react";
import Colors from "../../constants/Colors";
import MembershipItem from "./MembershipItem";
import CustomTextInput from "../../ui/CustomTextInput";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import getDiscountAPI from "../../apis/checkoutAPIs/getDiscountAPI";
import Divider from "../../ui/Divider";
import {useDispatch, useSelector} from "react-redux";
import {
    addItemToEditedCart, editMembership,
    loadCartFromDB,
    updateCalculatedPrice,
    updateCustomItem,
} from "../../store/cartSlice";
import calculateCartPriceAPI from "../../apis/checkoutAPIs/calculateCartPriceAPI";
import {formatDate} from "../../util/Helpers";
import * as Haptics from "expo-haptics";
import Toast from "../../ui/Toast";
import editQuantityAPI from "../../apis/checkoutAPIs/editQuantityAPI";

const EditCartModal = (props) => {
    const editedCart = useSelector((state) => state.cart.editedCart);
    const editedItem = editedCart.find(item => props.data.item_id === item.item_id) || {};

    const isEdited = props.data.edited;
    const hasDiscountedPrice = props.data.dis !== 0;

    const initialDiscountMode = editedItem.type === "PERCENT" ? "percentage" :
        editedItem.type === "AMOUNT" ? "cash" :
            hasDiscountedPrice ? "cash" : "percentage";

    const initialDiscountValue = isEdited
        ? editedItem.type === "PERCENT"
            ? (props.data.disc_value / props.data.price) * 100
            : props.data.disc_value
        : hasDiscountedPrice
            // ? props.data.price - props.data.discounted_price
            ? props.data.dis
            : 0;

    const initialDiscountAmount = isEdited ? props.data.disc_value : (hasDiscountedPrice ? props.data.price - props.data.discounted_price : 0);

    const [selectedDiscountMode, setSelectedDiscountMode] = useState(initialDiscountMode);
    const [discountValue, setDiscountValue] = useState(initialDiscountValue);
    const [discountAmount, setDiscountAmount] = useState(initialDiscountAmount);
    const [quantity, setQuantity] = useState(props.data.quantity);
    const [price, setPrice] = useState(props.data.price);
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);

    useEffect(() => {
        const api = async () => {
            if (selectedDiscountMode === "percentage") {
                setDiscountAmount(await getDiscountAPI({
                    price: price,
                    disc_percent: discountValue
                }))
            } else {
                setDiscountAmount(parseFloat(discountValue));
            }
        }

        api();
    }, [selectedDiscountMode]);

    const toastRef = useRef(null);

    return <Modal visible={props.isVisible} animationType={"slide"} style={styles.editCartModal}
                  presentationStyle="pageSheet" onRequestClose={props.onCloseModal}>
        <Toast ref={toastRef}/>
        <View style={styles.headingAndCloseContainer}>
            {/*<Text style={[textTheme.titleLarge, styles.heading]}>Edit {props.data.resource_category_name}</Text>*/}
            <Text style={[textTheme.titleLarge, styles.heading]}>Edit Cart Item</Text>
            <PrimaryButton
                buttonStyle={styles.closeButton}
                onPress={props.onCloseModal}
            >
                <Ionicons name="close" size={25} color="black"/>
            </PrimaryButton>
        </View>
        <Divider/>
        <View style={styles.modalContent}>

            <CustomTextInput labelTextStyle={textTheme.titleMedium}
                             type={"number"}
                             label={"Quantity"}
                             onChangeText={async (value) => {
                                 setQuantity(value);
                             }}
                             value={quantity.toString()}/>

            <CustomTextInput labelTextStyle={textTheme.titleMedium} type={"price"} label={"Price"}
                             value={price.toString()}
                             onChangeText={
                                 (value) => {
                                     if (value === "") setPrice(0)
                                     else setPrice(parseFloat(value));
                                 }
                             }

            />
            {props.data.gender === "membership" ? null :
                <>
                    <View style={styles.editDiscountContainer}>
                        <CustomTextInput labelTextStyle={textTheme.titleMedium} flex={1} type={"number"}
                                         label={"Enter discount"}
                                         value={discountValue.toString()}
                                         onChangeText={async (value) => {
                                             setDiscountValue(value)
                                             if (value === "") {
                                                 setDiscountValue(0)
                                                 setDiscountAmount(0)
                                                 return;
                                             } else if (selectedDiscountMode === "percentage" && parseFloat(value) > 100) {
                                                 setDiscountValue(prev => prev);
                                             } else {
                                                 setDiscountValue(parseFloat(value));
                                             }
                                             if (selectedDiscountMode === "cash") {
                                                 setDiscountAmount(parseFloat(value));
                                             }
                                             if (selectedDiscountMode === "percentage") {
                                                 setDiscountAmount(await getDiscountAPI({
                                                     price: price,
                                                     disc_percent: value
                                                 }))
                                             }
                                         }}
                                         onEndEditing={async (value) => {
                                             // if (value === "") {
                                             //     setDiscountValue(0)
                                             //     setDiscountAmount(0)
                                             //     return;
                                             // } else if (selectedDiscountMode === "percentage" && parseFloat(value) > 100) {
                                             //     setDiscountValue(prev => prev);
                                             // } else if (selectedDiscountMode === "cash" && parseFloat(value) > parseFloat(price)) {
                                             //     setDiscountValue(prev => prev);
                                             //     return;
                                             // } else {
                                             //     setDiscountValue(parseFloat(value));
                                             // }
                                             // if (selectedDiscountMode === "cash") {
                                             //     setDiscountAmount(parseFloat(value));
                                             // }
                                             // if (selectedDiscountMode === "percentage") {
                                             //     setDiscountAmount(await getDiscountAPI({
                                             //         price: price,
                                             //         disc_percent: discountValue
                                             //     }))
                                             // }
                                         }}
                        />
                        <PrimaryButton
                            onPress={() => {
                                setSelectedDiscountMode("percentage")
                            }}
                            buttonStyle={[styles.percentAndAmountButton, selectedDiscountMode === "percentage" ? {backgroundColor: Colors.highlight} : {}, {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                                marginLeft: 10
                            }]} pressableStyle={styles.percentAndAmountPressable}>
                            <Feather name="percent" size={20}
                                     color={selectedDiscountMode === "percentage" ? Colors.white : Colors.black}/>
                        </PrimaryButton>
                        <PrimaryButton
                            onPress={() => {
                                setSelectedDiscountMode("cash")
                            }}
                            buttonStyle={[styles.percentAndAmountButton, selectedDiscountMode === "cash" ? {backgroundColor: Colors.highlight} : {}, {
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0
                            }]} pressableStyle={styles.percentAndAmountPressable}>
                            <MaterialIcons name="currency-rupee" size={20}
                                           color={selectedDiscountMode === "cash" ? Colors.white : Colors.black}/>
                        </PrimaryButton>
                    </View>
                    <CustomTextInput labelTextStyle={textTheme.titleMedium} type={"price"} label={"Discount amount"}
                                     value={discountAmount.toString()}
                                     readOnly={true}/>
                </>}
        </View>
        <Divider/>
        <View style={styles.addToCartButtonContainer}>
            <PrimaryButton buttonStyle={{
                flex: 1,
                backgroundColor: Colors.transparent,
                borderWidth: 1,
                borderColor: Colors.grey300,
            }} textStyle={{color: Colors.black}} onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }} label={"Cancel"}/>
            <PrimaryButton buttonStyle={{flex: 1}} onPress={async () => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                if (discountAmount >= price) {
                    toastRef.current.show("Discount should not be equal or greater than price", 2000);
                    // ToastAndroid.show("Discount should not be equal or greater than price", ToastAndroid.SHORT);
                    return;
                }
                if (price !== parseFloat(props.data.price) || discountAmount !== props.data.dicounted_amount) {
                    if (props.data.gender === "Women" || props.data.gender === "Men" || props.data.gender === "Kids" || props.data.gender === "General") {
                        if (quantity !== 1) {
                            let res = await editQuantityAPI({
                                cartId: props.data.item_id,
                                quantity: parseInt(quantity),
                                resource_category: props.data.resource_category_id
                            })
                            dispatch(await addItemToEditedCart({
                                ...props.data,
                                amount: res.data.data[0].price,
                                total_price: res.data.data[0].price,
                                price: res.data.data[0].price,
                                bonus_value: 0,
                                disc_value: discountAmount,
                                itemId: props.data.item_id,
                                item_id: props.data.item_id,
                                membership_id: props.data.membership_id,
                                res_cat_id: props.data.resource_category_id,
                                resource_id: props.data.resource_id,
                                type: selectedDiscountMode === "cash" ? "AMOUNT" : "PERCENT",
                                valid_from: "",
                                valid_till: "",
                                wallet_amount: props.data.wallet_amount,
                                edited: true,
                                quantity: parseInt(quantity)
                            }))
                        } else {
                            dispatch(await addItemToEditedCart({
                                ...props.data,
                                amount: price,
                                total_price: price,
                                price: price,
                                bonus_value: 0,
                                disc_value: discountAmount,
                                itemId: props.data.item_id,
                                item_id: props.data.item_id,
                                membership_id: props.data.membership_id,
                                res_cat_id: props.data.resource_category_id,
                                resource_id: props.data.resource_id,
                                type: selectedDiscountMode === "cash" ? "AMOUNT" : "PERCENT",
                                valid_from: "",
                                valid_till: "",
                                wallet_amount: props.data.wallet_amount,
                                edited: true,
                                quantity: parseInt(quantity)
                            }))
                        }
                    } else if (props.data.gender === "Products") {
                        dispatch(await addItemToEditedCart({
                            ...props.data,
                            amount: price,
                            bonus_value: 0,
                            disc_value: discountAmount,
                            itemId: props.data.item_id,
                            item_id: props.data.item_id,
                            membership_id: 0,
                            product_id: props.data.product_id,
                            resource_id: props.data.resource_id,
                            type: selectedDiscountMode === "cash" ? "AMOUNT" : "PERCENT",
                            total_price: price,
                            price: price,
                            res_cat_id: props.data.resource_category_id,
                            valid_from: "",
                            valid_till: "",
                            wallet_amount: props.data.wallet_amount,
                            edited: true,
                            quantity: parseInt(quantity)

                        }))
                    } else if (props.data.gender === "membership") {
                        const date = new Date(Date.now()).setHours(0, 0, 0, 0)
                        const validFromDate = date;
                        const validUntilDate = date + (props.data.duration * 24 * 60 * 60 * 1000)
                        await dispatch(editMembership({
                            id: props.data.id === undefined ? props.data.membership_id : props.data.id,
                            data: {
                                amount: price,
                                price: price,
                                total_price: price,
                                bonus_value: 0,
                                disc_value: discountAmount,
                                type: "AMOUNT",
                                id: props.data.membership_id,
                                res_cat_id: props.data.resource_category_id,
                                valid_from: props.data.valid_from === undefined ? formatDate(validFromDate, "yyyy-mm-dd") : props.data.valid_from,
                                valid_until: props.data.valid_until === undefined ? formatDate(validUntilDate, "yyyy-mm-dd") : props.data.valid_until,
                            }
                        }))
                        // await dispatch(loadCartFromDB());
                    }
                    dispatch(updateCalculatedPrice());
                    props.onCloseModal()
                } else {
                    props.onCloseModal()
                }
            }} label={"Save"}/>
        </View>
    </Modal>
}

const styles = StyleSheet.create({
    editCartModal: {
        flex: 1,
    }
    ,
    headingAndCloseContainer: {
        paddingHorizontal:
            20,
        paddingVertical:
            15,
    }
    ,
    heading: {
        // textAlign: "center",
        fontWeight:
            500
    },
    closeButton: {
        position: "absolute",
        right:
            0,
        top:
            5,
        backgroundColor:
        Colors.background,
    }
    ,
    modalContent: {
        flex: 1,
        padding:
            30,
    }
    ,
    editDiscountContainer: {
        flexDirection: "row",
        alignItems:
            "center",
        alignContent:
            "center",
        // alignSelf:"center",
    }
    ,
    percentAndAmountButton: {
        marginTop: 10,
        borderColor:
        Colors.grey400,
        borderWidth:
            1,
        backgroundColor:
        Colors.background,
        alignSelf:
            "center",
    }
    ,
    percentAndAmountPressable: {}
    ,
    addToCartButtonContainer: {
        flexDirection: "row",
        gap: 20,
        marginHorizontal: 30,
        marginTop:
            20,
        marginBottom:
            20,
    }
});

export default EditCartModal;