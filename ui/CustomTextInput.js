import {StyleSheet, Text, TextInput, View} from "react-native";
import textTheme from "../constants/TextTheme";
import React, {useState, useEffect} from "react";
import Colors from "../constants/Colors";
import DropdownModal from "./DropdownModal";
import PrimaryButton from "./PrimaryButton";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {checkNullUndefined, formatDate, formatTime} from "../util/Helpers";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import RequiredSymbol from "./RequiredSymbol";
import dropdown from "react-native-element-dropdown/src/components/Dropdown";

/**
 * CustomTextInput component for various types of text inputs, including text, email, phone number, date and dropdown.
 *
 * @param {Object} props - Props for the CustomTextInput component.
 * @param {'text' | 'email' | 'phoneNo' | 'dropdown' | 'multiLine' | 'date' | 'number' | 'price'} props.type - The type of input to display.
 * @param {string | Date} [props.value] - The current value of the text input.
 * @param {string | Date} [props.defaultValue] - The default value of the text input.
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {number} [props.flex] - Flex of text input.
 * @param {string} [props.label] - Label text to display above the input.
 * @param {Object} [props.textInputStyle] - Custom style for text input.
 * @param {Object} [props.labelTextStyle] - Custom style for label text.
 * @param {boolean} [props.readOnly] - Makes the text input read only.
 * @param {Array} [props.dropdownItems] - Items to be listed in the dropdown option.
 * @param {function} [props.validator] - Function to validate the input value.
 * @param {function} props.onChangeText - Function to call when the text input value changes.
 * @param {function} props.onEndEditing - Function to call when the text input change complete.
 * @param {function} [props.onChangeValue] - Function to call when the selected value changes in dropdown.
 * @param {function} [props.onSave] - Function to call when the save button is pressed.
 * @param {Date} [props.minimumDate] - This optional prop defines the earliest date that the user can select.
 * @param {Date} [props.maximumDate] - This optional prop defines the latest date that the user can select.
 * @param {required} [props.required] - This is used to add the red-star at the end of the label
 * @returns {React.ReactElement} A styled custom text input component.
 *
 */
const CustomTextInput = (props) => {
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [countryCode, setCountryCode] = useState("+91");
    const [phoneNumber, setPhoneNumber] = useState(props.value);
    const [isDropdownModalVisible, setIsDropdownModalVisible] = useState(false);
    const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);

    const handleSave = () => {
        if (props.validator) {
            const validationResult = props.validator(props.value);
            if (validationResult === true) {
                setError(false);
                setErrorMessage("");
                return true;
            } else {
                setError(true);
                setErrorMessage(validationResult);
                return false;
            }
        }
        return true;
    };


    const handleConfirm = (selectedDate) => {
        setIsDateTimePickerVisible(false);
        if (error && props.validator && props.validator(selectedDate) === true) {
            setError(false);
            setErrorMessage("");
        }
        if (selectedDate) {
            props.onChangeValue(new Date(selectedDate.getTime())); // Pass the selected date to parent via callback
        }
    };

    const handleCancel = () => {
        setIsDateTimePickerVisible(false); // Hide picker on cancel
    };

    useEffect(() => {
        if (props.onSave) {
            props.onSave(handleSave);
        }
    }, [props.onSave]);

    let content;
    if (props.type === "text" || props.type === "multiLine" || props.type === "number") {
        content = ( <>
            <TextInput
                onEndEditing={props.onEndEditing !== undefined ? (event) => props.onEndEditing(event.nativeEvent.text) : () => {
                }}
                readOnly={props.readOnly}
                style={[
                    textTheme.bodyLarge,
                    styles.textInput,
                    {borderColor: error ? Colors.error : Colors.grey400},
                    props.type === "multiLine" ? {height: 100, textAlignVertical: "top", paddingVertical: 10} : {},
                    props.textInputStyle
                ]}
                placeholderTextColor={Colors.grey300}
                keyboardType={props.type === "number" ? "number-pad" : "default"}
                multiline={props.type === "multiLine"}
                value={props.value}
                defaultValue={props.defaultValue}
                placeholder={props.placeholder}
                onBlur={() => handleSave()}
                onChangeText={(text) => {
                    props.onChangeText(text);
                    if (error && props.validator && props.validator(text) === true) {
                        setError(false);
                        setErrorMessage("");
                    }
                }}
                cursorColor={props.cursorColor}
                onFocus={props.onFocus}
                secureTextEntry={props.secureTextEntry}
                scrollEnabled={props.scrollEnabled}
                editable={props.editable}
                selectTextOnFocus={props.selectTextOnFocus}
                onPress={props.onPress}
                maxLength={props.maxLength}

            />

            </>

        );
    } else if (props.type === "email") {
        content = (
            <TextInput
                onEndEditing={props.onEndEditing !== undefined ? (event) => props.onEndEditing(event.nativeEvent.text) : () => {
                }}
                readOnly={props.readOnly}
                placeholderTextColor={Colors.grey300}
                style={[
                    textTheme.bodyLarge,
                    styles.textInput,
                    {borderColor: error ? Colors.error : Colors.grey400},
                    props.type === "multiLine" ? {height: 100, textAlignVertical: "top", paddingVertical: 10} : {},
                    props.textInputStyle
                ]}
                autoCapitalize={false}
                keyboardType={props.type}
                multiline={props.type === "multiLine"}
                value={props.value}
                defaultValue={props.defaultValue}
                placeholder={props.placeholder}
                onBlur={() => handleSave()}
                onChangeText={(text) => {
                    props.onChangeText(text);
                    if (error && props.validator && props.validator(text) === true) {
                        setError(false);
                        setErrorMessage("");
                    }
                }}
            />
        );

    } else if (props.type === "price") {
        content = (
            <View style={[styles.priceInputContainer,
                {borderColor: error ? Colors.error : Colors.grey400},
            ]}>
                <FontAwesome style={styles.rupeeSymbol} name="rupee" size={20} color={Colors.grey600}/>
                <TextInput
                    onEndEditing={props.onEndEditing !== undefined ? (event) => props.onEndEditing(event.nativeEvent.text) : () => {
                    }}
                    readOnly={props.readOnly}
                    style={[
                        textTheme.bodyLarge,
                        styles.textInput,
                        {borderWidth: 0, marginVertical: 0, paddingHorizontal: 0},
                        props.textInputStyle,
                        {flex: 1}
                    ]}
                    placeholderTextColor={Colors.grey300}
                    keyboardType={"number-pad"}
                    value={props.value}
                    defaultValue={props.defaultValue}
                    placeholder={props.placeholder}
                    onBlur={() => handleSave()}
                    onChangeText={(text) => {
                        props.onChangeText(text);
                        if (error && props.validator && props.validator(text) === true) {
                            setError(false);
                            setErrorMessage("");
                        }
                    }}
                />
            </View>
        );

    } else if (props.type === "phoneNo") {
        content = (
            <>
                <DropdownModal
                    selectedValue={countryCode}
                    isVisible={isDropdownModalVisible}
                    onCloseModal={() => setIsDropdownModalVisible(false)}
                    onChangeValue={(value) => {
                        setCountryCode(value);
                        props.onChangeText([value, phoneNumber]);
                        setIsDropdownModalVisible(false);
                    }}
                    dropdownItems={["+91", "+74", "+423", "+983"]}
                />
                <View style={styles.phoneContainer}>
                    <PrimaryButton
                        buttonStyle={styles.countryCodeButton}
                        pressableStyle={styles.countryCodeButtonPressable}
                        onPress={() => setIsDropdownModalVisible(true)}
                    >
                        <Text style={[textTheme.bodyLarge]}>{countryCode}</Text>
                        <FontAwesome name="angle-down" size={24} color="black"/>
                    </PrimaryButton>
                    <TextInput
                        style={[
                            textTheme.bodyLarge,
                            styles.textInput,
                            styles.phoneNumberInput,
                            {borderColor: error ? Colors.error : Colors.grey400},
                        ]}
                        placeholderTextColor={Colors.grey300}
                        value={phoneNumber}
                        placeholder={props.placeholder}
                        onBlur={() => handleSave()}
                        onChangeText={(text) => {
                            setPhoneNumber(text);
                            props.onChangeText([countryCode, text]);
                            if (error && props.validator && props.validator(text) === true) {
                                setError(false);
                                setErrorMessage("");
                            }
                        }}
                        keyboardType="number-pad"



                    />
                </View>
            </>
        );
    } else if (props.type === "dropdown") {
        content = (
            <>
                <DropdownModal
                    selectedValue={props.value}
                    isVisible={isDropdownModalVisible}
                    onCloseModal={() => setIsDropdownModalVisible(false)}
                    onChangeValue={(value) => {
                        props.onChangeValue(value);
                        setIsDropdownModalVisible(false);
                    }}
                    object={props.object}
                    objectName={props.objectName}
                    dropdownItems={props.dropdownItems}
                />
                <PrimaryButton
                    buttonStyle={[styles.dropdownButton, props.dropdownButton]}
                    pressableStyle={[styles.dropdownButtonPressable, props.dropdownPressable]}
                    onPress={() => (props.dropdownOnPress !== undefined ?
                        props.dropdownOnPress ?
                            setIsDropdownModalVisible(true) :
                            setIsDropdownModalVisible(false) :
                        setIsDropdownModalVisible(true))

                }
                >

                    {props.object ? <Text style={[textTheme.bodyLarge]}>

                        {props.value === undefined || props.value === null || props.value === "" ? props.placeholder ? props.placeholder : "Select " + props.label : props.value.name}
                    </Text> : <Text style={[textTheme.bodyLarge, props.dropdownLabelTextStyle]} {...props.dropdownLabelTextProps} >
                        {props.value === undefined || props.value === null || props.value === "" ? props.placeholder ? props.placeholder : "Select " + props.label : props.value}
                    </Text>}
                    <FontAwesome name="angle-down" size={24} color="black"/>
                </PrimaryButton>
                {props.children}
            </>
        );
    } else if (props.type === "date") {
        content = (
            <>
                {(isDateTimePickerVisible) && (
                    <DateTimePickerModal
                        isVisible={props.readOnly ? false : isDateTimePickerVisible}       // Visibility state
                        mode="date"                              // Mode is set to "date"
                        maximumDate={props.maximumDate}          // Maximum date from props
                        minimumDate={props.minimumDate}          // Minimum date from props
                        date={props.value === undefined || props.value === null ? new Date() : new Date(props.value)} // Initial date
                        onConfirm={handleConfirm}                // Function called on date selection
                        onCancel={handleCancel}                  // Function called on cancel
                        themeVariant="light"
                        style={props.dateStyle}
                    />
                    // <RNDateTimePicker
                    // maximumDate={props.maximumDate}
                    // minimumDate={props.minimumDate}
                    //     value={props.value === undefined || props.value === null ? new Date(Date.now()) : new Date(props.value)}
                    //     mode="date"
                    //     display="default"
                    //     onChange={(event, selectedDate) => {
                    //         if (event.type === "dismissed") {
                    //             setIsDateTimePickerVisible(false);
                    //             return;
                    //         }
                    //         setIsDateTimePickerVisible(false);
                    //         if (selectedDate) {
                    //             props.onChangeValue(new Date(selectedDate.getTime()));
                    //         }
                    //     }}
                    // />
                )}
                <PrimaryButton
                    buttonStyle={[styles.dateTimeButtom, props.dateInputContainer, error ? {borderColor: Colors.error} : {}]}
                    pressableStyle={styles.dateTimeButtonPressable}
                    disableRipple={props.readOnly}
                    onPress={ props.readOnly ? () => {} : () => setIsDateTimePickerVisible(true)}
                    onLongPress={props.onLongPress}
                >
                    <Text
                        style={[textTheme.bodyLarge, styles.dateTimeButtonText, props.readOnly ? {color: Colors.grey400} : {}]}>
                        {props.value === undefined || props.value === null ? "Select " + props.label : formatDate(new Date(props.value))}
                    </Text>
                    <MaterialCommunityIcons
                        style={styles.dateTimeButtonIcon}
                        name="calendar-month-outline"
                        size={24}
                        color={Colors.grey600}
                    />
                </PrimaryButton>
            </>
        );
    } else if (props.type === "time") {
        content = (
            <>
                {(isDateTimePickerVisible) && (
                    <DateTimePickerModal
                        isVisible={props.readOnly ? false : isDateTimePickerVisible}       // Visibility state
                        mode="time"                              // Mode is set to "date"
                        date={props.value === undefined || props.value === null ? new Date() : new Date(props.value)} // Initial date
                        onConfirm={handleConfirm}                // Function called on date selection
                        onCancel={handleCancel}                  // Function called on cancel
                        themeVariant="light"
                        style={props.dateStyle}
                    />
                    // <RNDateTimePicker
                    // maximumDate={props.maximumDate}
                    // minimumDate={props.minimumDate}
                    //     value={props.value === undefined || props.value === null ? new Date(Date.now()) : new Date(props.value)}
                    //     mode="date"
                    //     display="default"
                    //     onChange={(event, selectedDate) => {
                    //         if (event.type === "dismissed") {
                    //             setIsDateTimePickerVisible(false);
                    //             return;
                    //         }
                    //         setIsDateTimePickerVisible(false);
                    //         if (selectedDate) {
                    //             props.onChangeValue(new Date(selectedDate.getTime()));
                    //         }
                    //     }}
                    // />
                )}
                <PrimaryButton
                    buttonStyle={[styles.dateTimeButtom, props.dateInputContainer, error ? {borderColor: Colors.error} : {}]}
                    pressableStyle={[styles.dateTimeButtonPressable]}
                    disableRipple={props.readOnly}
                    onPress={props.readOnly ? () => {} : () => setIsDateTimePickerVisible(true)}
                >
                    <Text
                        style={[textTheme.bodyLarge, styles.dateTimeButtonText, props.readOnly ? {color: Colors.grey400} : {}, props.labelTextStyle]}>
                        {props.value === undefined || props.value === null ? props.placeholder ? props.placeholder : "Select " + props.label : formatTime(new Date(props.value), "hh:mm pp")}
                    </Text>
                    <MaterialCommunityIcons
                        style={[styles.dateTimeButtonIcon]}
                        name="clock-outline"
                        size={24}
                        color={Colors.grey600}
                    />
                </PrimaryButton>
            </>
        );
    }

    return (
        <View style={[styles.commonContainer, props.flex !== undefined ? {flex: 1} : {}, props.container]}>
            {
                !checkNullUndefined(props.labelEnabled) &&
                <Text style={[textTheme.bodyMedium, styles.labelText, props.labelTextStyle]}>{props.label}{
                    checkNullUndefined(props.required) && props.required ?
                    <RequiredSymbol/> :
                ""}</Text>
            }
            {content}
            {
                props.maxLength ?
                    <View style={{flexDirection: error ? 'row' : "row-reverse", justifyContent: 'space-between'}}>
                        {error &&
                            <Text style={[textTheme.bodyMedium, styles.errorText, props.errorStyle]}>{errorMessage}</Text>}
                            <Text style={[textTheme.bodyMedium, {color: Colors.grey500}]}>{(checkNullUndefined(props.value) ?
                                props.value.length : 0) + " / " + props.maxLength} </Text>
                    </View>
                 :
                    error && <Text style={[textTheme.bodyMedium, styles.errorText, props.errorStyle]}>{errorMessage}</Text>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    commonContainer: {
        marginBottom: 15,
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
    errorText: {
        color: Colors.error,
        fontWeight: "500",
    },
    priceInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: Colors.grey400,
        borderRadius: 5,
        // paddingRight: 20,
        marginTop: 5,
        // marginBottom: 30,
    },
    rupeeSymbol: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 15,
        borderRightWidth: 1,
        borderRightColor: Colors.grey400,
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    countryCodeButton: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.grey400,
        backgroundColor: Colors.background,
    },
    countryCodeButtonPressable: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: 5,
        paddingVertical: 9,
    },
    phoneNumberInput: {
        flex: 1,
    },
    dropdownButton: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.grey400,
        backgroundColor: Colors.background,
        marginVertical: 5,
    },
    dropdownButtonPressable: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 9,
        paddingHorizontal: 20,
    },
    dateTimeButtom: {
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Colors.grey400,
        backgroundColor: Colors.background,
        marginVertical: 5,
    },
    dateTimeButtonPressable: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 0,
        paddingHorizontal: 0,
    },
    dateTimeButtonIcon: {
        borderLeftWidth: 1,
        borderLeftColor: Colors.grey400,
        height: "100%",
        paddingHorizontal: 10,
        paddingVertical: 9,
    },
    dateTimeButtonText: {
        paddingHorizontal: 20,
        paddingVertical: 9,
    }
});

export default CustomTextInput;
