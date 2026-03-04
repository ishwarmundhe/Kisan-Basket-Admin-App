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
import ScreenLayout from "../../screens/app/ScreenLayout";
import {
  SEARCH_CUSTOMER_QUERY,
  GET_SHIPPING_METHODS,
  CUSTOMER_ADDRESSES,
} from "../../graphql/Query";
import {
  SHIPPING_METHOD_UPDATE,
  ORDER_DRAFT_UPDATE,
} from "../../graphql/Mutation";
import { useTheme } from "../../constant/ThemeContext";

const useStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
      },
      input: {
        height: 48,
        backgroundColor: theme.primary, // Zinc 900 inset look
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 10,
        paddingHorizontal: 12,
        borderColor: theme.border, // Zinc 800
        color: theme.text, // Zinc 50
        fontSize: 15,
      },
      listWrapper: {
        backgroundColor: theme.primary,
      },
      listContent: {
        gap: 10,
        paddingBottom: 20,
      },
      selectedVarient: {
        padding: 12,
        borderWidth: 1.5,
        borderRadius: 8,
      },
      customerName: {
        flexDirection: "row",
        gap: 6,
        marginTop: 4,
        alignItems: "center",
      },
      footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        backgroundColor: theme.primary,
      },
      backButton: {
        flex: 1,
        backgroundColor: theme.primary,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        padding: 12,
        marginRight: 10,
        alignItems: "center",
        justifyContent: "center",
      },
      backButtonText: {
        fontWeight: "600",
        color: theme.text,
      },
      confirmButton: {
        flex: 1,
        backgroundColor: theme.textSecondary, // White (Zinc 50)
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
      },
      confirmButtonDisabled: {
        backgroundColor: theme.border, // Muted Zinc 800
        opacity: 0.5,
      },
      confirmButtonText: {
        color: theme.background, // Black (Zinc 950)
        fontSize: 16,
        fontWeight: "700",
      },
      statusText: {
        color: theme.secondary,
        fontSize: 14,
        marginVertical: 5,
        textAlign: "center",
      },
    });
  }, [theme]);
};

const CustomerList = ({
  order_id,
  CancelBottomSheet,
  customerPersonalInfo,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = useStyle(theme);

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
  const [shippingMethodUpdate] = useMutation(SHIPPING_METHOD_UPDATE);
  const [updateOrderDraft] = useMutation(ORDER_DRAFT_UPDATE);

  const searchCustomerResults = searchCustomerData?.search?.edges ?? [];
  const hasSearchResults = searchQuery.trim().length > 0 && !customerLoading;
  const isConfirmDisabled = !selectedCustomer?.id || loading;

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        searchCustomers({
          variables: { first: 20, query: query || "", after: null },
        });
      }, 300),
    [searchCustomers],
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  useEffect(() => {
    if (order_id) loadInitialCustomers();
  }, [order_id]);

  const loadInitialCustomers = () =>
    searchCustomers({ variables: { first: 20, query: "", after: null } });

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.length === 0 || text.length >= 2) debouncedSearch(text);
  };

  const handleCustomerSelect = useCallback(
    (customer) => {
      Keyboard.dismiss();
      setSelectedCustomer(customer);
      customerPersonalInfo(customer);
    },
    [customerPersonalInfo],
  );

  const handleCustomerSelection = async () => {
    if (!selectedCustomer?.id || !order_id) return;
    setLoading(true);
    try {
      await updateOrderDraft({
        variables: { id: order_id, input: { user: selectedCustomer.id } },
      });
      const { data: customerData } = await singleCustomerAddresses({
        variables: { id: selectedCustomer.id },
      });
      const customerAddresses = customerData?.user?.addresses || [];

      if (customerAddresses.length > 0) {
        const address = customerAddresses[0];
        const payload = {
          firstName: address.firstName,
          lastName: address.lastName,
          phone: address.phone,
          streetAddress1: address.streetAddress1,
          city: address.city,
          postalCode: address.postalCode,
          country: address.country.code,
          countryArea: "Maharashtra",
        };
        await updateOrderDraft({
          variables: {
            id: order_id,
            input: { billingAddress: payload, shippingAddress: payload },
          },
        });

        const { data: sData } = await getShippingMethods({
          variables: { id: order_id },
        });
        const sMethodId = sData?.order?.shippingMethods?.[0]?.id;
        if (sMethodId)
          await shippingMethodUpdate({
            variables: { id: order_id, input: { shippingMethod: sMethodId } },
          });
      }

      toast.success("Customer selected");
      CancelBottomSheet();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCustomerItem = useCallback(
    ({ item }) => {
      const customer = item.node;
      const isSelected = customer?.id === selectedCustomer?.id;

      return (
        <TouchableOpacity
          style={[
            styles.selectedVarient,
            {
              borderColor: isSelected ? theme.deliveryDate : theme.border,
              backgroundColor: isSelected
                ? `${theme.deliveryDate}15`
                : theme.primary,
            },
          ]}
          onPress={() => handleCustomerSelect(customer)}
        >
          <Text
            style={{
              color: theme.heading,
              fontWeight: isSelected ? "600" : "400",
            }}
          >
            {`Address: ${customer?.addresses?.[0]?.streetAddress1 || "N/A"}`}
          </Text>
          <Text style={{ color: theme.secondary, fontSize: 13, marginTop: 4 }}>
            {`Phone: ${customer?.phoneNumber || "N/A"}`}
          </Text>
          <View style={styles.customerName}>
            <Text style={{ color: theme.secondary, fontSize: 13 }}>
              {`Name: ${customer.firstName} ${customer.lastName}`}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [selectedCustomer, theme, styles],
  );

  return (
    <ScreenLayout paddingHorizontal={5}>
      <TextInput
        placeholder="Search Customer"
        placeholderTextColor={theme.secondary}
        style={styles.input}
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {customerLoading && (
        <ActivityIndicator
          size="small"
          color={theme.text}
          style={{ margin: 10 }}
        />
      )}

      {hasSearchResults && searchCustomerResults.length === 0 && (
        <Text style={styles.statusText}>No customers found.</Text>
      )}

      <FlatList
        keyboardShouldPersistTaps="always"
        style={styles.listWrapper}
        contentContainerStyle={styles.listContent}
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
            isConfirmDisabled && styles.confirmButtonDisabled,
          ]}
          disabled={isConfirmDisabled}
        >
          {loading ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScreenLayout>
  );
};

export default React.memo(CustomerList);
