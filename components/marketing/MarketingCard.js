import {Text, View, StyleSheet, Image} from "react-native";
import textTheme from "../../constants/TextTheme";
import Colors from "../../constants/Colors";
import PrimaryButton from "../../ui/PrimaryButton";

export default function MarketingCard(props) {
    return (<PrimaryButton buttonStyle={styles.marketingCard} pressableStyle={styles.pressableStyle} onPress={props.onPress}>
        <View style={[styles.avatarContainer]}>
            <View style={[styles.avatar, {backgroundColor: props.avatarBackgroundColor ? props.avatarBackgroundColor : Colors.highlight}]}>
                <Image source={props.source} style={styles.icon} />
            </View>
        </View>
        <View style={styles.contentContainer}>
            <Text style={[textTheme.titleSmall]}>{props.title}</Text>
            <Text style={[textTheme.bodyMedium, {marginTop: 12}]}>{props.content}</Text>
        </View>

    </PrimaryButton>)
}

const styles = StyleSheet.create({
    marketingCard: {
        borderWidth :1,
        borderRadius: 8,
        borderColor: Colors.grey400,
        backgroundColor: Colors.white,
    },
    pressableStyle: {
        flexDirection: 'row',
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    avatarContainer: {
        // width:'20%',
        justifyContent:'center',
        // alignItems: 'flex-end',
        marginLeft: 32


    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 45,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width:25,
        height:25,
    },
    contentContainer: {
        paddingHorizontal: 18,
        paddingVertical: 24,
        flex: 1
    }
})