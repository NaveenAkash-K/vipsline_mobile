import {Modal, ScrollView, StyleSheet, Text, View, ToastAndroid, Platform} from "react-native";
import CustomTextInput from "../../ui/CustomTextInput";
import React, {useState, useRef, useEffect} from "react";
import textTheme from "../../constants/TextTheme";
import PrimaryButton from "../../ui/PrimaryButton";
import {Ionicons} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import Divider from "../../ui/Divider";
import {capitalizeFirstLetter, checkNullUndefined, formatDate} from "../../util/Helpers";
import {useDispatch, useSelector} from "react-redux";
import {loadClientCountFromDb} from "../../store/clientSlice";
import updateClientAPI from "../../apis/ClientSegmentAPIs/updateClientAPI";
import {loadClientInfoFromDb} from "../../store/clientInfoSlice";

/**
 * UpdateClientModal Component
 *
 * This component is a modal that allows users to update client information.
 * It includes input fields for various client attributes such as name, phone number,
 * email, and more. The modal also includes options to select dates and provide additional
 * information. Upon saving, the updated client information is sent to the server.
 *
 * Props:
 * @param {boolean} props.isVisible - Controls the visibility of the modal.
 * @param {object} props.details - An object containing the existing client details to pre-populate
 *                            the input fields. The object may include fields such as:
 *                            - `firstName` (string): The client's first name.
 *                            - `lastName` (string): The client's last name.
 *                            - `mobile_1` (string): The client's primary mobile number.
 *                            - `mobile_2` (string): The client's secondary mobile number.
 *                            - `username` (string): The client's email address.
 *                            - `gender` (string): The client's gender.
 *                            - `customer_gst` (string): The client's GST number.
 *                            - `client_notes` (string): Notes related to the client.
 *                            - `address` (string): The client's address.
 *                            - `dob` (string): The client's date of birth in string format.
 *                            - `anniversary` (string): The client's anniversary date in string format.
 *                            - `client_source` (string): The source through which the client was acquired.
 * @param {Function} props.onCloseModal - Function to close the modal and handle any additional logic
 *                                  after the modal is closed.
 */




const UpdateClientModal = ((props) => {
    const details = props.details;


    const [clientData, setClientData] = useState({
        firstName: details.firstName,
        lastName: "",
        phoneNo: ["+91", details.mobile_1],
        secondaryNo: ["+91", details.mobile_2],
        email: "",
        location: details.location,
        gender: "",
        clientSource: "",
        gstNo: "",
        clientNotes: "",
        clientAddress: "",
        dateOfBirth: null,
        anniversaryDate: null,
        isDobSelected: false,
        isAnniversarySelected: false,
    });

    const dispatch = useDispatch();

    const firstNameRef = useRef(null);
    const lastNameRef = useRef(null);
    const phoneNoRef = useRef(null);
    const emailRef = useRef(null);


    const existingValues = () => {
        setClientData({
            firstName: details.firstName,
            lastName: details.lastName,
            phoneNo: ["+91", details.mobile_1],
            secondaryNo: ["+91", details.mobile_2],
            email: details.username,
            location: details.location,
            gender: checkNullUndefined(details.gender) && details.gender.trim().length !== 0 ?
                capitalizeFirstLetter(details.gender) : "",
            gstNo: details.customer_gst,
            clientNotes: details.client_notes,
            clientAddress: details.address,
            isDobSelected: false,
            isAnniversarySelected: false,
            anniversaryDate: checkNullUndefined(details.anniversary) && details.anniversary.trim().length !== 0 ?
                new Date(details.anniversary) : null,
            dateOfBirth: checkNullUndefined(details.dob) && details.dob.trim().length !== 0 ?
                new Date(details.dob) : null,
            clientSource: details.client_source,
        });
    };

    const clientDetails = useSelector(state => state.clientInfo.details);
    const businessId = useSelector(state => state.authDetails.businessId);


    const handleUpdate = async () => {
        const firstNameValid = firstNameRef.current();
        const lastNameValid = lastNameRef.current();
        const phoneNoValid = phoneNoRef.current();
        // const emailValid = emailRef.current();



        if (!firstNameValid || !lastNameValid || !phoneNoValid) return;
        try {
            await updateClientAPI(clientDetails.id, {
                address: clientData.clientAddress,
                anniversary: clientData.isAnniversarySelected ? formatDate(clientData.anniversaryDate, "yyyy-mm-dd") : null,
                businessId: businessId,
                city: "",
                clientNotes: clientData.clientNotes,
                client_notes: props.type === "update" ? clientData.clientNotes : undefined,
                client_source: props.type === "update" ? clientData.clientSource : undefined,
                clientSource: clientData.clientSource,
                country: "India",
                countryCode: clientData.phoneNo[0],
                custGst: clientData.gstNo,
                dob: clientData.isDobSelected ? formatDate(clientData.dateOfBirth, "yyyy-mm-dd") : undefined,
                username: clientData.email,
                firstName: clientData.firstName,
                gender: clientData.gender,
                lastName: clientData.lastName,
                mobile_1: clientData.phoneNo[1],
                mobile_2: clientData.secondaryNo[1],
                pinCode: "",
                state: "Tamilnadu",
                location: clientData.location,
                wallet_status: details.wallet_status,
            });
            // dispatch(loadClientCountFromDb());
            props.updateClientToast("User updated Successfully", 2000);
            dispatch(loadClientInfoFromDb(clientDetails.id));
            props.onCloseModal();
            // ToastAndroid.show("User updated Successfully", ToastAndroid.LONG);
            // TODO

            // Toast.show("User updated successfully",{
            //     duration:Toast.durations.LONG,
            //     position: Toast.positions.BOTTOM,
            //     shadow:false,
            //     backgroundColor:"black",
            //     opacity:1
            // })
            // props.onUpdate();
        } catch (e) {
            // ToastAndroid.show(e + "error", ToastAndroid.LONG);
            // TODO
            props.updateClientToast("failed to update client", 2000);
            // Toast.show(e+" error",{
            //     duration:Toast.durations.LONG,
            //     position: Toast.positions.BOTTOM,
            //     shadow:false,
            //     backgroundColor:"black",
            //     opacity:1
            // })
        }
    };

    const handleChange = (field, value) => {
        setClientData(prevState => ({
            ...prevState,
            [field]: value,
        }));
    };

    useEffect(() => {
        existingValues();
    }, [props.isVisible, details]);

    return (
        <Modal visible={props.isVisible} style={styles.createClientModal} animationType={"slide"}
               presentationStyle="pageSheet" onRequestClose={props.onCloseModal}>
            <View style={styles.closeAndHeadingContainer}>
                <Text style={[textTheme.titleLarge, styles.titleText]}>Edit client</Text>
                <PrimaryButton
                    buttonStyle={styles.closeButton}
                    pressableStyle={styles.closeButtonPressable}
                    onPress={props.onCloseModal}
                >
                    <Ionicons name="close" size={25} color="black"/>
                </PrimaryButton>
            </View>
            <Divider/>
            <ScrollView>
                <View style={styles.modalContent}>
                    <Text style={[textTheme.bodyMedium, styles.headingText]}>Basic Information</Text>
                    <CustomTextInput
                        type="text"
                        label="First name"
                        placeholder="Enter client's first name"
                        value={clientData.firstName}
                        onChangeText={(value) => handleChange("firstName", value)}
                        validator={(text) => text.length === 0 ? "First name is required" : true}
                        onSave={(callback) => {
                            firstNameRef.current = callback;
                        }}
                        required
                    />
                    <CustomTextInput
                        type="text"
                        label="Last name"
                        placeholder="Enter client's last name"
                        value={clientData.lastName}
                        onChangeText={(value) => handleChange("lastName", value)}
                        // validator={(text) => text.length === 0 ? "Last name is required" : true}
                        onSave={(callback) => {
                            lastNameRef.current = callback;
                        }}
                    />
                    <CustomTextInput
                        type="phoneNo"
                        label="Mobile"
                        placeholder="0123456789"
                        value={clientData.phoneNo[1]}
                        onChangeText={(value) => handleChange("phoneNo", [value[0], value[1]])}
                        validator={(text) => text.length !== 10 ? "Phone number is invalid" : true}
                        onSave={(callback) => {
                            phoneNoRef.current = callback;
                        }}
                        required
                    />
                    <CustomTextInput
                        type="email"
                        label="Email address"
                        placeholder="Enter email address"
                        value={clientData.email}
                        onChangeText={(value) => handleChange("email", value)}
                        validator={(text) => {
                            if(checkNullUndefined(text) && !text.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) && text.trim() !== ""){
                                return "Email is invalid"
                            }
                            else {
                                return true
                            }
                        }}
                        // onSave={(callback) => {
                        //     emailRef.current = callback;
                        // }}
                    />
                    <CustomTextInput
                        type="text"
                        label="Location"
                        placeholder="Enter location"
                        value={clientData.location}
                        onChangeText={(value) => handleChange("location", value)}
                        // validator={(text) => {
                        //     if(checkNullUndefined(text) && !text.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) && text.trim() !== ""){
                        //         return "Email is invalid"
                        //     }
                        //     else {
                        //         return true
                        //     }
                        // }}
                        // onSave={(callback) => {
                        //     emailRef.current = callback;
                        // }}
                    />
                    <CustomTextInput
                        type="dropdown"
                        label="Gender"
                        value={clientData.gender}
                        onChangeValue={(value) => handleChange("gender", value)}
                        dropdownItems={["Male", "Female", "Others"]}
                    />
                    <CustomTextInput
                        type="dropdown"
                        label="Client source"
                        value={clientData.clientSource}
                        onChangeValue={(value) => handleChange("clientSource", value)}
                        dropdownItems={["Justdial", "Google", "Facebook", "Instagram", "SMS Campaign", "Walk-in", "Membership", "Others"]}
                    />
                    <CustomTextInput
                        maximumDate={new Date()}
                        type="date"
                        label="Date of birth"
                        value={clientData.dateOfBirth === null || clientData.dateOfBirth === undefined ? null : new Date(clientData.dateOfBirth)}
                        onChangeValue={(value) => {
                            handleChange("isDobSelected", true);
                            handleChange("dateOfBirth", value);
                        }}
                    />
                    <CustomTextInput
                        maximumDate={new Date()}
                        type="date"
                        label="Anniversary"
                        value={clientData.anniversaryDate === null || clientData.anniversaryDate === undefined ? null : new Date(clientData.anniversaryDate)}
                        onChangeValue={(value) => {
                            handleChange("isAnniversarySelected", true);
                            handleChange("anniversaryDate", value);
                        }}
                    />
                    <Text style={[textTheme.bodyMedium, styles.headingText]}>Additional Information</Text>
                    <CustomTextInput
                        type="text"
                        label="GST number"
                        placeholder="Enter client's GSTIN"
                        value={clientData.gstNo}
                        onChangeText={(value) => handleChange("gstNo", value)}
                        validator={(text) => {
                            if ( checkNullUndefined(text) && text.trim().length !== 0){
                                let regex = new RegExp(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/);
                                if(regex.test(text) === true) return true;
                                else return "Please enter valid GST number"
                            }
                            else return true;
                        }}
                    />
                    <CustomTextInput
                        type="phoneNo"
                        label="Secondary Number"
                        placeholder="0123456789"
                        value={clientData.secondaryNo[1]}
                        onChangeText={(value) => handleChange("secondaryNo", [value[0], value[1]])}
                    />
                    <CustomTextInput
                        type="multiLine"
                        label="Client notes"
                        placeholder="Enter Notes"
                        value={clientData.clientNotes}
                        onChangeText={(value) => handleChange("clientNotes", value)}
                    />
                    <CustomTextInput
                        type="multiLine"
                        label="Client address"
                        placeholder="Enter client address details"
                        value={clientData.clientAddress}
                        onChangeText={(value) => handleChange("clientAddress", value)}
                    />
                </View>
            </ScrollView>
            <View style={styles.saveButtonContainer}>
                <PrimaryButton label={"Update"} onPress={handleUpdate}/>
            </View>
        </Modal>
    );
});

const styles = StyleSheet.create({
    createClientModal: {
        flex: 1,
    },
    closeAndHeadingContainer: {
        // marginTop: Platform.OS === "ios" ? 40 : 0,
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
    titleText: {
        fontWeight: "500",
        flex: 1,
        justifyContent: "center",
        textAlign: "center",
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
    },
    headingText: {
        fontWeight: "bold",
        marginVertical: 25,
    },
    saveButtonContainer: {
        padding: 20,
        borderTopColor: Colors.grey500,
        borderTopWidth: 1,
    },
});

export default UpdateClientModal;