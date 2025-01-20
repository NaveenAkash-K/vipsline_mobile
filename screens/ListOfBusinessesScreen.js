import {View, Text, StyleSheet, Platform, ScrollView, FlatList, RefreshControl} from 'react-native';
import textTheme from "../constants/TextTheme";
import Colors from "../constants/Colors";
import Divider from "../ui/Divider";
import BusinessCard from "../components/listOfBusinessesScreen/BusinessCard";
import {useDispatch, useSelector} from "react-redux";
import {updateBusinessId, updateInBusiness} from "../store/authSlice";
import {
    loadBusinessesListFromDb,
    updateIsBusinessSelected,
    updateSelectedBusinessDetails
} from "../store/listOfBusinessSlice";
import {useCallback, useRef, useState} from "react";
import {resetClientFilter, resetMaxEntry} from "../store/clientFilterSlice";
import * as SecureStore from 'expo-secure-store';
import {useFocusEffect} from "@react-navigation/native";
import {clearClientInfo} from "../store/clientInfoSlice";
import clearCartAPI from "../apis/checkoutAPIs/clearCartAPI";
import {
    clearCalculatedPrice,
    clearLocalCart,
    clearSalesNotes,
    modifyClientMembershipId
} from "../store/cartSlice";
import * as Haptics from "expo-haptics";
import {useLocationContext} from '../context/LocationContext';
import Toast from "../ui/Toast";
import BottomActionCard from "../ui/BottomActionCard";


export default function ListOfBusinessesScreen({navigation}) {
    const listOfBusinesses = useSelector(state => state.businesses.listOfBusinesses);
    const details = useSelector(state => state.loginUser.details);
    const dispatch = useDispatch();
    const {getLocation, currentLocation, reload, setReload} = useLocationContext();
    const toastRef = useRef();

    const [refreshing, setRefreshing] = useState(false)


    useFocusEffect(useCallback(() => {
        getLocation("List of Business");
    }, []))

    // useLayoutEffect(() => {
    // dispatch(loadServicesDataFromDb("women"));
    // dispatch(loadServicesDataFromDb("men"));
    // dispatch(loadServicesDataFromDb("kids"));
    // dispatch(loadServicesDataFromDb("general"));
    // dispatch(loadProductsDataFromDb());
    // dispatch(loadPackagesDataFromDb());
    // dispatch(loadMembershipsDataFromDb());
    // dispatch(loadClientsFromDb());
    // dispatch(loadClientCountFromDb());
    // dispatch(loadClientFiltersFromDb(10, "All"));
    // dispatch(clearClientInfo());
    // dispatch(clearCustomItems());
    // console.log("List Of Business");
    // dispatch(clearLocalCart());
    // clearCartAPI();
    // dispatch(loadBusinessesListFromDb());
    // dispatch(loadLoginUserDetailsFromDb());
    // }, []);


    // useFocusEffect(
    //     useCallback(() => {
    //         // Function to execute whenever the drawer screen is opened
    //         dispatch(clearClientsList());
    //
    //         // Optional cleanup function when screen is unfocused
    //         return () => {
    //             dispatch(loadClientsFromDb());
    //         };
    //     }, [])
    // );

    async function authToken() {

        let businessId = ""
        try {
            // const value = await AsyncStorage.getItem('businessId');
            const value = await SecureStore.getItemAsync('businessId');
            if (value !== null) {
                businessId = value;
            }
        } catch (e) {
        }

    }

    const storeData = async (value) => {
        try {
            // await AsyncStorage.setItem('businessId', value);
            await SecureStore.setItemAsync('businessId', value);
        } catch (e) {
        }
    };

    function renderItem(itemData) {
        return (
            <BusinessCard
                name={itemData.item.name}
                area={itemData.item.area}
                address={itemData.item.address}
                imageURL={itemData.item.photo}
                status={itemData.item.verificationStatus}
                onPress={async () => {
                    Haptics.selectionAsync()
                    dispatch(updateInBusiness(true));
                    await storeData(itemData.item.id);
                    dispatch(updateBusinessId(itemData.item.id));
                    dispatch(updateIsBusinessSelected(true));
                    dispatch(updateSelectedBusinessDetails(itemData.item));
                    await dispatch(resetClientFilter());
                    dispatch(resetMaxEntry());
                    navigation.navigate("Checkout");
                }}
                listOfBusinessToast={listOfBusinessToast}
            />
        );
    }

    function listOfBusinessToast(message, duration) {
        toastRef.current.show(message, duration);
    }

    const token = useSelector(state => state.authDetails.authToken);
    const id = useSelector(state => state.authDetails.businessId);
    const cartItems = useSelector(state => state.cart.items);
    const [isDelete, setIsDelete] = useState(false);
    return (
        cartItems.length === 0 ?
            <View style={{flex: 1}}>

                <Toast ref={toastRef}/>
                <ScrollView
                    style={styles.listOfBusinesses}
                    contentContainerStyle={{alignItems: "center"}}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                                onRefresh={() => {
                                    setRefreshing(true);
                                    dispatch(loadBusinessesListFromDb());
                                    setTimeout(() => {
                                        setRefreshing(false)
                                    }, 1000)
                                }}
                        />
                    }



                >

                    <Divider/>
                    <View style={styles.body}>
                        <Text style={[textTheme.titleMedium]}>
                            Hi, {details.name}!
                        </Text>
                        <Text style={[textTheme.bodyMedium, styles.descriptionText]}>
                            You are a part of the following business. Go to the business which you wish to access now
                        </Text>

                        <FlatList
                            data={listOfBusinesses}
                            renderItem={renderItem}
                            style={styles.listStyle}
                            scrollEnabled={false}
                            contentContainerStyle={{gap: 16, borderRadius: 8, overflow: 'hidden'}}

                        />
                    </View>

                </ScrollView>
            </View>
            : <BottomActionCard isVisible={isDelete}
                                header={"Cancel Sale"}
                                content={"If you cancel this sale transaction will not be processed. Do you wish to exit?"}
                                onClose={() => {
                                    setIsDelete(false);
                                }}
                                onConfirm={async () => {
                                    await clearCartAPI();
                                    dispatch(modifyClientMembershipId({type: "clear"}));
                                    clearSalesNotes();
                                    dispatch(clearLocalCart());
                                    dispatch(clearClientInfo());
                                    dispatch(clearCalculatedPrice());
                                    setTimeout(() => {
                                        // navigation.navigate("Checkout", { screen: "CheckoutScreen" });
                                        setReload(false);
                                        navigation.navigate(currentLocation);
                                    }, 10);
                                    setIsDelete(false);
                                }}
                                onCancel={() => {
                                    setIsDelete(false)
                                }}
                                confirmLabel={"Cancel Sale"}
                                cancelLabel={"Close"}/>
    );
}


const styles = StyleSheet.create({
    listOfBusinesses: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    header: {
        marginVertical: 16,

    },
    body: {
        width: "90%",
        marginTop: 16,
        marginBottom: 32
    },
    descriptionText: {
        marginTop: 16,
        color: Colors.grey650,
    },
    listStyle: {
        marginTop: 32,
    }

})