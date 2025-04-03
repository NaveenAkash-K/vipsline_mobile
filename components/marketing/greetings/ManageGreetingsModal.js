import Toast from "../../../ui/Toast";
import {Modal, ScrollView, Text, View, StyleSheet, Image} from "react-native";
import textTheme from "../../../constants/TextTheme";
import PrimaryButton from "../../../ui/PrimaryButton";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import Divider from "../../../ui/Divider";
import React, {useEffect, useRef, useState} from "react";
import Colors from "../../../constants/Colors";
import CustomTextInput from "../../../ui/CustomTextInput";
import {RadioButton} from "react-native-paper";
import {DynamicBoldText} from "../DynamicBoldText";
import getListOfPromotionTypesAPI from "../../../apis/marketingAPI/SMSCampaignAPI/getListOfPromotionTypesAPI";
import ChooseTemplateForGreetings from "./ChooseTemplateForGreetings";
import createGreetingsAPI from "../../../apis/marketingAPI/greetingsAPI/createGreetingsAPI";
import {timeArray} from "../ServiceReminders/serviceReminderConstants";
import updateGreetingsAPI from "../../../apis/marketingAPI/greetingsAPI/updateGreetingsAPI";
import BottomActionCard from "../../../ui/BottomActionCard";
import deleteGreetingsAPI from "../../../apis/marketingAPI/greetingsAPI/deleteGreetingsAPI";

export default function ManageGreetingsModal(props) {
    const [chooseTemplateModalVisibility, setChooseTemplateModalVisibility] = useState(false);
    const [notificationType, setNotificationType] = useState("sms");
    const [greetingType, setGreetingType] = useState(props.edit ? props.selectedGreetingsData.greetings_type === "Birthday" ? "Birthday wishes" : props.selectedGreetingsData.greetings_type : "");
    const [customerSegment, setCustomerSegment] = useState(props.edit ? props.selectedGreetingsData.customer_segment : "");
    const [groupName, setGroupName] = useState(props.edit ? props.selectedGreetingsData.group_name : "");
    const [edit, setEdit] = useState(false);
    const [changeTemplateIndex, setChangeTemplateIndex] = useState(-1);
    const [templateTypeId, setTemplateTypeId] = useState("");
    const [templateData, setTemplateData] = useState([{
        template_id: "",
        template_name: "",
        selected_template: "",
        credit_per_sms: 0,
        sms_char_count: 0,
        total_sms_credit: 0,
        type: "greetings",
        variables: "",
        addMore: true,
        editTemplate: false,
        templateStringWithBoldChar: "",
        send_days_before: "",
        template: "",
        delivery_time: "",
        mode: "",
        templateMappingId: ""
    }]);
    const [greetingTemplateData, setGreetingTemplateData] = useState({
        selected_template_ids: [],
        template_name: "",
        selected_templates: [],
        type: "greetings",
        change_template_id: "",
    });
    const [isConfirmStaffDeleteModalVisible, setIsConfirmStaffDeleteModalVisible] = useState(false);


    const toastRef = useRef(null);
    const greetingTypeRef = useRef(null);
    const customerSegmentRef = useRef(null);
    const messageGroupNameRef = useRef(null);
    const greetingDeliveryTimeRef = useRef(null);
    const sendMessageBeforeRef = useRef(null);

    async function onSave() {
        const greetingTypeValid = greetingTypeRef.current();
        const customerSegmentValid = customerSegmentRef.current();
        const messageGroupNameValid = messageGroupNameRef.current();
        const sendMessageBeforeValid = greetingTemplateData.selected_template_ids.length !== 0 ? sendMessageBeforeRef.current() : true;
        const greetingDeliveryTimeValid = greetingTemplateData.selected_template_ids.length !== 0 ? greetingDeliveryTimeRef.current() : true;

        if (!greetingTypeValid || !customerSegmentValid || !messageGroupNameValid || !sendMessageBeforeValid || !greetingDeliveryTimeValid) {
            return;
        }

        if(greetingTemplateData.selected_template_ids.length === 0) {
            toastRef.current.show("Please select a template name to proceed");
            return;
        }


        const response = await createGreetingsAPI(
            {
                greetings_type: greetingType.split(" ")[0],
                customer_segment: customerSegment,
                group_name: groupName,
                notification_type: notificationType,
                templates: templateData.map(({
                                                    addMore,
                                                    editTemplate,
                                                    template,
                                                    selected_template,
                                                    send_days_before,
                                                    delivery_time,
                                                    template_id,
                                                    credit_per_sms,
                                                    sms_char_count,
                                                    variables,

                }) => ({
                    addMore: addMore,
                    editTemplate,
                    template,
                    templateStringWithBoldChar: selected_template,
                    template_message: selected_template,
                    send_days_before: send_days_before === `On ${greetingType?.split(" ")[0]}` ? 0 : parseInt(send_days_before.split(" ")[0]),
                    delivery_time,
                    template_id,
                    credits_per_sms : credit_per_sms,
                    sms_character_count: sms_char_count,
                    variables,
                }))
            }
        );

        if (response.data.status_code === 200) {
            props.toastRef.current.show(response.data.message);
            props.onClose();

        }
        else {
            toastRef.current.show(response.data.other_message);
        }
    }
    async function onUpdate() {
        const greetingTypeValid = greetingTypeRef.current();
        const customerSegmentValid = customerSegmentRef.current();
        const messageGroupNameValid = messageGroupNameRef.current();
        const sendMessageBeforeValid = greetingTemplateData.selected_template_ids.length !== 0 ? sendMessageBeforeRef.current() : true;
        const greetingDeliveryTimeValid = greetingTemplateData.selected_template_ids.length !== 0 ? greetingDeliveryTimeRef.current() : true;

        if (!greetingTypeValid || !customerSegmentValid || !messageGroupNameValid || !sendMessageBeforeValid || !greetingDeliveryTimeValid) {
            return;
        }

        if(greetingTemplateData.selected_template_ids.length === 0) {
            toastRef.current.show("Please select a template name to proceed");
            return;
        }
        const response = await updateGreetingsAPI(
            {
                greetings_type: greetingType.split(" ")[0],
                customer_segment: customerSegment,
                group_name: groupName,
                notification_type: notificationType,
                id: props.selectedGreetingsData.id,
                templates: templateData.map(({
                                                 addMore,
                                                 editTemplate,
                                                 template,
                                                 selected_template,
                                                 send_days_before,
                                                 delivery_time,
                                                 template_id,
                                                 credit_per_sms,
                                                 sms_char_count,
                                                 variables,
                                                 templateMappingId,
                                                 mode

                                             }) => ({
                    addMore: addMore,
                    editTemplate,
                    templateMappingId: addMore ? undefined : templateMappingId,
                    templateStringWithBoldChar: selected_template,
                    template_message: selected_template,
                    send_days_before: send_days_before === `On ${greetingType?.split(" ")[0]}` ? 0 : parseInt(send_days_before.split(" ")[0]),
                    delivery_time,
                    template_id,
                    credits_per_sms : credit_per_sms,
                    sms_character_count: sms_char_count,
                    variables,
                    mode: addMore ? "add" : mode === "" ? "edit" : mode,
                }))
            }
        );

        if (response.data.status_code === 200) {
            props.toastRef.current.show(response.data.message);
            props.onClose();

        }
        else {
            toastRef.current.show(response.data.other_message);
        }
    }

    useEffect(() => {
        if (props.edit) {
            setTemplateData(
                props.selectedGreetingsData.templates.map((item) => ({
                    template_id: item.template_id || "",
                    template_name: props.selectedGreetingsData.greetings_type,
                    selected_template: item.template_message || "",
                    credit_per_sms: item.credits_per_sms || 0,
                    sms_char_count: item.sms_character_count || 0,
                    total_sms_credit: 0, //
                    type: "greetings",
                    variables: item.variables || "",
                    addMore: false,
                    editTemplate: false,
                    templateStringWithBoldChar: item.templateStringWithBoldChar || "",
                    send_days_before: item.send_days_before === 0 ? `On ${greetingType?.split(" ")[0]}` : item.send_days_before + " day before" || "",
                    template: "", // Assuming this is the mapping value
                    delivery_time: item.delivery_time || "",
                    mode: "",
                    templateMappingId: item.templateMappingId || "",
                }))
            );
            setGreetingTemplateData(prev => ({
                ...prev,
                selected_template_ids: props.selectedGreetingsData.templates.map((item) => item.template_id),
                template_name: props.selectedGreetingsData.greetings_type,
            }))
            getListOfPromotionTypesAPI("greetings").then((response) => {
                setTemplateTypeId(response.data.data.filter((item) => item.name === props.selectedGreetingsData.greetings_type)[0].id);
            })
            setEdit(true)
        }

    }, []);

    return <Modal
        visible={props.visible}
        animationType="slide"
        style={styles.modal}
        onRequestClose={props.onClose}
        presentationStyle={"formSheet"}
    >
        <Toast ref={toastRef} />
        {
            isConfirmStaffDeleteModalVisible &&
            <BottomActionCard isVisible={isConfirmStaffDeleteModalVisible}
                              header={"Delete Greetings"}
                              content={"Are you sure? This action cannot be undone."}
                              onClose={() => setIsConfirmStaffDeleteModalVisible(false)}
                              onConfirm={async () => {
                                  const response = await deleteGreetingsAPI(props.selectedGreetingsData.id);
                                  if(response.data.other_message === "") {
                                      props.toastRef.current.show(response.data.message);
                                  }
                                  else {
                                      toastRef.current.show(response.data.other_message);
                                  }
                                  setIsConfirmStaffDeleteModalVisible(false);
                                  props.onClose();
                              }}
                              onCancel={() => {
                                  setIsConfirmStaffDeleteModalVisible(false);
                              }}

            />
        }
        {
            chooseTemplateModalVisibility &&
            <ChooseTemplateForGreetings
                visible={chooseTemplateModalVisibility}
                onClose={() => {
                    setChooseTemplateModalVisibility(false);
                    // setTemplateValid(true);
                    setChangeTemplateIndex(-1);

                }}
                templateData={templateData}
                setTemplateData={setTemplateData}
                templateTypeId={templateTypeId}
                greetingType={greetingType}
                edit={edit}
                type={"greetings"}
                changeTemplateIndex={changeTemplateIndex}
                greetingTemplateData={greetingTemplateData}
                setGreetingTemplateData={setGreetingTemplateData}
            />
        }
        <View style={styles.closeAndHeadingContainer}>
            <Text
                style={[textTheme.titleMedium, {fontSize: 20,}, styles.titleText]}>{props.edit ? "Update Greetings" : "Configure Greetings"}</Text>
            <PrimaryButton
                buttonStyle={styles.closeButton}
                pressableStyle={styles.closeButtonPressable}
                onPress={props.onClose}
            >
                <Ionicons name="close" size={25} color="black"/>
            </PrimaryButton>
        </View>
        <Divider/>
        <>
            <ScrollView
                style={styles.modalContent}
            >
                <View style={styles.TRAIRegulationInfoContainer}>
                    <View style={styles.TRAIHeaderContainer}>
                        <MaterialIcons name="info" size={24} color={Colors.highlight}/>

                        <Text style={[textTheme.titleMedium]}>Greetings</Text>
                    </View>
                    <Text style={[textTheme.bodyMedium]}>
                        Wish your customers on special occasions like birthday and anniversary with automated special
                        occasion greetings.
                    </Text>
                </View>
                <Text style={[textTheme.titleMedium, {marginVertical: 16}]}>
                    Enter the greeting details
                </Text>
                <CustomTextInput
                    type={"dropdown"}
                    dropdownItems={["Anniversary", "Birthday wishes"]}
                    label={"Greeting type"}
                    value={greetingType}
                    onChangeValue={(text) => {
                        if (text !== greetingType) {
                            setTemplateData([{
                                template_id: "",
                                template_name: "",
                                selected_template: "",
                                credit_per_sms: 0,
                                sms_char_count: 0,
                                total_sms_credit: 0,
                                type: "greetings",
                                variables: "",
                                addMore: true,
                                editTemplate: false,
                                templateStringWithBoldChar: "",
                                send_days_before: "",
                                template: "",
                                delivery_time: "",
                                mode: "",
                                templateMappingId: ""
                            }]);
                            setGreetingTemplateData({
                                selected_template_ids: [],
                                template_name: "",
                                selected_templates: [],
                                type: "greetings",
                                change_template_id: "",
                            });
                        }
                        getListOfPromotionTypesAPI("greetings", text).then((response) => {
                            setTemplateTypeId(response.data.data.filter((item) => item.name === text.split(" ")[0])[0].id);
                        })
                        setGreetingType(text);
                    }}
                    validator={(text) => {
                        if (text === "" || text === null || text === undefined) {
                            return "greeting type is required";
                        }
                        else return true;
                    }}
                    onSave={(callback) => greetingTypeRef.current = callback}
                />
                <CustomTextInput
                    type={"dropdown"}
                    dropdownItems={["All Customers"]}
                    label={"Choose customer segment"}
                    placeholder={"Choose customer segment"}
                    value={customerSegment}
                    onChangeValue={setCustomerSegment}
                    validator={(text) => {
                        if (text === "" || text === null || text === undefined) {
                            return "customer segment is required";
                        }
                        else return true;
                    }}
                    onSave={(callback) => customerSegmentRef.current = callback}
                />
                <CustomTextInput
                    type={"text"}
                    label={"Message Group Name"}
                    placeholder={"Enter Group name"}
                    value={groupName}
                    onChangeText={(text) => {
                        setGroupName(text);
                    }}
                    maxLength={200}
                    validator={(text) => {
                        if (text === "" || text === null || text === undefined) {
                            return "message group name is required";
                        }
                        else return true;
                    }}
                    onSave={(callback) => messageGroupNameRef.current = callback}
                />
                <View>
                    <Text style={[textTheme.bodyMedium]}>Notification type</Text>
                    <PrimaryButton
                        pressableStyle={styles.radioButtonPressable}
                        buttonStyle={styles.radioButton}
                        onPress={() => setNotificationType("sms")}
                    >
                        <RadioButton
                            value={notificationType}
                            status={notificationType === "sms" ? "checked" : 'unchecked'}
                            color={Colors.highlight}
                            uncheckedColor={Colors.highlight}
                            onPress={() => setNotificationType("sms")}
                        />
                        <Text>SMS</Text>
                    </PrimaryButton>

                </View>

                <Text style={[textTheme.bodyMedium, {marginTop: 8}]}>Add a New Greeting Template</Text>

                {
                    greetingTemplateData.selected_template_ids.length === 0 ?
                        <>
                            <PrimaryButton
                                label={"Select message template"}
                                buttonStyle={styles.selectTemplateButton}
                                pressableStyle={styles.selectTemplatePressable}
                                textStyle={styles.selectTemplateButtonText}
                                onPress={() => {
                                    if(greetingType !== ""){
                                        setChooseTemplateModalVisibility(true)
                                    }
                                }}
                            />
                        </> :
                        templateData.map((item, index) => {
                            return (
                                item.mode !== "remove" &&
                                <>
                                    <View style={styles.campaignContent}>

                                        <DynamicBoldText
                                            text={item.selected_template}
                                            textStyle={{paddingHorizontal: 16,}}
                                        />
                                        <View style={{alignItems: "flex-end"}}>
                                            <Text style={[textTheme.bodyMedium, {color: Colors.grey500, paddingTop: 32, paddingHorizontal: 16, paddingBottom: 12}]}>
                                                {`${item.credit_per_sms} Credit     Aa | ${item.sms_char_count}`}
                                            </Text>
                                        </View>

                                        <View style={{flexDirection: "row", backgroundColor: Colors.grey150}}>
                                            <PrimaryButton
                                                buttonStyle={{
                                                    flex: 1,
                                                    borderRadius: 0,
                                                    backgroundColor: Colors.grey150
                                                }}
                                                pressableStyle={{
                                                    flexDirection: "row",
                                                    gap: 8,
                                                }}
                                                onPress={() => {
                                                    setEdit(true);
                                                    setChangeTemplateIndex(item.template_id)
                                                    setChooseTemplateModalVisibility(true);
                                                }}
                                            >
                                                <Image source={require("../../../assets/icons/marketingIcons/smsCampaign/data_flow_horizontal.png")} style={{width: 25, height: 25}}/>
                                                <Text style={[textTheme.bodyMedium, {color: Colors.highlight}]}>Change template</Text>
                                            </PrimaryButton>
                                            <PrimaryButton
                                                buttonStyle={{
                                                    flex: 1,
                                                    borderRadius: 0,
                                                    backgroundColor: Colors.grey150
                                                }}
                                                pressableStyle={{
                                                    flexDirection: "row",
                                                    gap: 8,
                                                }}
                                            >
                                                <Image source={require("../../../assets/icons/marketingIcons/smsCampaign/attachment.png")} style={{width: 25, height: 25}}/>
                                                <Text style={[textTheme.bodyMedium, {color: Colors.highlight}]}>Insert variable</Text>
                                            </PrimaryButton>
                                            <PrimaryButton
                                                onPress={async () => {
                                                    if(greetingTemplateData.selected_template_ids.includes(item.template_id)) {
                                                        const updated = greetingTemplateData.selected_template_ids.filter((id) => id !== item.template_id);
                                                        setGreetingTemplateData(prev => ({
                                                            ...prev,
                                                            selected_template_ids: updated
                                                        }))
                                                    }
                                                    // console.log(props.selectedGreetingsData.templates.map((item) => item.template_id));

                                                    if (props.edit && props.selectedGreetingsData.templates.map((item) => item.template_id).includes(item.template_id)) {
                                                        setTemplateData(prevState =>
                                                            prevState.map((item, i) =>
                                                                i === index ? { ...item, mode: "remove" } : item
                                                            )
                                                        );
                                                    }
                                                    else {
                                                        setTemplateData(prevState =>
                                                            prevState.filter((item, i) => i !== index)
                                                        );
                                                    }
                                                }}
                                                buttonStyle={{
                                                    backgroundColor: Colors.grey150,
                                                    borderRadius: 0,
                                                }}
                                                pressableStyle={{
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 8,

                                                }}>
                                                <MaterialIcons name="delete-outline" size={28} color={Colors.error}/>
                                            </PrimaryButton>

                                        </View>

                                    </View>
                                    <View>
                                        <CustomTextInput
                                            type={"dropdown"}
                                            label={"Send this message before"}
                                            defaultValue={item.send_days_before}
                                            onChangeValue={(text) => {

                                                setTemplateData(prevState =>
                                                    prevState.map((item, i) =>
                                                        i === index ? { ...item, send_days_before: text } : item
                                                    )
                                                );

                                                setTimeout(() => {
                                                    sendMessageBeforeRef.current();
                                                }, 100)
                                            }}
                                            flex
                                            placeholder={"select day"}
                                            dropdownItems={[
                                                `On ${greetingType?.split(" ")[0]}`,
                                                "1 day before",
                                                "7 day before",
                                                "15 day before",
                                                "30 day before",
                                            ]}
                                            value={item.send_days_before}
                                            validator={(text) => {
                                                if (text === "" || text === null || text === undefined) {
                                                    return "send message before is required";
                                                }
                                                else if(templateData.filter((item) => item.mode !== "remove").map((item) => item.send_days_before).reduce((acc, el) => ((acc[el] = (acc[el] || 0) + 1), acc), {})[text] > 1) {
                                                    return "Please select another day from the options, as it already exists";
                                                }
                                                else return true;

                                            }}
                                            onSave={(callback) => sendMessageBeforeRef.current = callback}
                                        />
                                        <CustomTextInput
                                            type={"dropdown"}
                                            label={"Greetings delivery time"}
                                            defaultValue={item.delivery_time}
                                            onChangeValue={(text) => {
                                                setTemplateData(prevState =>
                                                    prevState.map((item, i) =>
                                                        i === index ? { ...item, delivery_time: text } : item
                                                    )
                                                );
                                            }}
                                            flex
                                            placeholder={"select delivery time"}
                                            dropdownItems={timeArray}
                                            value={item.delivery_time}
                                            validator={(text) => {
                                                if (text === "" || text === null || text === undefined) {
                                                    return "greeting delivery time is required";
                                                }
                                                else return true
                                            }}
                                            onSave={(callback) => greetingDeliveryTimeRef.current = callback}
                                        />
                                    </View>
                                </>
                            )
                        })

                }

                {
                    greetingTemplateData.selected_template_ids.length > 0 ?
                        <PrimaryButton
                            label={"Add More"}
                            buttonStyle={styles.addMoreButton}
                            pressableStyle={styles.addMoreButtonPressable}
                            textStyle={styles.addMoreButtonText}
                            onPress={() => setChooseTemplateModalVisibility(true)}
                        />  :
                        <></>
                }

            </ScrollView>
            <View style={styles.bottomContainer}>
                {
                    props.edit ?
                        <PrimaryButton
                            onPress={async () => {
                                setIsConfirmStaffDeleteModalVisible(true)
                            }}
                            buttonStyle={{
                                backgroundColor: "white",
                                borderWidth: 1,
                                borderColor: Colors.grey400
                            }}
                            pressableStyle={{paddingHorizontal: 8, paddingVertical: 8}}>
                            <MaterialIcons name="delete-outline" size={28} color={Colors.error}/>
                        </PrimaryButton>  : <></>
                }

                <PrimaryButton
                    label={props.edit ? "Update" : "Configure"}
                    buttonStyle={styles.saveButton}
                    onPress={props.edit ? onUpdate : onSave}
                />
            </View>

        </>

    </Modal>
}

const styles = StyleSheet.create({
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
    modal: {
        flex: 1,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 12,
        marginBottom: 32
    },
    TRAIRegulationInfoContainer: {
        borderWidth: 1,
        borderColor: Colors.grey400,
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 16,
        gap: 12,
        backgroundColor: Colors.grey150
    },
    TRAIHeaderContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    radioButtonPressable: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        justifyContent: 'flex-start'
    },
    radioButton: {
        backgroundColor: Colors.white,

    },
    selectTemplateButton: {
        backgroundColor: Colors.highlight50,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: Colors.highlight,
        marginTop: 8,
        marginBottom: 8,
        // borderBottomWidth: 0
    },
    selectTemplatePressable: {

    },
    selectTemplateButtonText: {
        color: Colors.highlight,
    },
    campaignContent: {
        borderWidth: 1,
        borderRadius: 6,
        borderColor: Colors.grey400,
        paddingHorizontal: 0,
        paddingTop: 16,
        overflow: 'hidden',
        marginBottom: 32,
        marginTop: 8,

    },
    bottomContainer: {
        paddingHorizontal: 16,
        flexDirection: "row",
        gap: 18,
        marginBottom: 12
    },
    cancelButton: {
        flex: 1,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey500,
    },
    cancelButtonText: {
        color: Colors.black,
    },
    saveButton: {
        flex: 1,
    },
    addMoreButton: {
        backgroundColor: Colors.white,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: Colors.highlight,
    },
    addMoreButtonPressable: {

    },
    addMoreButtonText: {
        color: Colors.highlight,
    }
})