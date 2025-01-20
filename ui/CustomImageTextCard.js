import { Image, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Colors from '../constants/Colors'

const CustomImageTextCard = ({ containerStyle, imgSource, imageStyle, imgTextContainerStyle, title, titleStyle, value, valueContainerStyle, valueStyle, enableRupee = false, rupeeArray = [], onPress = () => { }, disabled = false }) => {
    return (
        <TouchableOpacity onPress={()=>onPress(title)} style={[styles.container, containerStyle]} disabled={disabled}>
            <View style={[styles.imgContainer, imgTextContainerStyle]}>
                {
                    imgSource !== undefined ?
                        <Image
                            source={imgSource}
                            style={imageStyle}
                        />
                        : null
                }
                <Text style={titleStyle}>
                    {title}
                </Text>
            </View>
            <View style={valueContainerStyle}>
                <Text style={valueStyle}>
                    {enableRupee && rupeeArray.find(item => item === title) ? '₹ ' : null}
                    {enableRupee && rupeeArray.length === 0 ? '₹ ' : null}
                    {value}
                </Text>
            </View>
        </TouchableOpacity>
    )
}

export default CustomImageTextCard

const styles = StyleSheet.create({
    container: {
        borderWidth: 1,
        borderColor: Colors.black,
        padding: 10
    },
    imgContainer: {
        flexDirection: 'row'
    }
})