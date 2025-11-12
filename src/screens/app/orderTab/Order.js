import React, {
  useCallback,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Card, Text, FAB } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { debounce } from "lodash";
import ScreenLayout from "../ScreenLayout";
import ShimmerPlaceholder from "../../../components/shimmerLoaderPlaceholder";
import ErrorMessage from "../../../components/errorMessage";
import { colors } from "../../../constant/Colors";
import { ORDER_LIST_QUERY, MONTH_TOTAL_ORDERS } from "../../../graphql/Query";
import { ORDER_DRAFT_CREATE } from "../../../graphql/Mutation";
import { generateAndShareInvoice } from "../../../utils/Invoice";
import { AuthContext } from "../../../constant/AuthProvider";
import { toast } from "sonner-native";
import { useTheme } from "../../../constant/ThemeContext";
import DashboardStats from "../productsTab/DashboardStats";
import moment from "moment";

// Status color mapping
const STATUS_COLORS = {
  CANCELED: colors.CANCELED,
  UNCONFIRMED: colors.UNCONFIRMED,
  UNFULFILLED: colors.UNFULFILLED,
  DEFAULT: colors.WHITE,
};

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        searchCreateContainer: {
          flexDirection: "row",
          gap: 10,
        },
        messageContainer: {
          alignItems: "center",
          marginTop: 30,
        },
        errorText: {
          fontSize: 16,
          color: theme.text,
        },
        card: {
          borderRadius: 12,
          padding: 12,
          marginHorizontal: 4,
          backgroundColor: theme.primary,
          borderColor: theme.border,
          borderWidth: 1,
        },
        cardInner: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        cardTitle: {
          color: theme.heading,
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 4,
        },
        cardText: {
          color: theme.text,
          fontSize: 14,
        },
        deliveryText: {
          marginTop: 6,
          color: theme.deliveryDate,
          fontWeight: "bold",
          fontSize: 14,
        },
        shareButton: {
          backgroundColor: theme.shareButtonColor,
          padding: 8,
          borderRadius: 20,
        },
        shimmerCard: {
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 12,
          padding: 12,
          marginBottom: 12,
        },
        searchContainer: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          paddingHorizontal: 10,
          backgroundColor: theme.primary,
        },
        searchInput: {
          flex: 1,
          color: theme.heading,
        },
        dateInput: {
          padding: 12,
          flexDirection: "row",
          gap: 10,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          marginTop: 20,
          backgroundColor: theme.primary,
        },
        datePickerStyle: {
          color: theme.text,
          fontWeight: "500",
        },
        createButton: {
          borderWidth: 1,
          borderColor: theme.border,
          paddingHorizontal: 20,
          borderRadius: 8,
          paddingVertical: 12,
          backgroundColor: theme.textSecondary,
          justifyContent: "center",
          alignItems: "center",
        },
        createButtonText: {
          color: theme.heading,
          fontWeight: "700",
          textAlign: "center",
        },
        fab: {
          position: "absolute",
          margin: 16,
          right: 0,
          bottom: 10,
          backgroundColor: theme.primary,
          borderWidth: 1.2,
          borderColor: theme.border,
        },
        flatListContent: {
          gap: 10,
          paddingTop: 20,
          paddingBottom: 40,
        },
        addressTitle: {
          color: theme.heading,
          fontSize: 14,
          fontWeight: "bold",
          marginBottom: 4,
        },
      }),
    [theme]
  );

const OrderItem = React.memo(
  ({ item, onPress, onShare, invoiceLoadder, selectedOrderId }) => {
    const order = item?.node;
    const fullName = `${order?.billingAddress?.firstName ?? ""} ${
      order?.billingAddress?.lastName ?? ""
    }`.trim();
    const addressLine1 = order?.billingAddress?.streetAddress1 ?? "";
    const activeLoader = selectedOrderId === order.id;
    const statusColor = STATUS_COLORS[order?.status] || STATUS_COLORS.DEFAULT;
    const { theme } = useTheme();
    const styles = useStyle(theme);

    return (
      <TouchableOpacity onPress={() => onPress(order?.id)}>
        <Card style={styles.card}>
          <View style={styles.cardInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{addressLine1}</Text>
              <Text style={styles.cardText}>
                Name: <Text style={styles.addressTitle}>{fullName}</Text>
              </Text>
              <Text style={styles.cardText}>
                Status:{" "}
                <Text style={{ color: statusColor, fontWeight: "700" }}>
                  {order?.status}
                </Text>
              </Text>
              <Text style={styles.cardText}>
                Date: {order?.created?.split("T")[0]}
              </Text>
              <Text style={styles.cardText}>
                Amount: {order?.total?.gross?.currency}{" "}
                {order?.total?.gross?.amount}
              </Text>
              <Text style={styles.deliveryText}>
                Delivery date: {order?.deliveryDate ?? "-"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => onShare(order?.id, order?.status)}
            >
              {invoiceLoadder && activeLoader ? (
                <ActivityIndicator size="small" color={colors.WHITE} />
              ) : (
                <Ionicons
                  name="share-social-outline"
                  size={20}
                  color={colors.WHITE}
                />
              )}
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }
);

const LoadingSkeleton = ({ theme }) => {
  const styles = useStyle(theme);
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
      {[...Array(6)].map((_, index) => (
        <View key={index} style={styles.shimmerCard}>
          <ShimmerPlaceholder height={30} width="60%" borderRadius={6} />
          <ShimmerPlaceholder height={20} width="60%" borderRadius={6} />
          <View style={{ marginTop: 5 }}>
            <ShimmerPlaceholder height={16} width="80%" borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default function ProductSelectionScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const { globalRefresh, setGlobalRefresh } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [invoiceLoadder, setInvoiceLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const getCurrentMonthDateRange = useMemo(
    () => ({
      gte: moment().startOf("month").format("YYYY-MM-DD"),
      lte: moment().endOf("month").format("YYYY-MM-DD"),
    }),
    []
  );

  const todayDate = useMemo(
    () => selectedDate?.toLocaleDateString("en-CA"),
    [selectedDate]
  );

  const [
    fetchOrders,
    { data: orderList, loading, error: orderListError, refetch },
  ] = useLazyQuery(ORDER_LIST_QUERY);

  const [createDraftOrder, { loading: draftOrderLoading }] =
    useMutation(ORDER_DRAFT_CREATE);

  const { data: monthlyOrdersData } = useQuery(MONTH_TOTAL_ORDERS, {
    variables: getCurrentMonthDateRange,
  });

  const orders = useMemo(() => orderList?.orders?.edges ?? [], [orderList]);
  const hasOrders = orders.length > 0;
  const currentMonthOrderCount = monthlyOrdersData?.orders?.totalCount ?? 0;

  const debouncedSearch = useMemo(
    () =>
      debounce((query) => {
        const safeQuery = query ?? "";
        fetchOrders({
          variables: {
            first: 100,
            filter: {
              created: { gte: todayDate, lte: todayDate },
              ...(safeQuery.trim() && { search: safeQuery }),
            },
            sort: { direction: "DESC", field: "NUMBER" },
          },
          fetchPolicy: "network-only",
        });
      }, 500),
    [fetchOrders, todayDate]
  );

  const handleSearchChange = useCallback(
    (text) => {
      setSearchQuery(text);
      debouncedSearch(text);
    },
    [debouncedSearch]
  );

  const orderDraftCreateHandler = useCallback(async () => {
    try {
      const result = await createDraftOrder();
      const orderId = result?.data?.draftOrderCreate?.order?.id || "";
      navigation.navigate("createOrder", { order_id: orderId });
    } catch {}
  }, [createDraftOrder, navigation]);

  const handleOrderDetails = useCallback(
    (order_id) => {
      if (order_id) {
        navigation.navigate("createOrder", {
          order_id,
          cancellationOrder: true,
        });
      }
    },
    [navigation]
  );

  const handleGenerateInvoice = useCallback(async (orderId, status) => {
    setSelectedOrderId(orderId);
    setInvoiceLoading(true);
    try {
      await generateAndShareInvoice(orderId, status);
    } finally {
      setInvoiceLoading(false);
    }
  }, []);

  const onChangeDate = useCallback(
    (event, date) => {
      setShowPicker(false);
      if (date) setSelectedDate(date);
      debouncedSearch(searchQuery);
    },
    [debouncedSearch, searchQuery]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch({
        first: 100,
        filter: {
          created: { gte: todayDate, lte: todayDate },
          ...(searchQuery.trim() && { search: searchQuery }),
        },
        sort: { direction: "DESC", field: "NUMBER" },
      });
    } catch (e) {
      toast.error("Refresh error", e);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, todayDate, searchQuery]);

  const renderOrderItem = useCallback(
    ({ item }) => (
      <OrderItem
        item={item}
        onPress={handleOrderDetails}
        onShare={handleGenerateInvoice}
        invoiceLoadder={invoiceLoadder}
        selectedOrderId={selectedOrderId}
      />
    ),
    [handleOrderDetails, handleGenerateInvoice, invoiceLoadder, selectedOrderId]
  );

  useFocusEffect(
    useCallback(() => {
      if (globalRefresh) {
        debouncedSearch("");
        setTimeout(() => setGlobalRefresh(false), 300);
      }
      return () => debouncedSearch.cancel();
    }, [debouncedSearch, globalRefresh, setGlobalRefresh])
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [selectedDate]);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, []);

  if (orderListError) return <ErrorMessage errorMessage={orderListError} />;

  return (
    <ScreenLayout>
      <DashboardStats
        todayOrdersCount={orderList?.orders?.totalCount ?? 0}
        totalOrdersCount={currentMonthOrderCount}
        onPress={() => navigation.navigate("Performance")}
      />

      <View style={styles.searchCreateContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholderTextColor="#A9A9A9"
            placeholder="Search by name order"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={orderDraftCreateHandler}
          disabled={draftOrderLoading}
        >
          <Text style={styles.createButtonText}>
            {draftOrderLoading ? "Creating..." : "Create Order"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.dateInput}
        onPress={() => setShowPicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color={colors.WHITE} />
        <Text style={styles.datePickerStyle}>{todayDate}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      {!hasOrders && (
        <View style={styles.messageContainer}>
          <Text style={styles.errorText}>No orders found.</Text>
        </View>
      )}
      {loading && <LoadingSkeleton theme={theme} />}
      <FlatList
        data={orders}
        keyExtractor={(item) => item?.node?.id}
        contentContainerStyle={styles.flatListContent}
        showsVerticalScrollIndicator={false}
        renderItem={renderOrderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.PRIMARY_BUTTON_BACKGROUND]}
            tintColor={colors.PRIMARY_BUTTON_BACKGROUND}
          />
        }
      />

      <FAB
        icon="download-outline"
        style={styles.fab}
        size="medium"
        onPress={() => navigation.navigate("purchasePriceOrder")}
        color="white"
      />
    </ScreenLayout>
  );
}
