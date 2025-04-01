import Toast from "../../../ui/Toast";
import ChooseTemplateModal from "../ChooseTemplateModal";
import {Modal, ScrollView, Text, View, StyleSheet, Image, FlatList, TextInput} from "react-native";
import textTheme from "../../../constants/TextTheme";
import PrimaryButton from "../../../ui/PrimaryButton";
import {Ionicons, MaterialIcons} from "@expo/vector-icons";
import Divider from "../../../ui/Divider";
import React, {useEffect, useMemo, useRef, useState} from "react";
import Colors from "../../../constants/Colors";
import CustomTextInput from "../../../ui/CustomTextInput";
import {RadioButton} from "react-native-paper";
import {DynamicBoldText} from "../DynamicBoldText";
import LabelNumberInput from "./LabelNumberInput";
import {timeArray} from "./serviceReminderConstants";
import createServiceReminderAPI from "../../../apis/marketingAPI/serviceRemindersAPI/createServiceReminderAPI";
import getListOfSMSTemplatesByType from "../../../apis/marketingAPI/SMSCampaignAPI/getListOfSMSTemplatesByType";
import calculatePricingForSMSCampaign from "../../../apis/marketingAPI/SMSCampaignAPI/calculatePricingForSMSCampaign";
import updateServiceReminderAPI from "../../../apis/marketingAPI/serviceRemindersAPI/updateServiceReminderAPI";
import BottomActionCard from "../../../ui/BottomActionCard";
import deleteServiceReminderAPI from "../../../apis/marketingAPI/serviceRemindersAPI/deleteServiceReminderAPI";
import ReminderTemplateModal from "./ReminderTemplateModal";
import getListOfWhatsAppTemplateDetailsByType
    from "../../../apis/marketingAPI/serviceRemindersAPI/getListOfWhatsAppTemplateDetailsByType";

export default function ConfigureReminderModal(props) {
    const [chooseTemplateModalVisibility, setChooseTemplateModalVisibility] = useState(false);

    const [ruleName, setRuleName] = useState(props.edit ? props.selectedReminderData.group_name : "");
    const [serviceType, setServiceType] = useState(props.edit ? props.selectedReminderData.services[0].res_cat_id : "");
    const [notificationType, setNotificationType] = useState(props.edit ? props.selectedReminderData.notification_type : "whatsapp");
    const [reminderInterval, setReminderInterval] = useState(props.edit ? props.selectedReminderData.reminder_type === "Fixed" ? "Fixed Interval" : "Custom Interval" : "");
    const [reminderCount, setReminderCount] = useState(props.edit ? props.selectedReminderData.reminder_count : "");
    const [reminderDeliveryTime, setReminderDeliveryTime] = useState(props.edit ? props.selectedReminderData.delivery_time : "");
    const [edit, setEdit] = useState(false);
    const [isConfirmStaffDeleteModalVisible, setIsConfirmStaffDeleteModalVisible] = useState(false);
    const [templateData, setTemplateData] = useState({
        template_id: "",
        template_name: "",
        selected_template: "",
        template_list: "",
        credit_per_sms: 0,
        sms_char_count: 0,
        total_sms_credit: 0,
        type: "service_reminder",
        variables: "",
    });


    const [automatedReminderRulesData, setAutomatedReminderRulesData] = useState({
        "Fixed Interval": [
            {
                name: "First Reminder",
                first_line: "Send first reminder from the date of the last service taken.",
                reminder_no: 1,
                days: 0,
                id: null,
                edited: false,
            },
            {
                name: "Subsequent Reminders",
                first_line: "Specify the interval at which subsequent reminders will be sent after the first reminder.",
                reminder_no: 2,
                days: 0,
                id: null,
                edited: false,
            }
        ],
        "Custom Interval": [
            {
                name: "First Reminder",
                first_line: "Send first reminder from the date of the last service taken.",
                reminder_no: 1,
                days: 0,
                id: null,
                edited: false,

            },
            {
                name: "Second Reminder",
                first_line: "Send second reminder from the date of the last service taken.",
                reminder_no: 2,
                days: 0,
                id: null,
                edited: false,

            },
            {
                name: "Third Reminder",
                first_line: "Send third reminder from the date of the last service taken.",
                reminder_no: 3,
                days: 0,
                id: null,
                edited: false,

            },
            {
                name: "Fourth Reminder",
                first_line: "Send fourth reminder from the date of the last service taken.",
                reminder_no: 4,
                days: 0,
                id: null,
                edited: false,

            },
            {
                name: "Fifth Reminder",
                first_line: "Send fifth reminder from the date of the last service taken.",
                reminder_no: 5,
                days: 0,
                id: null,
                edited: false,

            },


        ],
    });



    const toastRef = useRef(null);
    const reminderRuleNameRef = useRef(null);
    const selectServicesRef = useRef(null);
    const reminderIntervalRef = useRef(null);
    const reminderCountRef = useRef(null);
    const reminderDeliveryTimeRef = useRef(null);


    const hasErrors = useMemo(() => {
        return (reminderInterval !== "" && reminderCount !== "" && reminderInterval === "Custom Interval" ?
            automatedReminderRulesData[reminderInterval].slice(0, reminderCount) :
            reminderInterval === "Fixed Interval" && reminderCount === 1 ?
                [automatedReminderRulesData[reminderInterval][0]] : automatedReminderRulesData[reminderInterval])?.some((item, index) => {
            if (reminderInterval === "Fixed Interval" && item.edited && item.days <= 0) {
                return true;
            }
            else if (reminderInterval === "Custom Interval" && index === 0 && item.edited && item.days <= 0) {
                return true;
            }
            else if (reminderInterval === "Custom Interval" && index > 0 && item.edited && automatedReminderRulesData[reminderInterval][index - 1].days > item.days) {
                return true;
            }
            return false;
        });
    }, [automatedReminderRulesData, reminderInterval]);

    // console.log(JSON.stringify(props.selectedReminderData, null, 2));




    function resetTheReminderIntervalCountTemplateData() {
        setTemplateData({
            template_id: "",
            template_name: "",
            selected_template: "",
            template_list: "",
            credit_per_sms: 0,
            sms_char_count: 0,
            total_sms_credit: 0,
            type: "service_reminder",
            variables: "",
        })
        setReminderInterval("");
        setReminderCount("");
    }


    const updateReminderDays = (reminder_no, days) => {
        setAutomatedReminderRulesData((prevData) => ({
            ...prevData,
            [reminderInterval]: prevData[reminderInterval].map((item) =>
                item.reminder_no === reminder_no ? { ...item, days, edited: true } : item
            ),
        }));
    };

    const renderItem = ({ item, index }) => {
        const current_list = reminderInterval === "Custom Interval" ?
            automatedReminderRulesData[reminderInterval].slice(0, reminderCount) :
            reminderInterval === "Fixed Interval" && reminderCount === 1 ?
                [automatedReminderRulesData[reminderInterval][0]] : automatedReminderRulesData[reminderInterval];
        // console.log(reminderInterval)
        const errorMessage =
            reminderInterval === "Fixed Interval" && item.edited && item.days <= 0 ?
                "Reminder days should be greater than 0" :
                reminderInterval === "Custom Interval" && index === 0 && item.edited && item.days <= 0 ?
                    "Reminder days should be greater than 0" :
                    reminderInterval === "Custom Interval" && index > 0 && item.edited && current_list[index - 1].days >= item.days ?
                        `Enter the reminder days greater than Reminder ${index}` :
                        null;

        return <>
            <View style={styles.automatedReminderRuleItemContainer}>
                <Text style={[textTheme.titleMedium]}>
                    {item.name}
                </Text>
                <View style={{gap: 12, paddingVertical: 8, flex: 1}}>
                    <Text style={[textTheme.bodyMedium, {flex: 1, color: Colors.grey500}]} numberOfLines={3} ellipsizeMode={"tail"}>
                        {item.first_line}
                    </Text>
                    <View style={{flexDirection: "row", alignItems: "center", gap: 12, flex: 1}}>
                        {item.name !== "subsequent reminders" && <Text>After</Text>}
                        <LabelNumberInput reminder_no={item.reminder_no} days={item.days}
                                          updateReminder={updateReminderDays}/>

                    </View>
                    {/*{*/}
                    {/*    reminderInterval === "Fixed Interval" ?*/}
                    {/*        item.edited && item.days <= 0 &&*/}
                    {/*        <Text style={[textTheme.bodyMedium, {color: Colors.error, fontSize: 12}]}>Reminder days should be greater than 0</Text> :*/}
                    {/*        index === 0 ?*/}
                    {/*            item.edited && item.days <= 0 &&*/}
                    {/*            <Text style={[textTheme.bodyMedium, {color: Colors.error, fontSize: 12}]}>Reminder days should be greater than 0</Text> :*/}
                    {/*            item.edited && current_list[index - 1].days > item.days ?*/}
                    {/*                <Text style={[textTheme.bodyMedium, {color: Colors.error, fontSize: 12}]}>Enter the reminder days greater than Reminder {index}</Text> :*/}
                    {/*                <></>*/}
                    {/*}*/}

                    {errorMessage && <Text style={[textTheme.bodyMedium, {color: Colors.error, fontSize: 12}]}>{errorMessage}</Text>}


                </View>

            </View>

        </>
    }

    // console.log(automatedReminderRulesData[reminderInterval].splice(0))

    async function onSave() {

        const ruleNameValid = reminderRuleNameRef.current();
        const selectServicesValid = selectServicesRef.current();
        const reminderIntervalValid = reminderIntervalRef.current();
        const reminderCountValid = reminderCountRef.current();
        const reminderDeliveryTimeValid = templateData.selected_template === "" ? true : reminderDeliveryTimeRef.current();

        const isAutomatedReminderRulesEmpty = (reminderInterval === "Custom Interval" ?
            automatedReminderRulesData[reminderInterval].slice(0, reminderCount) :
            reminderInterval === "Fixed Interval" && reminderCount === 1 ?
                [automatedReminderRulesData[reminderInterval][0]] : automatedReminderRulesData[reminderInterval]).filter((item) => item.days === 0 || item.days === "").length > 0;



        if (!ruleNameValid || !reminderIntervalValid || !reminderCountValid || !selectServicesValid || !reminderDeliveryTimeValid) {
            return;
        }

        if (templateData.selected_template === "") {
            toastRef.current.show("please select any template to proceed");
            return;
        }

        // console.log(JSON.stringify(automatedReminderRulesData, null, 2));
        if (isAutomatedReminderRulesEmpty) {
            toastRef.current.show("Number of days should not be empty");
            return;
        }

        if (hasErrors) {
            return;
        }



        const response = await createServiceReminderAPI(
            {
                delivery_time: reminderDeliveryTime,
                group_name: ruleName,
                notification_type: notificationType,
                reminder_count: reminderCount,
                reminder_rules: automatedReminderRulesData[reminderInterval].filter((item) => item.days > 0).map((item) => {
                    return {"reminder_no": item.reminder_no, "days": item.days };
                }),
                reminder_type: reminderInterval.split(" ")[0],
                services: [serviceType],
                stop_rules: false,
                templates: [{
                    template_message: templateData.selected_template,
                    template_id: templateData.template_id,
                    credits_per_sms: templateData.credits_per_sms,
                    variables: templateData.variables,
                    sms_character_count: templateData.sms_char_count,
                }]
            }
        )

        if (response.data.other_message === "") {
            props.toastRef.current.show(response.data.message)
            props.onClose();
        }
        else {
            toastRef.current.show(response.data.other_message)
        }


    }

    async function onUpdate() {

        const ruleNameValid = reminderRuleNameRef.current();
        const selectServicesValid = selectServicesRef.current();
        const reminderIntervalValid = reminderIntervalRef.current();
        const reminderCountValid = reminderCountRef.current();
        const reminderDeliveryTimeValid = templateData.selected_template === "" ? true : reminderDeliveryTimeRef.current();

        const isAutomatedReminderRulesEmpty = (reminderInterval === "Custom Interval" ?
            automatedReminderRulesData[reminderInterval].slice(0, reminderCount) :
            reminderInterval === "Fixed Interval" && reminderCount === 1 ?
                [automatedReminderRulesData[reminderInterval][0]] : automatedReminderRulesData[reminderInterval]).filter((item) => item.days === 0 || item.days === "").length > 0;



        if (!ruleNameValid || !reminderIntervalValid || !reminderCountValid || !selectServicesValid || !reminderDeliveryTimeValid) {
            return;
        }

        if (templateData.selected_template === "") {
            toastRef.current.show("please select any template to proceed");
            return;
        }

        // console.log(JSON.stringify(automatedReminderRulesData, null, 2));
        if (isAutomatedReminderRulesEmpty) {
            toastRef.current.show("Number of days should not be empty");
            return;
        }

        if (hasErrors) {
            return;
        }

        const response = await updateServiceReminderAPI(
            {
                delivery_time: reminderDeliveryTime,
                group_name: ruleName,
                notification_type: notificationType,
                reminder_count: reminderCount,
                reminder_rules: automatedReminderRulesData[reminderInterval].filter((item) => item.days > 0).map((item) => {
                    return {"reminder_no": item.reminder_no, "days": item.days };
                }),
                reminder_type: reminderInterval.split(" ")[0],
                services: props.selectedReminderData.services,
                stop_rules: true,
                templates: [{
                    template_message: templateData.selected_template,
                    template_id: templateData.template_id,
                    credits_per_sms: templateData.credits_per_sms === undefined ? null : templateData.credits_per_sms,
                    variables: templateData.variables,
                    sms_character_count: templateData.sms_char_count,
                }],
                whatsapp_status: props.selectedReminderData.whatsapp_status,
                edited_rules: true,
                sms_status: props.selectedReminderData.sms_status,
                id: props.selectedReminderData.id
            }
        )

        if (response.data.other_message === "") {
            props.toastRef.current.show(response.data.message)
            props.onClose();
        }
        else {
            toastRef.current.show(response.data.other_message)
        }

    }

    function onReset() {
        setRuleName("");
        setServiceType("");
        setNotificationType("whatsapp");
        setTemplateData({
            template_id: "",
            template_name: "",
            selected_template: "",
            template_list: "",
            credit_per_sms: 0,
            sms_char_count: 0,
            total_sms_credit: 0,
            type: "service_reminder",
            variables: "",
        });
        setReminderInterval("");
        setReminderCount("");
    }

    function ReminderDeliveryTime() {
        return <View style={{paddingHorizontal: 24}}>
            <Text style={[textTheme.titleMedium]}>
                Reminder delivery time
            </Text>
            <Text style={[textTheme.bodyMedium, {flex: 1, color: Colors.grey500, paddingVertical: 8}]} numberOfLines={3} ellipsizeMode={"tail"}>
                Specify the time of day when the reminder should be sent
            </Text>
            <CustomTextInput
                labelTextStyle={{...textTheme.titleMedium}}
                labelEnabled={false}
                type={"dropdown"}
                dropdownItems={timeArray}
                label={"Reminder delivery time"}
                container={{marginTop: 12}}
                placeholder={"Select any time"}
                value={reminderDeliveryTime}
                onChangeValue={setReminderDeliveryTime}
                validator={(text) => {
                    if (text === "" || text === null || text === undefined) {
                        return "reminder delivery time is required";
                    }
                    else return true;
                }}
                onSave={(callback) => reminderDeliveryTimeRef.current = callback}
            />
        </View>
    }


    useEffect(() => {
        if (props.edit) {
            if (notificationType === "sms") {

                getListOfSMSTemplatesByType(10).then((res) => {
                    const template = res.data.data.filter((item) => item.template_id === props.selectedReminderData.templates[0].template_id);
                    const updated_list = res.data.data.map((template) => ({
                        ...template,
                        assigned: template.template_id === props.selectedReminderData.templates[0].template_id,
                    }))

                    calculatePricingForSMSCampaign(template[0].sample_template).then((response) => {
                        setTemplateData(
                            {
                                template_id: template[0].template_id,
                                template_name: template[0].template_name,
                                selected_template: template[0].sample_template,
                                template_list: updated_list,
                                credit_per_sms: response.data.data[0].credits_per_sms,
                                sms_char_count: response.data.data[0].sms_character_count,
                                total_sms_credit: response.data.data[0].total_sms_credit,
                                type: "service_reminder",
                                variables: template[0].variables,
                            }
                        )
                    })


                });
            }
            else {
                getListOfWhatsAppTemplateDetailsByType("SERVICE_REMINDER").then((res) => {
                    const template = res.data.data.filter((item) => item.template_id === props.selectedReminderData.templates[0].template_id);
                    const updated_list = res.data.data.map((template) => ({
                        ...template,
                        assigned: template.template_id === props.selectedReminderData.templates[0].template_id,
                    }));
                    setTemplateData(
                        {
                            template_id: props.selectedReminderData.templates[0].template_id,
                            template_name: "whatsapp",
                            selected_template: props.selectedReminderData.templates[0].template_message,
                            template_list: [],
                            credit_per_sms: props.selectedReminderData.templates[0].credits_per_sms,
                            sms_char_count: props.selectedReminderData.templates[0].sms_character_count,
                            total_sms_credit: 0,
                            type: "service_reminder",
                            variables: props.selectedReminderData.templates[0].variables,
                        }
                    )

                    // calculatePricingForSMSCampaign(template[0].sample_template).then((response) => {
                    //     setTemplateData(
                    //         {
                    //             template_id: template[0].template_id,
                    //             template_name: "whatsapp",
                    //             selected_template: template[0].sample_template,
                    //             template_list: updated_list,
                    //             credit_per_sms: response.data.data[0].credits_per_sms,
                    //             sms_char_count: response.data.data[0].sms_character_count,
                    //             total_sms_credit: response.data.data[0].total_sms_credit,
                    //             type: "service_reminder",
                    //             variables: template[0].variables,
                    //         }
                    //     )
                    // })


                })
            }
            // console.log(automatedReminderRulesData)

            const reminder_rules = props.selectedReminderData.reminder_rules.filter((item) => item.id !== null)

            const updated_reminder_rules = automatedReminderRulesData[reminderInterval].map((item) => {
                const days = (reminder_rules.filter((innerItem) => innerItem.reminder_no === item.reminder_no)[0])?.days
                const id = reminder_rules.filter((innerItem) => innerItem.reminder_no === item.reminder_no)[0]?.id;
                return {
                    ...item,
                    days: days === undefined ? 0 : days,
                    id: id === undefined ? null : id,
                    edited: true
                }
            });


            setAutomatedReminderRulesData(prevState => ({
                ...prevState,
                [reminderInterval]: updated_reminder_rules
            }));


        }
    }, []);





    return <Modal
        visible={props.visible}
        animationType="slide"
        style={styles.modal}
        onRequestClose={props.onClose}
        presentationStyle={"formSheet"}
    >
        <Toast ref={toastRef}/>
        {
            chooseTemplateModalVisibility &&
            <ReminderTemplateModal
                visible={chooseTemplateModalVisibility}
                onClose={() => {
                    setChooseTemplateModalVisibility(false);
                    // setTemplateValid(true);
                }}
                templateData={templateData}
                setTemplateData={setTemplateData}
                edit={edit}
                templateType={notificationType}
            />
        }
        {
            isConfirmStaffDeleteModalVisible &&
            <BottomActionCard isVisible={isConfirmStaffDeleteModalVisible}
                              header={"Delete Reminder"}
                              content={"Are you sure? This action cannot be undone."}
                              onClose={() => setIsConfirmStaffDeleteModalVisible(false)}
                              onConfirm={async () => {
                                  const response = await deleteServiceReminderAPI(props.selectedReminderData.id);
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


        <View style={styles.closeAndHeadingContainer}>
            <Text
                style={[textTheme.titleMedium, {fontSize: 20,}, styles.titleText]}>{props.edit ? "Update service reminder" : "Configure Service Reminder"}</Text>
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

                        <Text style={[textTheme.titleMedium]}>Service Reminder</Text>
                    </View>
                    <Text style={[textTheme.bodyMedium]}>
                        Set up automated service reminders to encourage clients to visit again after X amount of time
                        since their last visit
                    </Text>
                </View>

                <Text style={[textTheme.titleMedium, {marginVertical: 16}]}>
                    Enter Service Reminder Details
                </Text>

                <CustomTextInput
                    type={"text"}
                    label={"Reminder rule name"}
                    value={ruleName}
                    onChangeText={setRuleName}
                    validator={(text) => {
                        if (text === "" || text === null || text === undefined) {
                            return "Rule Name is required";
                        }
                        else return true;
                    }}
                    onSave={(callback) => reminderRuleNameRef.current = callback}
                    placeholder={"Enter reminder rule"}
                />
                <CustomTextInput
                    type={"dropdown"}
                    dropdownItems={["All services"]}
                    label={"Select services"}
                    value={serviceType}
                    onChangeValue={setServiceType}
                    placeholder={"Select services"}
                    validator={(text) => {
                        if (text === "" || text === null || text === undefined) {
                            return "Select the services";
                        }
                        else return true;
                    }}
                    onSave={(callback) => selectServicesRef.current = callback}
                />

                <Text style={[textTheme.bodyMedium, {color: Colors.grey500}]}>Notification type</Text>
                <View style={{flexDirection: "row"}}>
                    <PrimaryButton
                        pressableStyle={styles.radioButtonPressable}
                        buttonStyle={styles.radioButton}
                        onPress={() => {
                            if(notificationType !== "whatsapp"){
                                resetTheReminderIntervalCountTemplateData();
                            }
                            setNotificationType("whatsapp")
                        }}
                    >
                        <RadioButton
                            value={notificationType}
                            status={notificationType === "whatsapp" ? "checked" : 'unchecked'}
                            color={Colors.highlight}
                            uncheckedColor={Colors.highlight}
                            onPress={() => {
                                if(notificationType !== "whatsapp"){
                                    resetTheReminderIntervalCountTemplateData();
                                }
                                setNotificationType("whatsapp")
                            }}
                        />
                        <Text>WhatsApp</Text>
                    </PrimaryButton>

                    <PrimaryButton
                        pressableStyle={styles.radioButtonPressable}
                        buttonStyle={styles.radioButton}
                        onPress={() => {
                            if(notificationType !== "sms"){
                                resetTheReminderIntervalCountTemplateData();
                            }
                            setNotificationType("sms")
                        }}
                    >
                        <RadioButton
                            value={notificationType}
                            status={notificationType === "sms" ? "checked" : 'unchecked'}
                            color={Colors.highlight}
                            uncheckedColor={Colors.highlight}
                            onPress={() => {
                                if(notificationType !== "sms"){
                                    resetTheReminderIntervalCountTemplateData();
                                }
                                setNotificationType("sms")
                            }}
                        />
                        <Text>SMS</Text>
                    </PrimaryButton>
                </View>

                <Text style={[textTheme.bodyMedium, {marginTop: 8}]}>Select template</Text>

                {
                    templateData.template_name === "" ?
                        <>
                            <PrimaryButton
                                label={"Select message template"}
                                buttonStyle={styles.selectTemplateButton}
                                pressableStyle={styles.selectTemplatePressable}
                                textStyle={styles.selectTemplateButtonText}
                                onPress={() => setChooseTemplateModalVisibility(true)}
                            />
                            {/*{*/}
                            {/*    templateValid ? <></> :*/}
                            {/*        <Text style={[textTheme.bodyMedium, {color: Colors.error}]}>{"Template is required"}</Text>*/}
                            {/*}*/}

                        </> :
                        <View style={styles.campaignContent}>

                            <DynamicBoldText
                                text={templateData.selected_template}
                                textStyle={{paddingHorizontal: 16,}}
                            />
                            <View style={{alignItems: "flex-end"}}>
                                <Text style={[textTheme.bodyMedium, {color: Colors.grey500, paddingTop: 32, paddingHorizontal: 16, paddingBottom: 12}]}>
                                    {(notificationType === "sms" ? templateData.credit_per_sms + "  " + "Credit" : "") + "    " + "Aa" + " "  + "|" + " " + templateData.sms_char_count}
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
                                        setChooseTemplateModalVisibility(true);
                                    }}
                                >
                                    <Image source={require("../../../assets/icons/marketingIcons/smsCampaign/data_flow_horizontal.png")} style={{width: 25, height: 25}}/>
                                    <Text style={[textTheme.bodyMedium, {color: Colors.highlight}]}>Change template</Text>
                                </PrimaryButton>
                                {
                                    notificationType === "sms" &&
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
                                        <Image
                                            source={require("../../../assets/icons/marketingIcons/smsCampaign/attachment.png")}
                                            style={{width: 25, height: 25}}/>
                                        <Text style={[textTheme.bodyMedium, {color: Colors.highlight}]}>Insert
                                            variable</Text>
                                    </PrimaryButton>
                                }

                            </View>

                        </View>
                }

                <CustomTextInput
                    type={"dropdown"}
                    value={reminderInterval}
                    onChangeValue={setReminderInterval}
                    dropdownItems={["Fixed Interval", "Custom Interval"]}
                    label={"Reminder Interval"}
                    placeholder={"Choose reminder interval"}
                    container={{marginTop: 12}}
                    validator={(text) => {
                        if (text === "" || text === null || text === undefined) {
                            return "reminder interval i required";
                        }
                        else return true;
                    }}
                    onSave={(callback) => reminderIntervalRef.current = callback}
                />
                <CustomTextInput
                    type={"dropdown"}
                    value={reminderCount}
                    onChangeValue={setReminderCount}
                    dropdownItems={[1, 2, 3, 4, 5]}
                    label={"Reminder count"}
                    placeholder={"Choose reminder count"}
                    validator={(text) => {
                        if (text === "" || text === null || text === undefined) {
                            return "reminder count required";
                        }
                        else return true;
                    }}
                    onSave={(callback) => reminderCountRef.current = callback}
                />
                {
                    reminderInterval !== "" && reminderCount !== "" && templateData.selected_template !== "" &&
                    <>
                        <Text style={[textTheme.bodyMedium]}>Automated reminder rules</Text>

                        <View style={styles.automatedReminderRuleContainer}>
                            {/*<View style={styles.automatedReminderRuleHeader}>*/}
                            {/*    <Text style={[textTheme.bodyMedium, {width: "30%"}]}>NAME</Text>*/}
                            {/*    <Text style={[textTheme.bodyMedium, {width: "70%"}]}>SCHEDULE</Text>*/}
                            {/*</View>*/}
                            <FlatList
                                data={
                                reminderInterval === "Custom Interval" ?
                                    automatedReminderRulesData[reminderInterval].slice(0, reminderCount) :
                                    reminderInterval === "Fixed Interval" && reminderCount === 1 ?
                                    [automatedReminderRulesData[reminderInterval][0]] : automatedReminderRulesData[reminderInterval]
                            }
                                renderItem={renderItem}
                                scrollEnabled={false}
                                style={{marginVertical: 24}}
                                contentContainerStyle={{gap: 24}}
                                ListFooterComponent={ReminderDeliveryTime}
                            />
                        </View>

                    </>
                }

            </ScrollView>
            <View style={styles.bottomContainer}>
                {
                    props.edit ?
                        <PrimaryButton
                            onPress={async () => {
                                setIsConfirmStaffDeleteModalVisible(true);
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
                    label={"Reset"}
                    buttonStyle={styles.resetButton}
                    pressableStyle={styles.resetButtonPressable}
                    textStyle={[textTheme.titleMedium, styles.resetText]}
                    onPress={onReset}
                />

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
        backgroundColor: Colors.grey150,
        marginTop: 16
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
    automatedReminderRuleContainer: {
        borderWidth: 1,
        borderColor: Colors.grey400,
        marginTop: 8,
        borderRadius: 8,
        overflow: "hidden"
    },
    automatedReminderRuleHeader: {
        backgroundColor: Colors.grey150,
        flexDirection: "row",
        paddingHorizontal: 8,
        paddingVertical: 12,
    },
    automatedReminderRuleItemContainer: {
        paddingHorizontal: 24,
        // flexDirection: "row",
    },
    resetButtonPressable: {
        paddingHorizontal: 24
    },
    resetButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey400,
    },
    resetText: {
        color: Colors.grey500,

    }
})