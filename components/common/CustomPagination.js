import PrimaryButton from "../../ui/PrimaryButton";
import { Text, View, StyleSheet } from "react-native";
import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Colors from "../../constants/Colors";

export default function CustomPagination(props) {

    const [upperCount, setUpperCount] = useState(10);
    const [lowerCount, setLowerCount] = useState(1);
    console.log("props.currentCount");
    console.log(props.currentCount);
    
    useEffect(() => {
        props.refreshOnChange();
        if (lowerCount === 1) {
            setIsBackwardButtonDisabled(true);
        } else {
            setIsBackwardButtonDisabled(false);
        }

        if (upperCount === props.totalCount) {
            setIsForwardButtonDisabled(true);
        } else {
            setIsForwardButtonDisabled(false);
        }
    }, [lowerCount, upperCount]);

    useEffect(() => {
        if(props.isFetching === false){
            setLowerCount(1);
            if (props.maxEntry > props.currentCount) {
                setUpperCount(props.currentCount);
            } else {
                setUpperCount(props.maxEntry);
            }
            // console.log("1");   
            props.resetPageNo();
            props.refreshOnChange();
        }
    }, [props.maxEntry
        // ,props.isFetching
    ]);

    const [isBackwardButtonDisabled, setIsBackwardButtonDisabled] = useState(false);
    const [isForwardButtonDisabled, setIsForwardButtonDisabled] = useState(false);

    function forwardButtonHandler() {
        if (!isForwardButtonDisabled) {
            let lowerCountAfter = lowerCount + props.maxEntry;
            let upperCountAfter = upperCount + props.maxEntry;

            if (upperCountAfter > props.totalCount && lowerCountAfter < 0) {
                setLowerCount(props.totalCount - props.maxEntry);
                setUpperCount(props.totalCount);
            } else if (upperCountAfter <= props.totalCount && lowerCountAfter >= 0) {
                setLowerCount(lowerCountAfter);
                setUpperCount(upperCountAfter);
                props.incrementPageNumber();
            } else if (upperCountAfter > props.totalCount && upperCountAfter >= 0) {
                props.incrementPageNumber();
                setUpperCount(props.totalCount);
                setLowerCount(lowerCountAfter)
            } else if (lowerCountAfter < 0 && upperCountAfter < props.totalCount) {
                props.incrementPageNumber();
                setUpperCount(upperCountAfter)
                setLowerCount(0)
            }
        }
    }

    function backwardButtonHandler() {
        if (!isBackwardButtonDisabled) {
            let lowerCountAfter = lowerCount - props.maxEntry;
            let upperCountAfter = upperCount - props.maxEntry;

            if (lowerCountAfter === 1 && upperCountAfter < props.maxEntry) {
                setLowerCount(1);
                setUpperCount(props.maxEntry);
                props.decrementPageNumber();
            } else if (lowerCountAfter < 1 && upperCountAfter < props.maxEntry) {
                setLowerCount(1);
                setUpperCount(props.maxEntry);
                props.decrementPageNumber();
            }
            else if (upperCountAfter >= 1 && upperCountAfter >= props.maxEntry) {
                setLowerCount(lowerCountAfter);
                setUpperCount(upperCountAfter - lowerCountAfter === props.maxEntry ? upperCountAfter : lowerCountAfter + props.maxEntry - 1);
                props.decrementPageNumber();
            }
        }
    }

    return (
        <View style={styles.pagination}>
            <PrimaryButton
                pressableStyle={styles.entryButton}
                buttonStyle={styles.entryButtonContainer}
                onPress={() => props.setIsModalVisible(true)}
            >
                <View style={styles.buttonInnerContainer}>
                    <Text style={styles.entryText}>
                        {props.maxEntry}
                    </Text>
                    <AntDesign name="caretdown" size={14} color="black" style={{ marginLeft: 16 }} />
                </View>
            </PrimaryButton>

            <View style={styles.paginationInnerContainer}>
                <Text style={styles.pagingText}>
                    {lowerCount < 0 ? 0 : lowerCount} - {props.currentCount} of {props.totalCount}
                </Text>
                <PrimaryButton
                    buttonStyle={[isBackwardButtonDisabled ? [styles.pageBackwardButton, styles.disabled] : [styles.pageBackwardButton]]}
                    onPress={backwardButtonHandler}
                >
                    <FontAwesome6 name="angle-left" size={24} color="black" />
                </PrimaryButton>
                <PrimaryButton
                    buttonStyle={[isForwardButtonDisabled ? [styles.pageForwardButton, styles.disabled] : [styles.pageForwardButton]]}
                    onPress={forwardButtonHandler}
                >
                    <FontAwesome6 name="angle-right" size={24} color="black" />
                </PrimaryButton>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pagination: {
        height: 90,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'space-between',
    },
    disabled: {
        opacity: 0.4,
    },
    entryText: {},
    entryButton: {},
    entryButtonContainer: {
        borderWidth: 1,
        borderColor: Colors.grey250,
        marginLeft: 16,
        backgroundColor: Colors.white,
    },
    paginationInnerContainer: {
        flexDirection: 'row',
        marginRight: 16,
        alignItems: "center",
    },
    pageForwardButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey250,
    },
    pageBackwardButton: {
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey250,
        marginHorizontal: 16
    },
    buttonInnerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: "center"
    },
    pagingText: {},
})