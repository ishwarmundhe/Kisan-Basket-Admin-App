import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { toast } from "sonner-native";
import { debounce } from "lodash";
import ScreenLayout from "../screens/app/ScreenLayout";
import {
  SEARCH_CUSTOMER_QUERY,
  GET_SHIPPING_METHODS,
  CUSTOMER_ADDRESSES,
} from "../graphql/Query";
import {
  SHIPPING_METHOD_UPDATE,
  ORDER_DRAFT_UPDATE,
} from "../graphql/Mutation";
import { colors } from "../constant/Colors";
import { useTheme } from "../constant/ThemeContext";
const useStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create(
      {
        footer: {
          // backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 12,
        },
        backButton: {
          flex: 1,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 6,
          padding: 12,
          marginRight: 8,
          alignItems: "center",
        },
        backButtonText: { fontWeight: "500", color: theme.text },
        confirmButton: {
          flex: 1,
          backgroundColor: "#2E7D32",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        },
        confirmButtonText: {
          color: theme.text,
          fontSize: 16,
          fontWeight: "500",
        },
        selectedVarient: {
          padding: 10,
          borderWidth: 1.5,
          borderRadius: 8,
        },
        customerName: { flexDirection: "row", gap: 5 },
        input: {
          borderWidth: 0.5,
          borderRadius: 8,
          marginVertical: 10,
          paddingLeft: 10,
          borderColor: theme.text,
          color: theme.text,
        },
      },
      [theme]
    );
  });
};
const CustomerList = ({
  order_id,
  CancelBottomSheet,
  customerPersonalInfo,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = useStyle(theme);

  // GraphQL Queries
  const [
    searchCustomers,
    {
      data: searchCustomerData,
      loading: customerLoading,
      error: searchCustomerError,
    },
  ] = useLazyQuery(SEARCH_CUSTOMER_QUERY);

  const [getShippingMethods] = useLazyQuery(GET_SHIPPING_METHODS);
  const [singleCustomerAddresses] = useLazyQuery(CUSTOMER_ADDRESSES);

  // GraphQL Mutations
  const [shippingMethodUpdate] = useMutation(SHIPPING_METHOD_UPDATE);
  const [updateOrderDraft] = useMutation(ORDER_DRAFT_UPDATE);

  // Derived data
  const searchCustomerResults = searchCustomerData?.search?.edges ?? [];
  const hasSearchResults = searchQuery.trim().length > 0 && !customerLoading;
  const isConfirmDisabled = !selectedCustomer?.id || loading;

  // Debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        searchCustomers({
          variables: {
            first: 20,
            query: query || "",
            after: null,
          },
        });
      }, 300), // 300ms delay
    [searchCustomers]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Effects
  useEffect(() => {
    if (order_id) {
      loadInitialCustomers();
    }
  }, [order_id]);

  // Helper functions
  const loadInitialCustomers = () => {
    searchCustomers({
      variables: {
        first: 20,
        query: "",
        after: null,
      },
    });
  };

  const handleSearch = useCallback(
    (text) => {
      setSearchQuery(text);

      // Only search if query length is 0 or >= 2 characters
      if (text.length === 0 || text.length >= 2) {
        debouncedSearch(text);
      }
    },
    [debouncedSearch]
  );

  const transformAddress = (address) => ({
    firstName: address.firstName,
    lastName: address.lastName,
    phone: address.phone,
    companyName: address.companyName,
    streetAddress1: address.streetAddress1,
    streetAddress2: address.streetAddress2,
    city: address.city,
    cityArea: address.cityArea,
    postalCode: address.postalCode,
    country: address.country.code,
    countryArea: "Maharashtra",
  });

  const handleCustomerSelect = useCallback(
    (customer) => {
      Keyboard.dismiss();
      setSelectedCustomer(customer);
      customerPersonalInfo(customer);
    },
    [customerPersonalInfo]
  );

  const handleShippingMethodUpdate = async (orderId, shippingMethodId) => {
    try {
      await shippingMethodUpdate({
        variables: {
          id: orderId,
          input: {
            shippingMethod: shippingMethodId,
          },
        },
      });
    } catch (error) {
      console.error("Shipping method update error:", error);
      throw new Error("Failed to update shipping method");
    }
  };

  const updateOrderWithAddress = async (orderId, address) => {
    const result = await updateOrderDraft({
      variables: {
        id: orderId,
        input: {
          billingAddress: address,
          shippingAddress: address,
        },
      },
    });

    const errors = result?.data?.draftOrderUpdate?.errors || [];
    if (errors.length > 0) {
      throw new Error(errors[0]?.message || "Address update failed");
    }

    return result;
  };

  const fetchAndUpdateShippingMethod = async () => {
    const { data: shippingData } = await getShippingMethods({
      variables: { id: order_id },
    });

    const shippingMethodId = shippingData?.order?.shippingMethods?.[0]?.id;

    if (!shippingMethodId) {
      throw new Error("Shipping method not found");
    }

    await handleShippingMethodUpdate(order_id, shippingMethodId);
  };

  const handleCustomerSelection = async () => {
    if (!selectedCustomer?.id || !order_id) return;

    setLoading(true);

    try {
      // Step 1: Attach customer to order
      const customerUpdateResult = await updateOrderDraft({
        variables: {
          id: order_id,
          input: {
            user: selectedCustomer.id,
          },
        },
      });

      const customerErrors =
        customerUpdateResult?.data?.draftOrderUpdate?.errors || [];
      if (customerErrors.length > 0) {
        toast.error(customerErrors[0]?.message || "Failed to attach customer");
        return;
      }

      // Step 2: Fetch customer addresses
      const { data: customerData } = await singleCustomerAddresses({
        variables: { id: selectedCustomer.id },
      });

      console.log(customerData);

      const customerAddresses = customerData?.user?.addresses || [];

      if (customerAddresses.length === 0) {
        toast.warning("No address found for selected customer");
        return;
      }

      // Step 3: Transform and update address
      const payloadAddress = transformAddress(customerAddresses[0]);
      await updateOrderWithAddress(order_id, payloadAddress);

      // Step 4: Update shipping method
      await fetchAndUpdateShippingMethod();

      toast.success("Customer & Address successfully attached");
      await CancelBottomSheet();
    } catch (error) {
      console.error("Customer selection error:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (error) => {
    if (error.graphQLErrors) {
      toast.error("GraphQL Error: " + error.graphQLErrors[0]?.message);
    } else if (error.networkError) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error(error.message || "Something went wrong!");
    }
  };

  const renderCustomerItem = useCallback(
    ({ item }) => {
      const customer = item.node;
      const isSelected = customer?.id === selectedCustomer?.id;
      const activeText = isSelected ? colors.HEADING_COLOR : theme.text;

      return (
        <TouchableOpacity
          style={[
            styles.selectedVarient,
            {
              borderColor: isSelected
                ? colors.CARD_BORDER
                : colors.CARD_BACKGROUND,
              backgroundColor: isSelected
                ? colors.CUSTOMER_LIST_CARD
                : colors.BOTTOMSHEET,
            },
          ]}
          onPress={() => handleCustomerSelect(customer)}
        >
          <Text style={{ color: activeText }}>
            {`Address: ${customer?.addresses?.[0]?.streetAddress1 || "N/A"}`}
          </Text>
          <Text style={{ color: activeText }}>
            {`Phone: ${customer?.phoneNumber || "N/A"}`}
          </Text>
          <View style={styles.customerName}>
            <Text style={{ color: activeText }}>
              {`Name: ${customer.firstName}`}
            </Text>
            <Text style={{ color: activeText }}>{`${customer.lastName}`}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedCustomer, handleCustomerSelect]
  );

  return (
    <ScreenLayout paddingHorizontal={5}>
      {searchCustomerError && (
        <Text style={{ color: "red" }}>{searchCustomerError.message}</Text>
      )}

      <TextInput
        placeholder="Search Customer"
        placeholderTextColor={theme.text}
        style={styles.input}
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {customerLoading && <Text style={{ color: theme.text }}>Loading...</Text>}

      {hasSearchResults && searchCustomerResults.length === 0 && (
        <Text style={{ textAlign: "center", color: theme.text }}>
          No customers found.
        </Text>
      )}

      <FlatList
        keyboardShouldPersistTaps="always"
        contentContainerStyle={{ gap: 10, marginBottom: 10 }}
        data={searchCustomerResults}
        keyExtractor={(item) => item?.node?.id}
        renderItem={renderCustomerItem}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={CancelBottomSheet}>
          <Text style={styles.backButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCustomerSelection}
          style={[
            styles.confirmButton,
            isConfirmDisabled && { backgroundColor: "#ccc" },
          ]}
          disabled={isConfirmDisabled}
        >
          {loading ? (
            <ActivityIndicator color={theme.text} />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};
export default React.memo(CustomerList);
