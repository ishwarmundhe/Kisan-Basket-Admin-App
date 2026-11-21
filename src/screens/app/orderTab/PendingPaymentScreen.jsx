import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Linking,
  Platform
} from "react-native";
import { Card, Text, Divider } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import { useFocusEffect } from "@react-navigation/native";
import { debounce } from "lodash";

import ScreenLayout from "../ScreenLayout";
import { colors } from "../../../constant/Colors";
import { toast } from "sonner-native";
import { useTheme } from "../../../constant/ThemeContext";

import { ORDER_LIST_QUERY } from "../../../graphql/Query";
import { ORDER_MARK_AS_PAID } from "../../../graphql/Mutation";

const EXCLUDED_STATUSES = ["CANCELED", "UNCONFIRMED"];
const isPendingPayment = (order) =>
  !order?.isPaid && !EXCLUDED_STATUSES.includes(order?.status);

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        headerBar: {
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: theme.background,
        },
        searchContainer: {
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 10,
          paddingHorizontal: 12,
          height: 48,
          backgroundColor: theme.primary,
        },
        searchInput: {
          flex: 1,
          marginLeft: 8,
          color: theme.text,
          fontSize: 15,
        },
        summaryContainer: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 8,
          marginTop: 12,
        },
        summaryText: {
          color: theme.secondary,
          fontSize: 13,
          fontWeight: "600",
        },
        summaryAmount: {
          color: theme.heading,
          fontSize: 14,
          fontWeight: "700",
        },

        // Custom Dropdown Styles
        paginationContainer: {
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 8,
          marginTop: 12,
        },
        paginationLabel: {
          color: theme.secondary,
          fontSize: 13,
          fontWeight: "600",
          marginRight: 8,
        },
        dropdownTrigger: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.primary,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          width: 100,
        },
        dropdownText: { color: theme.text, fontSize: 13, fontWeight: "600" },

        dropdownOverlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.3)",
          justifyContent: "center",
          alignItems: "center",
        },
        dropdownMenu: {
          width: 200,
          backgroundColor: theme.primary,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: theme.border,
          overflow: "hidden",
          elevation: 5,
        },
        dropdownOption: {
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
        dropdownOptionText: {
          color: theme.text,
          fontSize: 15,
          fontWeight: "500",
          textAlign: "center",
        },

        card: {
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 16,
          backgroundColor: theme.primary,
          borderColor: theme.border,
          borderWidth: 1,
        },
        cardTitle: {
          color: theme.heading,
          fontSize: 16,
          fontWeight: "700",
          marginBottom: 6,
        },
        cardText: { color: theme.secondary, fontSize: 14, marginBottom: 4 },
        addressTitle: { color: theme.text, fontWeight: "500" },
        deliveryText: {
          marginTop: 8,
          color: theme.deliveryDate || "#4ade80",
          fontWeight: "600",
          fontSize: 13,
        },
        payBtn: {
          backgroundColor: "#d97706",
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 8,
          alignItems: "center",
          justifyContent: "center",
          marginTop: 14,
        },
        btnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },
        loadingOverlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 12,
        },
        messageContainer: {
          alignItems: "center",
          justifyContent: "center",
          marginTop: 60,
        },
        errorText: { fontSize: 16, color: theme.secondary },
        flatListContent: { gap: 12, paddingTop: 12, paddingBottom: 40 },
        footerLoader: { paddingVertical: 20, alignItems: "center" },

        // Modal Styles
        modalOverlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.7)",
          justifyContent: "center",
          alignItems: "center",
        },
        modalContent: {
          width: "90%",
          maxHeight: "85%",
          backgroundColor: theme.primary,
          borderRadius: 16,
          overflow: "hidden",
        },
        modalHeader: {
          padding: 16,
          backgroundColor: theme.background,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        modalTitle: { fontSize: 18, fontWeight: "bold", color: theme.heading },
        modalBody: { padding: 16 },
        sectionTitle: {
          fontSize: 15,
          fontWeight: "700",
          color: theme.heading,
          marginTop: 12,
          marginBottom: 8,
        },
        detailText: { fontSize: 14, color: theme.text, marginBottom: 4 },
        tableHeader: {
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          paddingBottom: 8,
          marginBottom: 8,
          marginTop: 8,
        },
        tableRow: {
          flexDirection: "row",
          marginBottom: 8,
          paddingBottom: 8,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.border,
        },
        colItem: { flex: 3, color: theme.text, fontSize: 14 },
        colQty: {
          flex: 1,
          color: theme.text,
          fontSize: 14,
          textAlign: "center",
        },
        modalFooter: {
          padding: 16,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          backgroundColor: theme.background,
          flexDirection: "row",
          justifyContent: "space-around",
        },
        actionIconBtn: {
          alignItems: "center",
          justifyContent: "center",
          padding: 10,
          borderRadius: 8,
          width: 80,
        },
        actionIconText: {
          color: theme.text,
          fontSize: 12,
          marginTop: 4,
          fontWeight: "600",
        },
        confirmModalContent: {
          width: "85%",
          backgroundColor: theme.primary,
          borderRadius: 16,
          padding: 24,
        },
      }),
    [theme],
  );

const PendingOrderItem = React.memo(({ item, onPress, onMarkPaidClick, loadingActionId }) => {
  const order = item?.node;
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const isActionLoading = loadingActionId === order?.id;
  const fullName = `${order?.billingAddress?.firstName ?? ""} ${order?.billingAddress?.lastName ?? ""}`.trim();
  const addressLine1 = order?.billingAddress?.streetAddress1 ?? "";

  return (
    <TouchableOpacity onPress={() => onPress(order)} disabled={isActionLoading} style={{ position: "relative" }}>
      <Card style={styles.card}>
        <Text style={styles.cardTitle}>{addressLine1 || "No Address Provided"}</Text>
        <Text style={styles.cardText}>Order #<Text style={styles.addressTitle}>{order?.number}</Text></Text>
        <Text style={styles.cardText}>Customer: <Text style={styles.addressTitle}>{fullName || "N/A"}</Text></Text>
        <Text style={styles.cardText}>Status: <Text style={{ color: theme.text, fontWeight: "700" }}>{order?.status}</Text></Text>
        <Text style={styles.cardText}>
          Amount: <Text style={{ color: theme.text, fontWeight: "600" }}>{order?.total?.gross?.currency} {order?.total?.gross?.amount}</Text>
        </Text>
        <Text style={styles.deliveryText}>Delivery: {order?.deliveryDate ?? "-"}</Text>

        <TouchableOpacity style={styles.payBtn} onPress={() => onMarkPaidClick(order.id)} disabled={isActionLoading}>
          {isActionLoading ? <ActivityIndicator color={colors.WHITE} size="small" /> : <Text style={styles.btnText}>Mark Paid</Text>}
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );
});

const PendingPaymentScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(50);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [confirmPaymentModalVisible, setConfirmPaymentModalVisible] =
    useState(false);
  const [paymentTargetOrderId, setPaymentTargetOrderId] = useState(null);

  const [fetchOrders, { data: orderList, loading, refetch, fetchMore }] =
    useLazyQuery(ORDER_LIST_QUERY);
  const [markAsPaid] = useMutation(ORDER_MARK_AS_PAID);

  const runFetch = useCallback(
    (query, limit = pageSize) => {
      const safeQuery = query ?? "";
      fetchOrders({
        variables: {
          first: limit,
          filter: {
            ...(safeQuery.trim() && { search: safeQuery }),
            status: ["UNFULFILLED", "FULFILLED", "PARTIALLY_FULFILLED"],
            chargeStatus: ["NONE", "PARTIAL"],
          },
          sort: { direction: "DESC", field: "NUMBER" },
        },
        fetchPolicy: "network-only",
      });
    },
    [fetchOrders, pageSize],
  );

  const debouncedSearch = useMemo(
    () => debounce((q) => runFetch(q, pageSize), 500),
    [runFetch, pageSize],
  );

  useEffect(() => {
    runFetch(searchQuery, pageSize);
    return () => debouncedSearch.cancel();
  }, [pageSize]);

  useFocusEffect(
    useCallback(() => {
      runFetch(searchQuery, pageSize);
    }, [pageSize]),
  );

  const handleSearchChange = useCallback(
    (text) => {
      setSearchQuery(text);
      debouncedSearch(text);
    },
    [debouncedSearch],
  );

  const handleLoadMore = useCallback(async () => {
    const pageInfo = orderList?.orders?.pageInfo;
    if (pageInfo?.hasNextPage && !loadingMore) {
      setLoadingMore(true);
      try {
        await fetchMore({
          variables: { after: pageInfo.endCursor, first: pageSize },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prevResult;
            return {
              orders: {
                ...fetchMoreResult.orders,
                edges: [
                  ...prevResult.orders.edges,
                  ...fetchMoreResult.orders.edges,
                ],
              },
            };
          },
        });
      } catch (e) {
        toast.error("Failed to load more orders");
      } finally {
        setLoadingMore(false);
      }
    }
  }, [orderList, loadingMore, fetchMore, pageSize]);

  const allOrders = useMemo(() => orderList?.orders?.edges ?? [], [orderList]);
  const pendingOrders = useMemo(
    () => allOrders.filter((edge) => isPendingPayment(edge.node)),
    [allOrders],
  );
  const totalPendingAmount = useMemo(
    () =>
      pendingOrders.reduce(
        (sum, edge) => sum + (edge.node.total?.gross?.amount || 0),
        0,
      ),
    [pendingOrders],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refetch) {
        await refetch({
          first: pageSize,
          filter: { ...(searchQuery.trim() && { search: searchQuery }) },
          sort: { direction: "DESC", field: "NUMBER" },
        });
      } else {
        runFetch(searchQuery, pageSize);
      }
    } catch (e) {
      toast.error("Refresh error: " + e.message);
    } finally {
      setRefreshing(false);
    }
  }, [refetch, runFetch, searchQuery, pageSize]);

  const handleMarkPaidClick = useCallback((id) => {
    setPaymentTargetOrderId(id);
    setConfirmPaymentModalVisible(true);
  }, []);

  const handleOrderPress = useCallback((orderData) => {
    setSelectedOrder(orderData);
  }, []);

  const executeMarkPaid = async () => {
    setConfirmPaymentModalVisible(false);
    const id = paymentTargetOrderId;
    if (!id) return;

    setLoadingActionId(id);
    try {
      const { data } = await markAsPaid({ variables: { id } });
      const errors = data?.orderMarkAsPaid?.errors || [];
      if (errors.length > 0) {
        toast.error(errors[0].message);
      } else {
        toast.success("Order Marked as Paid!");
        setSelectedOrder(null);
        await handleRefresh();
      }
    } catch (e) {
      toast.error("Failed to mark as paid");
    } finally {
      setLoadingActionId(null);
      setPaymentTargetOrderId(null);
    }
  };

  const handleCall = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      toast.error("Phone number not available");
    }
  };

  const handleMessage = async (orderData) => {
    const phone = orderData?.billingAddress?.phone;
    if (!phone) {
      toast.error("Phone number not available");
      return;
    }

    const name =
      `${orderData?.billingAddress?.firstName || ""} ${orderData?.billingAddress?.lastName || ""}`.trim() ||
      "Customer";
    const totalAmount = orderData?.total?.gross?.amount || 0;

    let itemsList = "• No items listed";

    if (orderData?.lines && orderData.lines.length > 0) {
      itemsList = orderData.lines
        .map((line) => {
          const itemName = line.variantName || line.productName || "Item";
          const itemQty = line.quantity || 1;
          return `• ${itemName} (×${itemQty})`;
        })
        .join("\n");
    }

    const msg = `Hi ${name}, greeting from KisanBasket! 👋\n\nThis is a gentle reminder that your payment for order #${orderData.number} is currently pending.\n\n🛒 Items:\n${itemsList}\n\nSubtotal: ₹${totalAmount.toFixed(2)}\nDelivery Charges: ₹0.00\n--------------------\nTotal Amount: ₹${totalAmount.toFixed(2)}\n\nKindly arrange the payment at your earliest convenience. Thank you!`;

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const messageText = encodeURIComponent(msg);
    const whatsappAppUrl = `whatsapp://send?phone=${cleanPhone}&text=${messageText}`;
    const whatsappWebUrl = `https://wa.me/${cleanPhone}?text=${messageText}`;

    try {
      const supported = await Linking.canOpenURL(whatsappAppUrl);
      if (supported) {
        await Linking.openURL(whatsappAppUrl);
      } else {
        await Linking.openURL(whatsappWebUrl);
      }
    } catch (error) {
      toast.error("Could not open WhatsApp");
    }
  };

  const renderItem = useCallback(
    ({ item }) => (
      <PendingOrderItem
        item={item}
        onPress={handleOrderPress}
        onMarkPaidClick={handleMarkPaidClick}
        loadingActionId={loadingActionId}
      />
    ),
    [handleOrderPress, handleMarkPaidClick, loadingActionId],
  );

  return (
    <ScreenLayout>
      <View style={styles.headerBar}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search pending orders"
            placeholderTextColor="#A9A9A9"
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {pendingOrders.length} pending orders
          </Text>
          <Text style={styles.summaryAmount}>
            Total Due: ₹{totalPendingAmount.toFixed(2)}
          </Text>
        </View>

        {/* CUSTOM DROPDOWN */}
        <View style={styles.paginationContainer}>
          <Text style={styles.paginationLabel}>Batch Size:</Text>
          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>{pageSize}</Text>
            <Ionicons name="chevron-down" size={16} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* DROPDOWN MODAL */}
      <Modal visible={dropdownVisible} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.dropdownOverlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            {[20, 50, 100].map((size, index) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.dropdownOption,
                  index === 2 && { borderBottomWidth: 0 },
                ]}
                onPress={() => {
                  setPageSize(size);
                  setDropdownVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    pageSize === size && {
                      color: theme.textSecondary || "#4ade80",
                      fontWeight: "bold",
                    },
                  ]}
                >
                  {size} items
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {loading && !refreshing && allOrders.length === 0 ? (
        <View style={styles.messageContainer}>
          <ActivityIndicator
            size="large"
            color={colors.PRIMARY_BUTTON_BACKGROUND}
          />
        </View>
      ) : (
        <FlatList
          data={pendingOrders}
          keyExtractor={(item) => item?.node?.id}
          contentContainerStyle={styles.flatListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          initialNumToRender={pageSize}
          maxToRenderPerBatch={pageSize}
          windowSize={10}
          removeClippedSubviews={true}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator
                  size="small"
                  color={colors.PRIMARY_BUTTON_BACKGROUND}
                />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.messageContainer}>
              <Text style={styles.errorText}>No pending payment orders 🎉</Text>
            </View>
          }
          renderItem={renderItem}
        />
      )}

      {/* ORDER DETAILS MODAL */}
      <Modal
        visible={!!selectedOrder}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedOrder(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Order #{selectedOrder?.number}
              </Text>
              <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Customer Details</Text>
              <Text style={styles.detailText}>
                <Text style={{ fontWeight: "600" }}>Name: </Text>
                {selectedOrder?.billingAddress?.firstName}{" "}
                {selectedOrder?.billingAddress?.lastName}
              </Text>
              <Text style={styles.detailText}>
                <Text style={{ fontWeight: "600" }}>Phone: </Text>
                {selectedOrder?.billingAddress?.phone || "N/A"}
              </Text>
              <Text style={styles.detailText}>
                <Text style={{ fontWeight: "600" }}>Address: </Text>
                {selectedOrder?.billingAddress?.streetAddress1 || "N/A"}
              </Text>

              <Divider
                style={{ marginVertical: 12, backgroundColor: theme.border }}
              />

              <Text style={styles.sectionTitle}>Delivery Details</Text>
              <Text style={styles.detailText}>
                <Text style={{ fontWeight: "600" }}>Expected Date: </Text>
                {selectedOrder?.deliveryDate || "Not scheduled"}
              </Text>
              <Text style={styles.detailText}>
                <Text style={{ fontWeight: "600" }}>Amount Due: </Text>
                <Text style={{ color: "#d97706", fontWeight: "bold" }}>
                  {selectedOrder?.total?.gross?.currency}{" "}
                  {selectedOrder?.total?.gross?.amount}
                </Text>
              </Text>

              <Divider
                style={{ marginVertical: 12, backgroundColor: theme.border }}
              />

              <Text style={styles.sectionTitle}>Order Items</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.colItem, { fontWeight: "700" }]}>
                  Item
                </Text>
                <Text style={[styles.colQty, { fontWeight: "700" }]}>Qty</Text>
              </View>
              {selectedOrder?.lines?.map((line) => (
                <View key={line.id} style={styles.tableRow}>
                  <Text style={styles.colItem}>{line.productName}</Text>
                  <Text style={styles.colQty}>{line.quantity}</Text>
                </View>
              ))}

              <View style={{ height: 20 }} />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.actionIconBtn,
                  { backgroundColor: "rgba(37, 99, 235, 0.1)" },
                ]}
                onPress={() => handleCall(selectedOrder?.billingAddress?.phone)}
              >
                <Ionicons name="call" size={24} color="#2563eb" />
                <Text style={[styles.actionIconText, { color: "#2563eb" }]}>
                  Call
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionIconBtn,
                  { backgroundColor: "rgba(16, 185, 129, 0.1)" },
                ]}
                onPress={() => handleMessage(selectedOrder)}
              >
                <Ionicons name="logo-whatsapp" size={24} color="#10b981" />
                <Text style={[styles.actionIconText, { color: "#10b981" }]}>
                  Message
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionIconBtn,
                  { backgroundColor: "rgba(217, 119, 6, 0.1)" },
                ]}
                onPress={() => handleMarkPaidClick(selectedOrder?.id)}
                disabled={loadingActionId === selectedOrder?.id}
              >
                {loadingActionId === selectedOrder?.id ? (
                  <ActivityIndicator size="small" color="#d97706" />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#d97706"
                    />
                    <Text style={[styles.actionIconText, { color: "#d97706" }]}>
                      Paid
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CONFIRMATION MODAL FOR MARKING AS PAID */}
      <Modal
        visible={confirmPaymentModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: theme.heading,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              Confirm Payment
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 24,
                color: theme.text,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              Are you sure you want to mark this order as paid? This action
              cannot be undone.
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 10,
              }}
            >
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => setConfirmPaymentModalVisible(false)}
              >
                <Text
                  style={{
                    color: theme.secondary,
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  No, Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={executeMarkPaid}
              >
                <Text
                  style={{ color: "#10b981", fontWeight: "600", fontSize: 16 }}
                >
                  Yes, Mark Paid
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
};

export default PendingPaymentScreen;
