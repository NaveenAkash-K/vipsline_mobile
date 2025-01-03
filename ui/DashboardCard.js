import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";
import Colors from "../constants/Colors";

const DashboardCard = (props) => {
  const getFontSize = (value) => {
    if (value > 1000000) {
      return 12;
    } else if (value > 100000) {
      return 14;
    } else {
      return 16;
    }
  };
  return (
    <View style={styles.cardWrapper}>
      <View style={[styles.leftBar, { backgroundColor: props.color }]}></View>
      <View style={styles.cardContent}>
        <View style={styles.header}>
          <Image source={props.icon} style={styles.icon} />
          {props.popoverText !== undefined ?
            <PoppoverIconText popoverText={props.popoverText} title={props.title} popoverOffset={Platform.OS === "ios" ? 0 : -32} titleStyle={styles.title} />
            :
            <Text style={[styles.title]}>{props.title}</Text>
          }
        </View>
        <Text style={[styles.count, { fontSize: getFontSize(props.value) }]}>
          {props.title === "Total Sales Value" || props.title === "Avg. Bill Value"
            ? "₹ " + props.value
            : props.value}
        </Text>
      </View>
    </View>
  );
};

export default DashboardCard;

const styles = StyleSheet.create({
  cardWrapper: {
    flexDirection: "row",
    borderRadius: 10,
    backgroundColor: "white",
    overflow: "hidden",
    width: "45%",
    borderWidth:1,
    borderColor:Colors.grey250,
    // Adding shadow
    // elevation: 3,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
  },
  leftBar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 15,
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  title: {
    color: "#101928",
    opacity: 0.6,
    fontSize: 14,
  },
  count: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#101928",
  },
  //   calculatepriceRow: {
  //     flexDirection: "row",
  //     justifyContent: "space-between",
  //     paddingVertical: 5,
  //     paddingHorizontal: 5,
  // },
  title: {
    color: "#101928",
    opacity: 0.6,
    fontSize: 13,
    textAlign: "center"
  },
});
