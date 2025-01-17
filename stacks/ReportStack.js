import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SalesListReport from '../screens/Reports/SalesListReport';
import { reportStackDisplay } from '../data/ReportData';
import { BackButton } from './StaffManagementStack';

const ReportStack = ({ navigation }) => {
    const Stack = createNativeStackNavigator();
    return (
        <Stack.Navigator initialRouteName='ReportScreen' screenOptions={{ headerShown: true }}>
            <Stack.Screen name='ReportScreen' component={SalesListReport} options={{
                headerTitle: 'Reports',
                headerTitleAlign: 'center',
                headerShown: true, headerLeft: () => <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
                    <Image
                        source={require('../assets/icons/drawerIcons/drawer.png')}
                        style={{ width: 24, height: 24 }}
                    />
                </TouchableOpacity>,
            }} />
            {
                reportStackDisplay.map((item) => item.data.map((dataItem, index) => (
                    <Stack.Screen name={dataItem.navigation} key={index} component={dataItem.component} options={{
                        headerTitle: dataItem.title,
                        headerTitleAlign: 'center',
                        headerShown: true,
                        headerLeft: () => <BackButton />,
                    }} 
                    initialParams={{
                        listName: dataItem?.listName,
                        cardEnabled: dataItem?.cardEnabled,
                        apiFunction: dataItem?.apiFunction,
                        apiCountName: dataItem?.apiCountName,
                        tableHeaderList: dataItem?.tableHeader,
                        salesListWidthHeader: dataItem?.salesListWidthHeader,
                        transformTableData: dataItem?.transformTableData,
                        searchEnabled: dataItem?.searchEnabled,
                        searchPlaceholder: dataItem?.searchPlaceholder,
                        cardTitleData: dataItem?.cardTitleData,
                        cardValueList: dataItem?.cardValueList,
                        cardCurrencyList: dataItem?.cardCurrencyList,
                        initialCardValue: dataItem?.initialCardValue,
                        additionalRowEnabled: dataItem?.additionalRowEnabled,
                        initialTotalRow: dataItem?.initialTotalRow,
                    }}
                    />
                )))
            }
        </Stack.Navigator>
    )
}

export default ReportStack

const styles = StyleSheet.create({})