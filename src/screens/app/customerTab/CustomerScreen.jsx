import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Header from "../../../components/header";
import { SEARCH_CUSTOMER_QUERY } from "../../../graphql/Query";
import { useLazyQuery } from "@apollo/client/react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner-native";
import ListTable from "../../../components/table";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../../constant/Colors";
import ScreenLayout from "../ScreenLayout";
import { useTheme } from "../../../constant/ThemeContext";
const useStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create(
      {
        fab: {
          position: "absolute",
          right: 20,
          bottom: 30,
          backgroundColor: theme.textSecondary,
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
        },
      },
      [theme]
    );
  });
};
const CustomerDetailScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const [customerDetails, { loading, error: orderListError }] = useLazyQuery(
    SEARCH_CUSTOMER_QUERY
  );
  const [customerData, setCustomerData] = useState([]);
  const handleAddCustomer = () => {
    navigation.navigate("createCustomer");
  };

  useFocusEffect(
    useCallback(() => {
      const fetchCustomers = async () => {
        try {
          const result = await customerDetails({
            variables: {
              first: 100,
              query: "",
              after: null,
            },
            fetchPolicy: "network-only",
          });
          console.log("Customer Data", result);

          setCustomerData(result?.data?.search?.edges || []);

          // console.log("customer data-->>", JSON.stringify(result?.data?.search?.edges));
        } catch (err) {
          toast.error("Something went wrong", err?.message);
        }
      };
      fetchCustomers();
      return () => {};
    }, [])
  );
  return (
    <ScreenLayout style={{ flex: 1 }}>
      <ListTable
        loading={loading}
        orderListError={orderListError}
        customerData={customerData}
        navigation={navigation}
      />
      <TouchableOpacity style={styles.fab} onPress={handleAddCustomer}>
        <Ionicons name="person-add" size={20} color={"#FFFFFF"} />
      </TouchableOpacity>
    </ScreenLayout>
  );
};
export default CustomerDetailScreen;
