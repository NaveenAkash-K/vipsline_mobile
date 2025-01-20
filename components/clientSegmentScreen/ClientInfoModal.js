import {Modal, Text, View, StyleSheet, ScrollView, Platform, Linking, Image} from "react-native";
import textTheme from "../../constants/TextTheme";
import PrimaryButton from "../../ui/PrimaryButton";
import {AntDesign, Feather, Ionicons} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import ClientCard from "./ClientCard";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import ClientSaleInfo from "./ClientSalesInfo";
import ClientInfoCategories from "./ClientInfoCategories";
import React, {useEffect, useRef, useState} from "react";
import Divider from "../../ui/Divider";
import ClientStatistics from "./ClientStatistics";
import ClientDetails from "./ClientDetails";
import MoreOptionDropDownModal from "./MoreOptionDropDownModal";
import UpdateClientModal from "./UpdateClientModal";
import {useDispatch, useSelector} from "react-redux";
import {checkNullUndefined, dateFormatter} from "../../util/Helpers";
import {clearClientInfo, loadClientInfoFromDb, resetRewardPageNo, updateCustomerRewards, updateRewardsPointBalance} from "../../store/clientInfoSlice";
import {loadClientFiltersFromDb, loadSearchClientFiltersFromDb} from "../../store/clientFilterSlice";
import ContentLoader from "../../ui/ContentLoader";
import {loadClientCountFromDb, loadClientsFromDb} from "../../store/clientSlice";
import Toast from "../../ui/Toast";
import BillingActivity from "./BillingActivity";
import Appointments from "./Appointments";
import {MembershipDetails} from "./MembershipDetails";
import {PackageDetails} from "./PackageDetails";
import {PrepaidDetails} from "./PrepaidDetails";
import ClientRewardPoints from "./ClientRewardPoints";
import clearCartAPI from "../../apis/checkoutAPIs/clearCartAPI";
import {clearCalculatedPrice, clearLocalCart, clearSalesNotes, modifyClientMembershipId} from "../../store/cartSlice";
import BottomActionCard from "../../ui/BottomActionCard";
import deleteClientAPI from "../../apis/ClientSegmentAPIs/deleteClientAPI";

/**
 * ClientInfoModal Component
 *
 * This component is a modal that displays detailed information about a client.
 * It includes options to view and manage client details, such as viewing statistics,
 * editing, or deleting the client. The modal dynamically updates its content based
 * on the selected category (e.g., client details, bill activity, appointments, etc.).
 *
 * Props:
 * @param {boolean} visible - Controls the visibility of the modal.
 * @param {Function} closeModal - Function to close the modal.
 * @param {string} name - The name of the client.
 * @param {string} id - The ID of the client.
 * @param {Function} setVisible - Function to control the visibility state of the modal.
 * @param {Function} setSearchQuery - Function to set the search query for clients.
 * @param {Function} setFilterPressed - Function to set the active filter.
 */



const getCategoryTitle =
    {
        "clientDetails": "Client details",
        "billActivity": "Bill activity",
        "appointments": "Appointments",
        "memberships": "Memberships",
        "packageSales": "Package sales",
        "prepaidSales": "Prepaid sales",
        "rewardpoints": "Reward Points",
        // "review": "Review",
        // "giftVoucher": "Gift Voucher",
        "seeMoreStats": "Statistics"
    }


export default function clientInfoModal(props) {

    const dispatch = useDispatch();

    const analyticDetails = useSelector(state => state.clientInfo.analyticDetails || {});
    const details = useSelector(state => state.clientInfo.details) || {};
    const salesData = useSelector(state => state.clientInfo.analyticDetails || {});
    const membershipData = useSelector(state => state.clientInfo.membershipList || {});
    const packageData = useSelector(state => state.clientInfo.packageList || {});
    const currentClientId = useSelector(state => state.clientInfo.clientId);


    const [totalSales, setTotalSales] = useState("");
    const [lastVisit, setLastVisit] = useState("");
    const [completedAppointments, setCompletedAppointment] = useState(0);
    const [cancelledAppointments, setCancelledAppointment] = useState(0);
    const [feedbackCount, setFeedbackCount] = useState(0);
    const [noShows, setNoShows] = useState(0);
    const [totalVisits, setTotalVisits] = useState(0);
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");

    const toastRef = useRef(null)

    useEffect(() => {
        setTotalSales(analyticDetails.total_sales === undefined ? "" : analyticDetails.total_sales);
        setLastVisit(
            analyticDetails.history_appointmentList !== undefined && analyticDetails.history_appointmentList.length !== undefined ?
                analyticDetails.history_appointmentList.length !== 0 ?
                    dateFormatter(analyticDetails.history_appointmentList[0].appointment_date, 'short') :
                    "" : "");
        setCompletedAppointment(analyticDetails.completed_appointments === undefined ? "" : analyticDetails.completed_appointments);
        setCancelledAppointment(analyticDetails.cancelled_appointments === undefined ? "" : analyticDetails.cancelled_appointments);
        setFeedbackCount(analyticDetails.feedbacks);
        setNoShows(0);
        setTotalVisits(analyticDetails.total_visits === undefined ? "" : analyticDetails.total_visits);
        setName(details.name);
        setPhone(details.mobile_1);

    }, [analyticDetails, details]);



    const [clientMoreDetails, setClientMoreDetails] = useState(null);
    // const [selectedOption, setSelectedOption] = useState("");

    // const [modalVisibility, setModalVisibility] = useState(false)

    const [editClientModalVisibility, setEditClientModalVisibility] = useState(false);
    const [deleteClientModalVisibility, setDeleteClientModalVisibility] = useState(false);

    useEffect(() => {

        if (props.selectedOption === "editClient") {

            // setTimeout(()=>{

            // },1000)

            props.setSelectedOption("");
            props.setModalVisibility(false);
            // props.setVisible(false);
            props.editClientOption("edit");
            setEditClientModalVisibility(true);
        } else if (props.selectedOption === "deleteClient") {
            setDeleteClientModalVisibility(true);
            props.setSelectedOption("");
            props.setModalVisibility(false);
            props.setModalVisibility(false);
        }
    }, [props.selectedOption]);


    function clientInfoCategoryPressHandler(id) {
        setClientMoreDetails(id);
    }

    function seeMoreStatisticsHandler() {
        setClientMoreDetails("seeMoreStats");
    }

    let content;

    if (clientMoreDetails === null) {
        content = <ScrollView style={{flex: 1, width: '100%'}} showsVerticalScrollIndicator={false}>
            {
                props.modalVisibility &&
                <MoreOptionDropDownModal
                    isVisible={props.modalVisibility}
                    onCloseModal={() => props.setModalVisibility(false)}
                    dropdownItems={[
                        "Edit client",
                        "Delete client",
                    ]}
                    setOption={props.setSelectedOption}

                />

            }

            {editClientModalVisibility && <UpdateClientModal
                isVisible={editClientModalVisibility}
                onCloseModal={() => {
                    dispatch(loadClientInfoFromDb(props.id))
                    dispatch(loadClientFiltersFromDb(10, "All"));
                    dispatch(loadSearchClientFiltersFromDb(10, "All", ""));
                    setEditClientModalVisibility(false);
                    props.setModalVisibility(false);

                }}
                details={details}
                updateClientToast={(message, duration) => {
                    toastRef.current.show(message, duration);
                }}

            />}

            <BottomActionCard isVisible={deleteClientModalVisibility}
                              header={"Delete Client"}
                              content={"Are you sure? This action cannot be undone."}
                              onClose={() => {
                                  setDeleteClientModalVisibility(false)
                              }}
                              onConfirm={async () => {
                                  deleteClientAPI(currentClientId);
                                  props.deleteClientToast();
                                  dispatch(loadClientCountFromDb());
                                  dispatch(loadClientFiltersFromDb(10, "All"));
                                  dispatch(loadSearchClientFiltersFromDb(10, "All", ""));
                                  props.setVisible(false);
                                  props.setSearchQuery("");
                                  props.setFilterPressed("all_clients_count");
                                  dispatch(clearClientInfo());
                                  setDeleteClientModalVisibility(false)
                              }}
                              onCancel={() => setDeleteClientModalVisibility(false)}
                              confirmLabel={"Delete"}
                              cancelLabel={"Cancel"}
            />

            <View style={styles.modalContent}>
                <ClientCard
                    clientDetailsContainer={{width: "auto"}}
                    name={details.name}
                    phone={details.mobile_1}
                    card={styles.clientDetailsContainer}
                    nameText={[textTheme.titleSmall, styles.name]}
                    phoneText={[textTheme.titleSmall, styles.phone]}
                    onPress={() => null}
                    rippleColor={Colors.transparent}
                />
                <View style={styles.optionsContainer}>
                    <PrimaryButton
                        buttonStyle={styles.updateOrDeleteOption}
                        onPress={() => {
                            props.setModalVisibility(true);
                        }}
                        pressableStyle={[styles.pressable, {paddingHorizontal: 12}]}
                    >
                        <SimpleLineIcons name="options" size={24} color="black"/>
                    </PrimaryButton>
                    <PrimaryButton buttonStyle={styles.callButton}
                                   onPress={() => {
                                       if (checkNullUndefined(details.mobile_1)) {
                                           Linking.openURL(`tel:${details.mobile_1}`)
                                       }
                                   }
                                   }
                                   pressableStyle={[styles.pressable, styles.pressableStyle]}>
                        <View style={{flexDirection: "row"}}>
                            <Feather name="phone" size={18} color="black"/>
                            <Text style={[textTheme.bodyMedium, {marginLeft: 8}]}>Call</Text>
                        </View>

                    </PrimaryButton>
                    {/*<PrimaryButton buttonStyle={styles.bookButton}*/}
                    {/*               pressableStyle={[styles.pressable, styles.pressableStyle]} onPress={() => null}>*/}
                    {/*    <Text style={[textTheme.bodyMedium, {color: Colors.white}]}>*/}
                    {/*        Book now*/}
                    {/*    </Text>*/}
                    {/*</PrimaryButton>*/}
                </View>

                <ClientSaleInfo
                    totalSales={totalSales}
                    lastVisit={lastVisit}
                    salesCard={styles.salesCard}
                    onPress={seeMoreStatisticsHandler}
                />

                <View style={styles.clientInfoCategoryContainer}>
                    <ClientInfoCategories
                        onPress={clientInfoCategoryPressHandler}
                        membershipCount={checkNullUndefined(membershipData.length) ? membershipData.length : 0}
                        packageCount={checkNullUndefined(packageData.length) ? packageData.length : 0}
                        prepaidCount={details.wallet_status ? 1 : 0}
                    />
                </View>
            </View>
        </ScrollView>

    } else if (clientMoreDetails === "seeMoreStats") {
        content =
            <ClientStatistics
                title={getCategoryTitle[clientMoreDetails]}
                lastVisit={lastVisit}
                totalSales={totalSales}
                completedAppointment={completedAppointments}
                cancelledAppointment={cancelledAppointments}
                feedbackCount={feedbackCount}
                noShows={noShows}
                totalVisits={totalVisits}
            />
    } else if (clientMoreDetails === "clientDetails") {
        content =
            <ClientDetails
                title={getCategoryTitle[clientMoreDetails]}
                details={details}

            />
    } else if (clientMoreDetails === "billActivity") {
        content = checkNullUndefined(salesData) && checkNullUndefined(salesData.history_appointment_count) && salesData.history_appointment_count > 0 ?
            <BillingActivity
                salesData={salesData}
                clientId={details.id}
            /> :
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Image source={require("../../assets/icons/drawerIcons/checkout.png")} tintColor={Colors.highlight}
                       style={{height: 30, width: 30, marginBottom: 6}}/>
                <Text style={[textTheme.labelLarge]}>No Sales</Text>
                <Text style={textTheme.bodyMedium}>The client has no upcoming or past sales</Text>
            </View>
    } else if (clientMoreDetails === "appointments") {
        content = checkNullUndefined(salesData) && checkNullUndefined(salesData.upcoming_appointmentList.length) && salesData.upcoming_appointmentList.length > 0 ?
            <Appointments
                salesData={salesData}
                clientId={details.id}
            /> :
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Image source={require("../../assets/icons/drawerIcons/checkout.png")} tintColor={Colors.highlight}
                       style={{height: 30, width: 30, marginBottom: 6}}/>
                <Text style={[textTheme.labelLarge]}>No Appointments</Text>
                <Text style={textTheme.bodyMedium}>The client has no upcoming Appointments</Text>
            </View>
    } else if (clientMoreDetails === "memberships") {
        content = checkNullUndefined(membershipData) && checkNullUndefined(membershipData.length) && membershipData.length > 0 ?
            <MembershipDetails
                membershipData={membershipData}
            /> :
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Image source={require("../../assets/icons/membership.png")} tintColor={Colors.highlight}
                       style={{height: 40, width: 40, marginBottom: 6}}/>
                <Text style={[textTheme.labelLarge]}>No Membership</Text>
                <Text style={textTheme.bodyMedium}>This client doesn’t have any active memberships</Text>
            </View>
    } else if (clientMoreDetails === "packageSales") {
        content = checkNullUndefined(packageData) && checkNullUndefined(packageData.length) && packageData.length > 0 ?
            <PackageDetails
                pacakgeData={packageData}
            /> :
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Image source={require("../../assets/icons/package.png")} tintColor={Colors.highlight}
                       style={{height: 40, width: 40, marginBottom: 6}}/>
                <Text style={[textTheme.labelLarge]}>No Package</Text>
                <Text style={textTheme.bodyMedium}>This client doesn’t have any package.</Text>
            </View>
    } else if (clientMoreDetails === "prepaidSales") {
        content = checkNullUndefined(details) && checkNullUndefined(details.wallet_status) && details.wallet_status ?
            <PrepaidDetails
                details={details}/> :
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
                <Image source={require("../../assets/icons/prepaid.png")} tintColor={Colors.highlight}
                       style={{height: 40, width: 40, marginBottom: 6}}/>
                <Text style={[textTheme.labelLarge]}>No Prepaid</Text>
                <Text style={textTheme.bodyMedium}>This client doesn’t have any prepaid.</Text>
            </View>

    }
        else if (clientMoreDetails === "rewardpoints") {
            content =
                <ClientRewardPoints details={details} />
    }
    else {
        content =
            <View style={{flex: 1, justifyContent: "center", alignItems: "center"}}><Text style={textTheme.titleMedium}>Coming
                Soons</Text></View>
    }


    return (
        <Modal visible={props.visible}
               animationType={"slide"}
               presentationStyle="pageSheet"
               onRequestClose={() => {
                   if (clientMoreDetails === null) {
                       props.onClose();
                   }
                   else {
                       setClientMoreDetails(null);
                   }
               }}
        >
            <Toast ref={toastRef}/>


            <View style={styles.closeAndHeadingContainer}>
                {
                    clientMoreDetails === null ?
                        null :
                        <PrimaryButton
                            buttonStyle={styles.backButton}
                            onPress={() => {
                                if(clientMoreDetails === "rewardpoints"){
                                    dispatch(resetRewardPageNo());
                                    dispatch(updateCustomerRewards({customerRewardList:[],count:0}))
                                    dispatch(updateRewardsPointBalance(0))
                                }
                                setClientMoreDetails(null);
                                
                            }}
                        >
                            <AntDesign name="arrowleft" size={24} color="black"/>
                        </PrimaryButton>
                }

                <PrimaryButton
                    buttonStyle={styles.closeButton}
                    pressableStyle={styles.closeButtonPressable}
                    onPress={() => {
                        props.onClose();
                        setClientMoreDetails(null);
                    }}
                >
                    <Ionicons name="close" size={25} color="black"/>
                </PrimaryButton>
                {
                    clientMoreDetails === null ?
                        null :
                        <ClientCard
                            name={details.name}
                            card={styles.clientProfileCard}
                            cardInnerContainer={styles.cardInnerContainer}
                            rippleColor={Colors.white}
                            onPress={() => null}
                        />
                }

            </View>

            {
                clientMoreDetails === null ?
                    null :
                    <>
                        <Divider/>
                    </>
            }
            {/*{*/}
            {/*    Object.keys(details).length !== 0 ?*/}
            {/*        content : null*/}
            {/*}*/}
            <View style={{flex: 1, paddingHorizontal: 15, alignItems: 'center', width: '100%'}}>


                {
                    // checkNullUndefined(details.length) &&
                    details === undefined || analyticDetails === undefined || membershipData === undefined || packageData === undefined ||
                    Object.keys(details).length === 0 ?
                        <View style={{alignItems: 'center', width: "100%",}}>

                            {
                                <View style={{height: '100%', width: '95%', alignItems: 'center',}}>
                                    <ContentLoader
                                        row={[1, 3, 1, 1, 1, 1, 1, 1, 1, 1]}
                                        size={[
                                            [{width: '35%'}],
                                            [{width: '30%'}, {width: '30%'}, {width: '30%'}],
                                            [{height: 160, marginTop: 50}],
                                            [null],
                                            [{marginTop: 0}],
                                            [{marginTop: 0}],
                                            [{marginTop: 0}],
                                            [{marginTop: 0}],
                                            [{marginTop: 0}],
                                            [{marginTop: 0}],
                                        ]
                                        }
                                    />
                                </View>
                            }
                        </View> : content
                }
            </View>

        </Modal>
    );
}

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    closeAndHeadingContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 60,
        flexDirection: "row",
        ...Platform.select({
            ios: {
                // marginTop: 32,
            },
            android: {
                // marginTop: 0,
            },
        }),

    },
    closeButton: {
        position: "absolute",
        right: 0,
        backgroundColor: Colors.white,
    },
    closeButtonPressable: {
        alignItems: "flex-end",
    },
    titleText: {
        fontWeight: "500",
        flex: 1,
        justifyContent: "center",
        textAlign: "center",
    },
    clientDetailsContainer: {
        alignItems: 'center',
    },
    name: {
        fontWeight: '600',
    },
    phone: {
        // width: "150%"
    },
    optionsContainer: {
        flexDirection: "row",
        width: "95%",
        justifyContent: "center",
        gap: 32
    },
    updateOrDeleteOption: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey250,
        width: '20%'
    },
    callButton: {
        width: '70%',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey250,
    },
    bookButton: {
        width: '30%'
    },
    pressableStyle: {
        flex: 1,
    },
    salesCard: {
        marginTop: 30,
        width: '100%'
    },
    clientInfoCategoryContainer: {
        borderWidth: 1,
        borderColor: Colors.grey250,
        borderRadius: 12,
        width: '100%',
        marginTop: 16,
        overflow: 'hidden',
        marginBottom: 100,
    },
    backButton: {
        position: "absolute",
        left: 0,
        backgroundColor: Colors.background,
    },
    clientProfileCard: {
        width: "70%",
        justifyContent: "center",
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    cardInnerContainer: {
        marginLeft: 0
    },
    pressable: {
        paddingVertical: 8,
        paddingHorizontal: 0,
    }
})