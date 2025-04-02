import {View, StyleSheet, Text, TextInput, ScrollView, Platform} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React, {useEffect, useState} from "react";
import Divider from "../../ui/Divider";
import TextTheme from "../../constants/TextTheme";
import Colors from "../../constants/Colors";
import {Feather} from '@expo/vector-icons';
import PrimaryButton from "../../ui/PrimaryButton";
import textTheme from "../../constants/TextTheme";
import {MaterialIcons} from '@expo/vector-icons';
import {useDispatch, useSelector} from "react-redux";
import {
    deleteItemFromCart,
    removeCustomItems,
    removeItemFromCart,
    removeItemFromEditedCart, updateEditedCart,
    updateLoadingState, updateStaffInEditedCart, updateStaffInCustomItemsCart,
    modifyPrepaidDetails, removeMembershipFromEditedCart, updateCalculatedPrice
} from "../../store/cartSlice";
import DropdownModal from "../../ui/DropdownModal";
import {updateCartItemStaff} from "../../store/staffSlice";
import EditCartModal from "./EditCartModal";
import PrepaidModal from "./PrepaidModal";
import AddCustomItemModal from "./AddCustomItemModal";
import PackageModal from "./PackageModal";
import {clientSlice} from "../../store/clientSlice";
import * as Haptics from "expo-haptics";
import EditMembershipModal from "./EditMembershipModal";
import {formatNumber} from "../../util/Helpers";

const CartItem = (props) => {
    const dispatch = useDispatch();
    const isLoading = useSelector(state => state.cart.isLoading);
    const [isEditCartModalVisible, setIsEditCartModalVisible] = useState(false);
    const [isEditPrepaidModalVisible, setIsEditPrepaidModalVisible] = useState(false);
    const [isEditCustomItemModalVisible, setIsEditCustomItemModalVisible] = useState(false);
    const [isEditMembershipModalVisible, setIsEditMembershipModalVisible] = useState(false);
    const [isEditPackageModalVisible, setIsEditPackageModalVisible] = useState(false);
    const editedCart = useSelector(state => state.cart.editedCart);
    const prepaidDetails = useSelector(state => state.cart.prepaid_wallet)
    // const [discountSymbol, setDiscountSymbol] = useState(editedData ? editedData.type === "PERCENT" ? "%" : "₹" : "₹");
    const discountSymbol= "₹";
    let editedData;

    if (props.data.gender === "membership") {
        editedData = editedCart.filter(item => item.id === props.data.membership_id)[0];
    } else {
        editedData = editedCart.filter(item => item.item_id === props.data.item_id)[0];
    }
    // const edited = editedData.some(item => props.data.item_id === item.item_id);

    const removeItemHandler = async () => {
        if (isLoading) return;
        dispatch(updateLoadingState(true));
        dispatch(await removeItemFromCart(props.data.item_id)).then((res) => {
            dispatch(updateLoadingState(false));
        })
        // dispatch(await removeItemFromCart(props.data.item_id))
    }

    const [isStaffDropdownModalVisible, setIsStaffDropdownModalVisible] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(props.data.resource_id !== null ? props.staffs.filter((staff) => staff.id === props.data.resource_id)[0] : null);

    // console.log(editedData)
    // useEffect(() => {
    //     setSelectedStaff(props.data.resource_id !== null ? props.staffs.filter((staff) => staff.id === props.data.resource_id)[0] : null);
    // }, [props.data]);

    // useEffect(() => {
    //     setDiscountSymbol(editedData ? editedData.type === "PERCENT" ? "%" : "₹" : "₹");
    // }, [editedCart]);

    const styles = StyleSheet.create({
        scrollView: {
            flex: 1,
        },
        cartItem: {
            // flex: 1,
            marginVertical: 10,
            marginHorizontal: 20,
        },
        itemNameAndDetailsContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        },
        itemNameText: {
            maxWidth: "50%",
        },
        itemDetailsContainer: {
            alignItems: "center",
            flexDirection: "row",
        },
        itemQuantityText: {
            fontWeight: "900",
            marginRight: 10,
        },
        amountContainer: {
            flexDirection: "row",
            borderWidth: 1,
            borderColor: Colors.grey400,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
        },
        currencySymbol: {
            paddingRight: 5,
            paddingLeft: 10,
            paddingVertical: 5,
            borderLeftColor: Colors.transparent,
            borderTopColor: Colors.transparent,
            borderBottomColor: Colors.transparent,
            borderRightColor: Colors.grey400,
            borderWidth: 1,
            fontWeight: "500",
        },
        iosCurrencySymbol: {
            borderColor: Colors.transparent,
            paddingRight: 5,
            paddingLeft: 10,
            paddingVertical: 5,
            borderWidth: 1,
            fontWeight: "500",
        },
        amountText: {
            maxWidth: 100,
            fontWeight: "500",
            color: Colors.black,
            marginRight: 6,
            marginLeft: 10,
            marginVertical: 0,
        },
        editAmountButton: {
            backgroundColor: Colors.transparent,
        },
        editAmountPressable: {
            paddingHorizontal: 5,
            paddingVertical: 10,
        },
        editAmountIcon: {
            paddingHorizontal: 5,
            color: Colors.grey600
        },
        closeIconButton: {
            backgroundColor: Colors.transparent,
            marginRight: -15,
            marginLeft: 5,
        },
        closeIconPressable: {
            paddingHorizontal: 5,
            paddingVertical: 5,
        },
        staffAndDiscountContainer: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center"
        },
        discountText: {
            color: Colors.button,
            fontWeight: "bold",
            // alignSelf: "flex-end",
            // marginHorizontal: 55,
            // marginTop: 3,
        },
        staffButton: {
            // alignSelf: "flex-start",
            borderBottomWidth: 1,
            borderBottomColor: Colors.grey600,
            backgroundColor: Colors.transparent,
            padding: 0,
        },
        staffPressable: {
            padding: 0,
            margin: 0,
        },
        staffText: {
            color: selectedStaff === null ? Colors.error : Colors.highlight,
        },
        staffContainer: {
            flexDirection: "row",
            alignItems: "center",
        }
    });

    // console.log(originalProductItem)
    // console.log(useSelector(state => state.catalogue.products.items))

    return <>
        <View style={styles.cartItem}>
            {isEditMembershipModalVisible && <EditMembershipModal edited={true}
                                                                  data={props.data}
                                                                  isVisible={isEditMembershipModalVisible}
                                                                  onCloseModal={() => {
                                                                      setIsEditMembershipModalVisible(false);
                                                                  }}
            />}
            {isEditPrepaidModalVisible && <PrepaidModal edited={true}
                                                        data={props.data}
                                                        isVisible={isEditPrepaidModalVisible}
                                                        onCloseModal={() => {

                                                            setIsEditPrepaidModalVisible(false)
                                                        }}/>}
            {isEditCartModalVisible && <EditCartModal isVisible={isEditCartModalVisible}
                                                      onCloseModal={() => {

                                                          setIsEditCartModalVisible(false)
                                                      }}
                                                      data={{
                                                          ...props.data, ...editedData,
                                                          dis: props.data.gender === "Women" || props.data.gender === "Men" || props.data.gender === "Kids" || props.data.gender === "General"
                                                              ? props.data.service_discount !== 0
                                                                  ? props.data.service_discount
                                                                  : 0
                                                              : props.data.gender === "Products"
                                                                  ? props.data.service_discount !== 0
                                                                      ? props.data.service_discount
                                                                      : 0
                                                                  : 0
                                                      }}/>}
            {isEditCustomItemModalVisible && <AddCustomItemModal edited={true}
                                                                 isVisible={isEditCustomItemModalVisible}
                                                                 data={props.data}
                                                                 onCloseModal={() => {

                                                                     setIsEditCustomItemModalVisible(false)
                                                                 }}/>}
            {isEditPackageModalVisible && <PackageModal edited={true}
                                                        isVisible={isEditPackageModalVisible}
                                                        onCloseModal={() => {

                                                            setIsEditPackageModalVisible(false)
                                                        }}
                                                        data={props.data}/>}

            <DropdownModal isVisible={isStaffDropdownModalVisible}
                           onCloseModal={() => setIsStaffDropdownModalVisible(false)}
                           dropdownItems={props.staffs}
                           object={true}
                           objectName={"name"}
                           selectedValue={selectedStaff}
                           onChangeValue={(value) => {
                               dispatch(updateCartItemStaff([{item_id: props.data.item_id, resource_id: value.id}]));
                               if (props.data.gender === "custom_item") {
                                   dispatch(updateStaffInCustomItemsCart({
                                       itemId: props.data.item_id,
                                       resource_id: value.id
                                   }));
                               } else if (props.data.gender === "prepaid") {
                                   dispatch(modifyPrepaidDetails({type: "updateResourceId", payload: value.id}));
                               } else {
                                   dispatch(updateStaffInEditedCart({
                                       itemId: props.data.item_id,
                                       resource_id: value.id
                                   }));
                               }
                               setSelectedStaff(value)
                           }}/>
            <View style={styles.itemNameAndDetailsContainer}>
                {props.data.gender === "prepaid" ? <Text
                    style={[TextTheme.bodyLarge, styles.itemNameText]}>Prepaid value
                    ₹{parseFloat(prepaidDetails[0].bonus_value) + parseFloat(prepaidDetails[0].wallet_amount)}</Text> : <Text
                    style={[TextTheme.bodyLarge, styles.itemNameText]}>{props.data.resource_category_name === null ? props.data.name : props.data.resource_category_name}</Text>}

                <View style={styles.itemDetailsContainer}>
                    <Text style={[TextTheme.labelLarge, styles.itemQuantityText]}>{editedData ? editedData.quantity : props.data.quantity}x</Text>
                    <View style={styles.amountContainer}>
                        <Text
                            style={Platform.OS === "ios" ? [TextTheme.bodyLarge, styles.iosCurrencySymbol] : [TextTheme.bodyLarge, styles.currencySymbol]}>₹</Text>
                        {/*<Text style={[TextTheme.bodyLarge, styles.amountText]}>{props.data.total_price}</Text>*/}
                        <Text
                            style={[TextTheme.bodyLarge, styles.amountText]}>{editedData ? editedData.price : props.data.price}</Text>
                        {(props.data.gender === "packages" && props.data.package_name !== "") ? null :
                            <PrimaryButton onPress={() => {
                                if (props.data.gender === "prepaid") {
                                    setIsEditPrepaidModalVisible(true)
                                } else if (props.data.gender === "custom_item") {
                                    setIsEditCustomItemModalVisible(true);
                                } else if (props.data.gender === "packages") {
                                    setIsEditPackageModalVisible(true);
                                } else if(props.data.gender === "membership"){
                                    setIsEditMembershipModalVisible(true);
                                } else {
                                    setIsEditCartModalVisible(true)
                                }
                            }}
                                           buttonStyle={styles.editAmountButton}
                                           pressableStyle={styles.editAmountPressable}>
                                <Feather style={styles.editAmountIcon} name="edit-2" size={15} color="black"/>
                                {/*<Feather  name="edit" size={22} color="black"/>*/}
                            </PrimaryButton>}
                    </View>
                    <PrimaryButton buttonStyle={styles.closeIconButton} pressableStyle={styles.closeIconPressable}
                                   onPress={
                                       async () => {
                                           if (props.data.gender === "prepaid" && props.data) {
                                               dispatch(await removeItemFromCart(props.data.item_id)).then((res) => {
                                                   dispatch(updateLoadingState(false));
                                                   dispatch(removeItemFromEditedCart(props.data.item_id))
                                                   dispatch(modifyPrepaidDetails({type: "clear"}));
                                               })
                                           } else if (props.data.gender === "custom_item") {
                                               dispatch(removeCustomItems(props.data.id))
                                               dispatch(updateCalculatedPrice());
                                           } else if (props.data.gender === "membership") {
                                               removeItemHandler()
                                               dispatch(removeMembershipFromEditedCart(props.data.membership_id))
                                           } else
                                               removeItemHandler()
                                       }}>
                        <Ionicons name="close" size={24} color="black"/>
                    </PrimaryButton>
                </View>
            </View>
            <View style={styles.staffAndDiscountContainer}>
                <PrimaryButton buttonStyle={styles.staffButton} pressableStyle={styles.staffPressable}
                               onPress={() => {

                                   setIsStaffDropdownModalVisible(true)
                               }}>
                    <View style={styles.staffContainer}>
                        <Text
                            style={[textTheme.bodyMedium, styles.staffText]}>{selectedStaff !== null ? selectedStaff.name : "Select Staff"}</Text>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color="black"/>
                    </View>
                </PrimaryButton>
                <Text style={[textTheme.labelLarge, styles.discountText]}>
                    {editedData
                        ? editedData.gender === "membership" || editedData.gender === "prepaid"
                            ? ""
                            : (editedData.disc_value !== 0
                                ? `Discount ${discountSymbol}${formatNumber(editedData.disc_value)}`
                                : "")
                        : (props.data.price - props.data.discounted_price !== 0 &&
                            props.data.gender !== "custom_item" &&
                            props.data.gender !== "prepaid" &&
                            props.data.gender === "packages")
                            ? props.data.price - props.data.total_price === 0
                                ? ""
                                : `Discount ${discountSymbol}${formatNumber(props.data.price - props.data.total_price)}`
                            : props.data.gender === "Women" || props.data.gender === "Men" || props.data.gender === "Kids" || props.data.gender === "General"
                                ? (props.data.service_discount !== 0)
                                    ? `Discount ${discountSymbol}${formatNumber(props.data.service_discount)}`
                                    : ""
                                : props.data.gender === "Products"
                                    ? props.data.service_discount !== 0
                                        ? `Discount ${discountSymbol}${formatNumber(props.data.service_discount)}`
                                        : ""
                                    : ""
                    }
                </Text>


            </View>
        </View>
        <Divider/>

    </>
}


export default CartItem;