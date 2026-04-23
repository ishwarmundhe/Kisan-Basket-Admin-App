import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Header from "../../../components/custom/header";
import { SEARCH_CUSTOMER_QUERY } from "../../../graphql/Query";
import { useLazyQuery } from "@apollo/client/react";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState, useEffect } from "react";
import { toast } from "sonner-native";
import { debounce } from "lodash";
import ListTable from "../../../components/custom/table";
import Ionicons from "react-native-vector-icons/Ionicons";
import { colors } from "../../../constant/Colors";
import ScreenLayout from "../ScreenLayout";
import { useTheme } from "../../../constant/ThemeContext";

const useStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create(
      {
        searchContainer: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          height: 48,
          backgroundColor: theme.primary,
          marginHorizontal: 16,
          marginTop: 10,
          marginBottom: 10,
        },
        searchInput: {
          flex: 1,
          marginLeft: 8,
          color: theme.text,
          fontSize: 15,
        },
        fab: {
          position: "absolute",
          right: 20,
          bottom: 30,
          backgroundColor: "#18181b",
          borderWidth: 1,
          borderColor: "#27272a",
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: "center",
          alignItems: "center",
          elevation: 6,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
      },
      [theme],
    );
  });
};

const CustomerDetailScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const [searchQuery, setSearchQuery] = useState("");
  const [customerData, setCustomerData] = useState([]);

  const [pageInfo, setPageInfo] = useState({
    hasNextPage: false,
    endCursor: null,
  });
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [customerDetails, { loading, error: orderListError }] = useLazyQuery(
    SEARCH_CUSTOMER_QUERY,
  );

  const handleAddCustomer = () => {
    navigation.navigate("createCustomer");
  };

  const fetchCustomers = async (query = "") => {
    try {
      const result = await customerDetails({
        variables: {
          first: 20,
          query: query,
          after: null,
        },
        fetchPolicy: "network-only",
      });
      setCustomerData(result?.data?.search?.edges || []);
      setPageInfo(
        result?.data?.search?.pageInfo || {
          hasNextPage: false,
          endCursor: null,
        },
      );
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  const loadMoreCustomers = async () => {
    if (isFetchingMore || !pageInfo.hasNextPage) return;

    setIsFetchingMore(true);
    try {
      const result = await customerDetails({
        variables: {
          first: 20,
          query: searchQuery,
          after: pageInfo.endCursor,
        },
        fetchPolicy: "network-only",
      });

      const newEdges = result?.data?.search?.edges || [];

      setCustomerData((prevData) => [...prevData, ...newEdges]);

      setPageInfo(
        result?.data?.search?.pageInfo || {
          hasNextPage: false,
          endCursor: null,
        },
      );
    } catch (err) {
      toast.error("Failed to load more customers");
    } finally {
      setIsFetchingMore(false);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((text) => {
        fetchCustomers(text);
      }, 500),
    [],
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  useFocusEffect(
    useCallback(() => {
      fetchCustomers(searchQuery);
      return () => {};
    }, []),
  );

  return (
    <ScreenLayout style={{ flex: 1 }}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.secondary || "#999"} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Customer..."
          placeholderTextColor={theme.secondary || "#A9A9A9"}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>

      <ListTable
        loading={loading && !isFetchingMore}
        orderListError={orderListError}
        customerData={customerData}
        navigation={navigation}
        onEndReached={loadMoreCustomers}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <ActivityIndicator
              size="small"
              color={theme.text}
              style={{ marginVertical: 16 }}
            />
          ) : null
        }
      />

      <TouchableOpacity style={styles.fab} onPress={handleAddCustomer}>
        <Ionicons name="person-add" size={20} color={"#FFFFFF"} />
      </TouchableOpacity>
    </ScreenLayout>
  );
};

export default CustomerDetailScreen;
