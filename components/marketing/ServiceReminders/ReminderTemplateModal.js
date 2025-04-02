import Toast from "../../../ui/Toast";
import textTheme from "../../../constants/TextTheme";
import PrimaryButton from "../../../ui/PrimaryButton";
import Divider from "../../../ui/Divider";
import Colors from "../../../constants/Colors";
import CustomTextInput from "../../../ui/CustomTextInput";
import getListOfPromotionTypesAPI from "../../../apis/marketingAPI/SMSCampaignAPI/getListOfPromotionTypesAPI";
import getListOfSMSTemplatesByType from "../../../apis/marketingAPI/SMSCampaignAPI/getListOfSMSTemplatesByType";
import calculatePricingForSMSCampaign from "../../../apis/marketingAPI/SMSCampaignAPI/calculatePricingForSMSCampaign";
import {DynamicBoldText} from "../DynamicBoldText";
import {ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, Text, View} from "react-native";
import {Ionicons, Octicons} from "@expo/vector-icons";
import React, {useEffect, useRef, useState} from "react";
import getListWhatsAppBusinessTemplate
    from "../../../apis/marketingAPI/serviceRemindersAPI/getListWhatsAppBusinessTemplate";
import getListOfWhatsAppTemplateDetailsByType
    from "../../../apis/marketingAPI/serviceRemindersAPI/getListOfWhatsAppTemplateDetailsByType";
import editWhatsAppBusinessTemplate from "../../../apis/marketingAPI/serviceRemindersAPI/editWhatsAppBusinessTemplate";

export default function ReminderTemplateModal(props) {
    const toastRef = useRef(null);
    const [templateNames, setTemplateNames] = useState([]);
    const [templateName, setTemplateName] = useState(
        props.edit ?
            props.templateData.template_name :
            props.templateData.type === "campaign" ?
                "My Template" : props.templateData.type === "service_reminder" ?
                    "service_reminder" : props.greetingType.split(" ")[0]

    );
    const [listOfSMSTemplates, setListOfSMSTemplates] = useState(props.type === "greetings" ? props.templateList : props.edit ?  props.templateData.template_list : []);
    const [isLoading, setIsLoading] = useState(false);
    const [clickedTemplateId, setClickedTemplateId] = useState(0)

    const ListHeaderComponent = () => <CustomTextInput
        type={"dropdown"}
        placeholder={"Choose template"}
        dropdownItems={templateNames.map((item) => item.name)}
        onChangeValue={(template) => {
            setTemplateName(template);

            if(template === props.templateData.template_name) {
                setListOfSMSTemplates(props.templateData.template_list);
            }
            else {
                getListOfSMSTemplatesByType((templateNames.filter((item) => item.name === template)[0].id).toString()).then((response) => {
                    const updatedList = response.data.data.map((item) => ({
                        ...item,
                        assigned: false,
                    }))
                    setListOfSMSTemplates(updatedList);
                })
            }
        }}
        value={templateName}
    />


    useEffect(() => {
        if(!props.edit) {
            if (props.templateType === "sms") {
                getListOfSMSTemplatesByType(
                    props.templateData.type === "campaign" ?
                        7 : props.templateData.type === "service_reminder" ? 10 : props.templateTypeId
                ).then((response) => {
                    setListOfSMSTemplates(response.data.data);
                })
            }


        }
        getListOfPromotionTypesAPI(props.templateData.type).then((response) => {
            setTemplateNames(response.data.data);
        })

        if (props.templateType === "whatsapp") {
            getListOfWhatsAppTemplateDetailsByType("SERVICE_REMINDER").then((response) => {
                setListOfSMSTemplates(response.data.data[0]);
            })
        }


    }, []);

    function renderItem({item}) {
        return <View style={styles.templateCard}>
            <Text style={[textTheme.titleMedium, {textAlign: 'center'}]}>{item.template_name}</Text>
            {
                props.templateType === "whatsapp" ?
                    <Text style={[textTheme.bodyMedium, {color: Colors.grey500, textAlign: 'center'}]}>
                        Added on: {item.added_on}
                    </Text> : <></>
            }
            <DynamicBoldText text={item.sample_template} textStyle={{marginTop: 24}}/>
            <PrimaryButton
                buttonStyle={[styles.button, (item.assigned === "true" ? {backgroundColor: Colors.highlight,} : null)]}
                pressableStyle={[styles.buttonPressable,  {flexDirection: "row", gap: 8,justifyContent: 'flex-start', paddingHorizontal: item.assigned === "true" ? 24 : 11, paddingVertical: item.assigned === "true" ? 6 : 8}]}
                textStyle={[textTheme.bodyMedium]}
                onPress={() => {
                    setClickedTemplateId(item.template_id);
                    setIsLoading(true);

                    if (props.templateType === "whatsapp") {
                        editWhatsAppBusinessTemplate(item.template_id, item.business_template_id).then((response) => {

                            props.setTemplateData(prev => ({
                                ...prev,
                                template_name: item.template_name,
                                template_id: item.template_id,
                                selected_template: item.sample_template,
                                template_list: [],
                                credit_per_sms: 0,
                                sms_char_count: item.sms_character_count,
                                total_sms_credit: 0,
                                variables: ""
                            }));
                            setIsLoading(false);
                            props.onClose();
                        })
                        return
                    }


                    // if (props.templateType === "sms") {
                        const updated = listOfSMSTemplates.map((template) => ({
                            ...template,
                            assigned: item === template
                        }))
                        setListOfSMSTemplates(updated);

                    // }


                    calculatePricingForSMSCampaign(item.sample_template).then((response) => {
                        const res = response.data.data[0];
                        props.setTemplateData(prev => ({
                            ...prev,
                            template_name: templateName,
                            template_id: item.template_id,
                            selected_template: item.sample_template,
                            template_list: listOfSMSTemplates.map((template) => ({
                                ...template,
                                assigned: item === template,
                            })),
                            credit_per_sms: res.credit_per_sms,
                            sms_char_count: res.sms_character_count,
                            total_sms_credit: res.total_sms_credit,
                            variables: item.variables
                        }));
                        setIsLoading(false);
                        props.onClose();
                    })
                }}
            >
                {
                    item.assigned === "true" ?
                        <Octicons name="check" size={24} color={Colors.white} /> :
                        <></>
                }
                <Text style={[textTheme.bodyMedium, {color: item.assigned === "true" ? Colors.white : Colors.highlight}]}>
                    {item.assigned === "true" ? "Assigned" : "Assign template"}
                </Text>
                {
                    isLoading && item.template_id === clickedTemplateId ?
                        <ActivityIndicator size="small" color={Colors.highlight} /> :
                        <></>
                }
            </PrimaryButton>
        </View>
    }

    return <Modal
        visible={props.visible}
        animationType="slide"
        style={styles.modal}
        onRequestClose={props.onClose}
        presentationStyle={"formSheet"}
    >
        <Toast ref={toastRef}/>

        <View style={styles.closeAndHeadingContainer}>
            <Text style={[textTheme.titleMedium, {fontSize: 20,}, styles.titleText]}>{"Choose a Template"}</Text>
            <PrimaryButton
                buttonStyle={styles.closeButton}
                pressableStyle={styles.closeButtonPressable}
                onPress={props.onClose}
            >
                <Ionicons name="close" size={25} color="black"/>
            </PrimaryButton>
        </View>
        <Divider/>
        <FlatList
            data={listOfSMSTemplates}
            renderItem={renderItem}
            style={styles.modalContent}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => <View style={{justifyContent: "center", alignItems: "center"}}>
                <Text style={[textTheme.titleMedium]}>No templates added, add templates to start sending campaigns</Text>
            </View>}

        />


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
        paddingHorizontal: 16,
        marginVertical: 32,
    },
    templateCard: {
        borderWidth: 1,
        borderColor: Colors.grey400,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
        // gap: 24
    },
    contentContainer: {
        gap: 24
    },
    button: {
        alignSelf: "flex-start",
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.highlight,
        marginTop: 24
    },
    buttonPressable: {
        paddingHorizontal: 18,
        paddingVertical: 8,
    }
})