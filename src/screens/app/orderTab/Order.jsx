import React, {
  useCallback,
  useState,
  useEffect,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
import { setToken } from "../../../redux/slices/authSlice";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Animated,
} from "react-native";
import { localStore } from "../../../utils/localStore";
import { Card, Text, FAB } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { debounce } from "lodash";
import ScreenLayout from "../ScreenLayout";
import ErrorMessage from "../../../components/custom/errorMessage";
import { colors } from "../../../constant/Colors";
import dayjs from "dayjs";

import {
  ORDER_LIST_QUERY,
  MONTH_TOTAL_ORDERS,
  WAREHOUSE_LIST,
  ORDER_FULFILL_DATA,
  CHECKOUT_SHIPPING_METHODS_QUERY,
  GET_CHANNELS,
  GET_DRAFT_ORDERS,
} from "../../../graphql/Query";

import {
  ORDER_DRAFT_CREATE,
  ORDER_CONFIRM,
  ORDER_MARK_AS_PAID,
  FULFILL_ORDER,
} from "../../../graphql/Mutation";
import { generateAndShareInvoice } from "../../../utils/Invoice";
import { AuthContext } from "../../../constant/AuthProvider";
import { toast } from "sonner-native";
import { useTheme } from "../../../constant/ThemeContext";
import DashboardStats from "../productsTab/DashboardStats";
import moment from "moment";

const STATUS_COLORS = {
  CANCELED: colors.CANCELED,
  UNCONFIRMED: colors.UNCONFIRMED,
  UNFULFILLED: colors.UNFULFILLED,
  DEFAULT: colors.WHITE,
};

let persistedSelectedDate = new Date();

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        orderLoadingOverlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 8,
          zIndex: 10,
          elevation: 10,
        },
        searchCreateContainer: {
          flexDirection: "row",
          gap: 12,
          marginBottom: 16,
        },
        messageContainer: {
          alignItems: "center",
          justifyContent: "center",
          marginTop: 60,
        },
        errorText: {
          fontSize: 16,
          color: theme.secondary,
        },
        flatListContent: {
          gap: 12,
          paddingTop: 10,
          paddingBottom: 80,
        },

        // --- CARDS ---
        card: {
          borderRadius: 8,
          padding: 16,
          marginHorizontal: 16,
          backgroundColor: theme.primary,
          borderColor: theme.border,
          borderWidth: 1,
        },
        cardInner: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        },
        cardTitle: {
          color: theme.heading,
          fontSize: 16,
          fontWeight: "600",
          marginBottom: 6,
          lineHeight: 22,
        },
        cardText: {
          color: theme.secondary,
          fontSize: 14,
          marginBottom: 4,
        },
        addressTitle: {
          color: theme.text,
          fontWeight: "500",
        },
        deliveryText: {
          marginTop: 8,
          color: theme.deliveryDate,
          fontWeight: "600",
          fontSize: 13,
          backgroundColor: `${theme.deliveryDate}15`,
          alignSelf: "flex-start",
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 4,
          overflow: "hidden",
        },

        // --- INPUTS & SEARCH ---
        searchContainer: {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
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

        dateRowContainer: {
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        },
        dateInput: {
          flex: 1,
          height: 48,
          paddingHorizontal: 12,
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          backgroundColor: theme.primary,
        },
        dateInputHeader: {
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 2,
        },
        dateLabelText: {
          color: theme.secondary,
          fontSize: 12,
          fontWeight: "500",
        },
        datePickerStyle: {
          color: theme.text,
          fontWeight: "600",
          fontSize: 14,
        },

        iconButton: {
          width: 38,
          height: 48,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          backgroundColor: theme.primary,
          justifyContent: "center",
          alignItems: "center",
        },

        // --- BUTTONS ---
        createButton: {
          borderWidth: 1,
          borderColor: theme.textSecondary,
          paddingHorizontal: 20,
          borderRadius: 8,
          height: 48,
          backgroundColor: theme.textSecondary,
          justifyContent: "center",
          alignItems: "center",
        },
        createButtonText: {
          color: theme.background,
          fontWeight: "600",
          fontSize: 14,
        },
        draftsButton: {
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: theme.primary,
          paddingHorizontal: 15,
          marginRight: 8,
          borderRadius: 8,
          height: 48,
          justifyContent: "center",
          alignItems: "center",
        },
        draftsButtonText: {
          color: theme.text,
          fontWeight: "600",
          fontSize: 14,
        },

        // --- ACTION BUTTONS ---
        actionContainer: {
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          gap: 10,
        },
        actionBtn: {
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderRadius: 6,
          alignItems: "center",
          justifyContent: "center",
          minWidth: 80,
        },
        confirmBtn: { backgroundColor: "#059669", borderWidth: 0 },
        fulfillBtn: { backgroundColor: "#2563eb", borderWidth: 0 },
        paidBtn: { backgroundColor: "#d97706", borderWidth: 0 },
        orderPaid: {
          borderWidth: 1,
          borderColor: "#88E788",
          backgroundColor: "#ecfcec",
        },
        btnText: {
          color: "#FFFFFF",
          fontWeight: "600",
          fontSize: 13,
        },

        // --- ICONS & EXTRAS ---
        shareButton: {
          backgroundColor: theme.shareButtonColor,
          padding: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.border,
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

        // --- MODALS & OVERLAYS ---
        modalOverlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)",
          justifyContent: "center",
          alignItems: "center",
        },
        modalContent: {
          width: "90%",
          backgroundColor: theme.primary,
          borderRadius: 12,
          padding: 24,
          borderWidth: 1,
          borderColor: theme.border,
        },
        modalTitle: {
          fontSize: 20,
          fontWeight: "bold",
          color: theme.heading,
          marginBottom: 20,
          textAlign: "center",
        },
        modalItem: {
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        },
        modalText: {
          color: theme.text,
          fontSize: 16,
        },
        closeBtn: {
          marginTop: 20,
          padding: 12,
          backgroundColor: theme.shareButtonColor,
          borderRadius: 8,
          alignItems: "center",
        },

        fullScreenLoaderText: {
          color: "#FFFFFF",
          marginTop: 12,
          fontSize: 16,
          fontWeight: "600",
        },

        // --- SKELETON ---
        shimmerCard: {
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          padding: 16,
          marginBottom: 12,
        },

        rightActions: {
          alignItems: "flex-end",
        },
        unpaidBadge: {
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          paddingHorizontal: 4,
          paddingVertical: 4,
          borderRadius: 4,
          borderWidth: 1,
          borderColor: "rgba(239, 68, 68, 0.4)",
          marginBottom: 8,
        },
        unpaidBadgeText: {
          color: theme.error || "#ef4444",
          fontSize: 10,
          fontWeight: "700",
          textTransform: "uppercase",
        },
      }),
    [theme],
  );

const WarehouseModal = ({
  visible,
  onClose,
  onSelect,
  warehouses,
  loading,
}) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Warehouse</Text>
          {loading ? (
            <ActivityIndicator
              size="large"
              color={colors.PRIMARY_BUTTON_BACKGROUND}
            />
          ) : (
            <FlatList
              data={warehouses}
              keyExtractor={(item) => item.node.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => onSelect(item.node.id)}
                >
                  <Text style={styles.modalText}>{item.node.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: colors.CANCELED }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const OrderItem = React.memo(
  ({
    item,
    onPress,
    onShare,
    invoiceLoadder,
    selectedOrderId,
    onConfirm,
    onFulfill,
    onMarkPaid,
    loadingActionId,
  }) => {
    const order = item?.node;
    const { theme } = useTheme();
    const styles = useStyle(theme);

    const lines = order?.lines || [];

    const matchesCategory = (line, keyword) => {
      const categoryName =
        line?.variant?.product?.category?.name?.toLowerCase() || "";
      const productName = line?.productName?.toLowerCase() || "";
      return categoryName.includes(keyword) || productName.includes(keyword);
    };

    const hasOil = lines.some((l) => matchesCategory(l, "oil"));
    const hasAtta = lines.some((l) => matchesCategory(l, "atta"));
    const hasSpices = lines.some(
      (l) =>
        matchesCategory(l, "spice") ||
        matchesCategory(l, "masala") ||
        matchesCategory(l, "powder"),
    );
    const hasPulses = lines.some(
      (l) => matchesCategory(l, "pulse") || matchesCategory(l, "dal"),
    );
    const hasPaneer = lines.some(
      (l) =>
        matchesCategory(l, "dairy") ||
        matchesCategory(l, "paneer") ||
        matchesCategory(l, "malai"),
    );

    let dynamicCardStyle = {
      backgroundColor: "#18181b",
      borderColor: theme.border,
    };

    if (hasOil) {
      dynamicCardStyle = {
        backgroundColor: "rgba(234, 179, 8, 0.15)",
        borderColor: "#eab308",
      };
    } else if (hasAtta) {
      dynamicCardStyle = {
        backgroundColor: "rgba(249, 115, 22, 0.15)",
        borderColor: "#f97316",
      };
    } else if (hasSpices) {
      dynamicCardStyle = {
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        borderColor: "#ef4444",
      };
    } else if (hasPulses) {
      dynamicCardStyle = {
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        borderColor: "#10b981",
      };
    } else if (hasPaneer) {
      dynamicCardStyle = {
        backgroundColor: "rgba(6, 182, 212, 0.15)",
        borderColor: "#06b6d4",
      };
    }

    const isCanceled = order?.status === "CANCELED";
    const finalCardStyle = [
      styles.card,
      dynamicCardStyle,
      isCanceled && {
        opacity: 0.4,
        borderColor: theme.border,
        backgroundColor: theme.primary,
      },
      { overflow: "hidden" },
    ];

    const fullName =
      `${order?.billingAddress?.firstName ?? ""} ${order?.billingAddress?.lastName ?? ""}`.trim();
    const addressLine1 = order?.billingAddress?.streetAddress1 ?? "";
    const itemNames = lines.map((l) => l.productName).join(", ");
    const isActionLoading = loadingActionId === order?.id;

    return (
      <TouchableOpacity
        style={{ position: "relative" }}
        onPress={() => onPress(order?.id)}
        disabled={isActionLoading}
      >
        <Card style={finalCardStyle}>
          <View style={styles.rightActions}>
            {!order?.isPaid &&
              !isCanceled &&
              !["UNCONFIRMED", "UNFULFILLED", "PARTIALLY_FULFILLED"].includes(
                order?.status,
              ) && (
                <View style={styles.unpaidBadge}>
                  <Text style={styles.unpaidBadgeText}>Payment Pending</Text>
                </View>
              )}
          </View>

          <View style={styles.cardInner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{addressLine1}</Text>
              <Text style={styles.cardText}>
                Name: <Text style={styles.addressTitle}>{fullName}</Text>
              </Text>
              <Text style={styles.cardText} numberOfLines={1}>
                Items: <Text style={{ color: theme.text }}>{itemNames}</Text>
              </Text>
              <Text style={styles.cardText}>
                Status:{" "}
                <Text
                  style={{
                    color:
                      STATUS_COLORS[order?.status] || STATUS_COLORS.DEFAULT,
                    fontWeight: "700",
                  }}
                >
                  {order?.status}
                </Text>
              </Text>
              <Text style={styles.cardText}>
                Amount: {order?.total?.gross?.currency}{" "}
                {order?.total?.gross?.amount}
              </Text>
              <Text style={styles.deliveryText}>
                Delivery: {order?.deliveryDate ?? "-"}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => onShare(order?.id, order?.status)}
              disabled={
                order?.status === "UNCONFIRMED" || order?.status === "DRAFT"
              }
            >
              {invoiceLoadder && selectedOrderId === order.id ? (
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

          <View style={styles.actionContainer}>
            {order?.status === "UNCONFIRMED" && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={() => onConfirm(order.id)}
              >
                <Text style={styles.btnText}>Confirm</Text>
              </TouchableOpacity>
            )}

            {(order?.status === "UNFULFILLED" ||
              order?.status === "PARTIALLY_FULFILLED") && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.fulfillBtn]}
                onPress={() => onFulfill(order.id)}
              >
                <Text style={styles.btnText}>Fulfill</Text>
              </TouchableOpacity>
            )}

            {order?.status === "FULFILLED" && order?.isPaid && (
              <View style={[styles.actionBtn, styles.orderPaid]}>
                <Text>Order Paid</Text>
              </View>
            )}

            {order?.status === "FULFILLED" && !order?.isPaid && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.paidBtn]}
                onPress={() => onMarkPaid(order.id)}
              >
                <Text style={styles.btnText}>Mark Paid</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
        {isActionLoading && (
          <View style={styles.orderLoadingOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>
    );
  },
);

export default function ProductSelectionScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const dispatch = useDispatch();

  const { globalRefresh, setGlobalRefresh } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(persistedSelectedDate);
  const [showPicker, setShowPicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateFilterType, setDateFilterType] = useState("deliveryDate");
  const [invoiceLoadder, setInvoiceLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [fulfillTargetOrderId, setFulfillTargetOrderId] = useState(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);

  const [confirmOrderModalVisible, setConfirmOrderModalVisible] =
    useState(false);
  const [confirmTargetOrderId, setConfirmTargetOrderId] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  const [statsHeight, setStatsHeight] = useState(0);
  const [searchHeight, setSearchHeight] = useState(0);
  const totalHeaderHeight = statsHeight + searchHeight;

  const statsTranslateY = scrollY.interpolate({
    inputRange: [0, statsHeight || 1],
    outputRange: [0, -statsHeight],
    extrapolate: "clamp",
  });
  const statsOpacity = scrollY.interpolate({
    inputRange: [0, (statsHeight || 1) * 0.6],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const searchTranslateY = scrollY.interpolate({
    inputRange: [0, statsHeight || 1],
    outputRange: [0, -statsHeight],
    extrapolate: "clamp",
  });

  const getSelectedMonthDateRange = useMemo(
    () => ({
      gte: moment(selectedDate).startOf("month").format("YYYY-MM-DD"),
      lte: moment(selectedDate).endOf("month").format("YYYY-MM-DD"),
    }),
    [selectedDate],
  );

  const todayDate = useMemo(
    () => selectedDate?.toLocaleDateString("en-CA"),
    [selectedDate],
  );
  const dateObj = dayjs(selectedDate);
  const displayDate = dateObj.format("DD-MM-YYYY");

  const {
    data: draftData,
    loading: draftsLoading,
    refetch: refetchDrafts,
  } = useQuery(GET_DRAFT_ORDERS, {
    skip: !showDraftsModal,
    fetchPolicy: "network-only",
  });

  const [
    fetchOrders,
    { data: orderList, loading, error: orderListError, refetch },
  ] = useLazyQuery(ORDER_LIST_QUERY);

  const { data: channelsData, loading: channelsLoading } =
    useQuery(GET_CHANNELS);

  const { data: monthlyOrdersData, refetch: refetchMonthlyData } = useQuery(
    MONTH_TOTAL_ORDERS,
    { variables: getSelectedMonthDateRange },
  );

  const { data: warehouseData, loading: warehouseLoading } =
    useQuery(WAREHOUSE_LIST);

  const [fetchFulfillData] = useLazyQuery(ORDER_FULFILL_DATA, {
    fetchPolicy: "network-only",
  });

  const [createDraftOrder, { loading: draftOrderLoading }] =
    useMutation(ORDER_DRAFT_CREATE);
  const [confirmOrder] = useMutation(ORDER_CONFIRM);
  const [fulfillOrder] = useMutation(FULFILL_ORDER);
  const [markAsPaid] = useMutation(ORDER_MARK_AS_PAID);

  const orders = useMemo(() => orderList?.orders?.edges ?? [], [orderList]);
  const hasOrders = orders.length > 0;
  const currentMonthOrderCount = monthlyOrdersData?.orders?.totalCount ?? 0;

  const stats = useMemo(() => {
    let atta = 0;
    let oil = 0;
    let veg = 0;
    let spices = 0;
    let pulses = 0;
    let paneer = 0;
    let mango = 0;
    orders.forEach((edge) => {
      if (edge.node.status === "CANCELED") return;
      const lines = edge.node.lines || [];
      const checkCategory = (line, keyword) => {
        const cat = line?.variant?.product?.category?.name?.toLowerCase() || "";
        const name = line?.productName?.toLowerCase() || "";
        return cat.includes(keyword) || name.includes(keyword);
      };
      if (lines.some((l) => checkCategory(l, "atta"))) atta++;

      if (lines.some((l) => checkCategory(l, "oil"))) oil++;
      if (
        lines.some(
          (l) =>
            checkCategory(l, "spice") ||
            checkCategory(l, "masala") ||
            checkCategory(l, "powder"),
        )
      )
        spices++;
      if (
        lines.some(
          (l) => checkCategory(l, "mango") || checkCategory(l, "hapus"),
        )
      )
        mango++;
      if (
        lines.some((l) => checkCategory(l, "pulse") || checkCategory(l, "dal"))
      )
        pulses++;
      if (
        lines.some(
          (l) =>
            checkCategory(l, "dairy") ||
            checkCategory(l, "paneer") ||
            checkCategory(l, "malai"),
        )
      )
        paneer++;
      if (
        lines.some((l) => {
          const cat = l?.variant?.product?.category?.name?.toLowerCase() || "";
          if (cat.includes("vegetable")) return true;
          return (
            !checkCategory(l, "atta") &&
            !checkCategory(l, "oil") &&
            !checkCategory(l, "spice") &&
            !checkCategory(l, "masala") &&
            !checkCategory(l, "powder") &&
            !checkCategory(l, "mango") &&
            !checkCategory(l, "hapus") &&
            !checkCategory(l, "pulse") &&
            !checkCategory(l, "dal") &&
            !checkCategory(l, "dairy") &&
            !checkCategory(l, "paneer") &&
            !checkCategory(l, "malai")
          );
        })
      )
        veg++;
    });
    return { atta, oil, veg, spices, pulses, paneer, mango };
  }, [orders]);

  const displayedOrders = useMemo(() => {
    if (activeFilter === "All") return orders;
    return orders.filter((edge) => {
      const lines = edge.node.lines || [];
      const checkCategory = (line, keyword) => {
        const cat = line?.variant?.product?.category?.name?.toLowerCase() || "";
        const name = line?.productName?.toLowerCase() || "";
        return cat.includes(keyword) || name.includes(keyword);
      };
      if (activeFilter === "Atta")
        return lines.some((l) => checkCategory(l, "atta"));
      if (activeFilter === "Oil")
        return lines.some((l) => checkCategory(l, "oil"));
      if (activeFilter === "Spices")
        return lines.some(
          (l) =>
            checkCategory(l, "spice") ||
            checkCategory(l, "masala") ||
            checkCategory(l, "powder"),
        );
      if (activeFilter === "Mango")
        return lines.some(
          (l) => checkCategory(l, "mango") || checkCategory(l, "hapus"),
        );
      if (activeFilter === "Pulses")
        return lines.some(
          (l) => checkCategory(l, "pulse") || checkCategory(l, "dal"),
        );
      if (activeFilter === "Paneer")
        return lines.some(
          (l) =>
            checkCategory(l, "dairy") ||
            checkCategory(l, "paneer") ||
            checkCategory(l, "malai"),
        );
      if (activeFilter === "Vegetable")
        return lines.some((l) => {
          const cat = l?.variant?.product?.category?.name?.toLowerCase() || "";
          if (cat.includes("vegetable")) return true;
          return (
            !checkCategory(l, "atta") &&
            !checkCategory(l, "oil") &&
            !checkCategory(l, "spice") &&
            !checkCategory(l, "masala") &&
            !checkCategory(l, "powder") &&
            !checkCategory(l, "pulse") &&
            !checkCategory(l, "mango") &&
            !checkCategory(l, "hapus") &&
            !checkCategory(l, "dal") &&
            !checkCategory(l, "dairy") &&
            !checkCategory(l, "paneer") &&
            !checkCategory(l, "malai")
          );
        });
      return true;
    });
  }, [orders, activeFilter]);

  const handleChannelSelect = useCallback(
    async (channelId) => {
      setShowChannelModal(false);

      try {
        const result = await createDraftOrder({
          variables: {
            input: {
              channelId: channelId,
            },
          },
        });

        const orderId = result?.data?.draftOrderCreate?.order?.id || "";

        if (orderId) {
          navigation.navigate("createOrder", { order_id: orderId });
        } else {
          toast.error("Failed to retrieve new draft order ID.");
        }
      } catch (err) {
        toast.error("Failed to create draft order.");
        console.error("Draft Creation Error:", err);
      }
    },
    [createDraftOrder, navigation],
  );

  const handleConfirmOrder = async (id) => {
    if (!id) return;
    setLoadingActionId(id);
    try {
      const { data } = await confirmOrder({ variables: { id } });

      if (data?.orderConfirm?.errors?.length > 0) {
        toast.error(data.orderConfirm.errors[0].message);
      } else {
        toast.success("Order Confirmed!");
        await handleRefresh();
      }
    } catch (e) {
      toast.error("Failed to confirm order");
    } finally {
      setLoadingActionId(null);
    }
  };

  const handleMarkPaid = async (id) => {
    setLoadingActionId(id);
    try {
      const { data } = await markAsPaid({ variables: { id } });
      const errors = data?.orderMarkAsPaid?.errors || [];
      if (errors.length > 0) {
        const error = errors[0];
        if (error.field === "payment") {
          toast.info("Payment Already Exists", {
            description:
              "This order has a payment record. You must Capture it instead of using 'Mark Paid'.",
            duration: 4000,
          });
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Marked as Paid!");
        await handleRefresh();
      }
    } catch (e) {
      toast.error("Failed to mark as paid");
    } finally {
      setLoadingActionId(null);
    }
  };

  const onFulfillClick = (id) => {
    setFulfillTargetOrderId(id);
    setShowWarehouseModal(true);
  };

  const handleFulfillConfirm = async (warehouseId) => {
    setShowWarehouseModal(false);
    if (!fulfillTargetOrderId) return;

    setLoadingActionId(fulfillTargetOrderId);
    try {
      const { data: lineData } = await fetchFulfillData({
        variables: { orderId: fulfillTargetOrderId },
      });
      const lines = lineData?.order?.lines || [];

      const linesInput = lines
        .filter((l) => l.quantityToFulfill > 0)
        .map((l) => ({
          orderLineId: l.id,
          stocks: [{ quantity: l.quantityToFulfill, warehouse: warehouseId }],
        }));

      if (linesInput.length === 0) {
        toast.message("Nothing to fulfill or Order already fulfilled");
        return;
      }

      const { data } = await fulfillOrder({
        variables: {
          orderId: fulfillTargetOrderId,
          input: { lines: linesInput },
        },
      });
      if (data?.orderFulfill?.errors?.length > 0) {
        toast.error(data.orderFulfill.errors[0].message);
      } else {
        toast.success("Order Fulfilled!");
        await handleRefresh();
      }
    } catch (e) {
      toast.error("Fulfillment failed");
    } finally {
      setLoadingActionId(null);
      setFulfillTargetOrderId(null);
    }
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((query, filterType = dateFilterType) => {
        const safeQuery = query ?? "";
        fetchOrders({
          variables: {
            first: 100,

            filter: {
              [filterType]: { gte: todayDate, lte: todayDate },
              ...(safeQuery.trim() && { search: safeQuery }),
            },
            sort: { direction: "DESC", field: "NUMBER" },
          },
          fetchPolicy: "network-only",
        });
      }, 500),
    [fetchOrders, todayDate, dateFilterType],
  );

  const handleSearchChange = useCallback(
    (text) => {
      setSearchQuery(text);
      debouncedSearch(text);
    },
    [debouncedSearch],
  );

  const orderDraftCreateHandler = useCallback(() => {
    setShowChannelModal(true);
  }, []);

  const handleDraftSelect = useCallback(
    (draftId) => {
      setShowDraftsModal(false);
      if (draftId) {
        navigation.navigate("createOrder", { order_id: draftId });
      }
    },
    [navigation],
  );

  // const orderDraftCreateHandler = useCallback(async () => {
  //   try {
  //     const result = await createDraftOrder();
  //     const orderId = result?.data?.draftOrderCreate?.order?.id || "";
  //     navigation.navigate("createOrder", { order_id: orderId });
  //   } catch {}
  // }, [createDraftOrder, navigation]);

  const handleOrderDetails = useCallback(
    (order_id) => {
      if (order_id) {
        navigation.navigate("createOrder", {
          order_id,
          cancellationOrder: true,
        });
      }
    },
    [navigation],
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
      if (date) {
        setSelectedDate(date);
        persistedSelectedDate = date;
      }
      debouncedSearch(searchQuery);
    },
    [debouncedSearch, searchQuery],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refetch) {
        await refetch({
          first: 100,

          filter: {
            [dateFilterType]: { gte: todayDate, lte: todayDate },
            ...(searchQuery.trim() && { search: searchQuery }),
          },
          sort: { direction: "DESC", field: "NUMBER" },
        });
      } else {
        await fetchOrders({
          variables: {
            first: 100,

            filter: {
              [dateFilterType]: { gte: todayDate, lte: todayDate },
              ...(searchQuery.trim() && { search: searchQuery }),
            },
            sort: { direction: "DESC", field: "NUMBER" },
          },
          fetchPolicy: "network-only",
        });
      }
      if (refetchMonthlyData) await refetchMonthlyData();
    } catch (e) {
      toast.error("Refresh error: " + e.message);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchOrders,
    refetch,
    refetchMonthlyData,
    todayDate,
    searchQuery,
    dateFilterType,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (globalRefresh) {
        const timer = setTimeout(() => {
          handleRefresh();
          setGlobalRefresh(false);
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [globalRefresh, handleRefresh, setGlobalRefresh]),
  );

  const renderOrderItem = useCallback(
    ({ item }) => (
      <OrderItem
        item={item}
        onPress={handleOrderDetails}
        onShare={handleGenerateInvoice}
        invoiceLoadder={invoiceLoadder}
        selectedOrderId={selectedOrderId}
        onConfirm={(id) => {
          setConfirmTargetOrderId(id);
          setConfirmOrderModalVisible(true);
        }}
        onFulfill={onFulfillClick}
        onMarkPaid={handleMarkPaid}
        loadingActionId={loadingActionId}
      />
    ),
    [
      handleOrderDetails,
      handleGenerateInvoice,
      invoiceLoadder,
      selectedOrderId,
      loadingActionId,
    ],
  );

  useEffect(() => {
    debouncedSearch(searchQuery, dateFilterType);
  }, [selectedDate, dateFilterType]);

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, []);

  if (orderListError) return <ErrorMessage errorMessage={orderListError} />;

  return (
    <ScreenLayout>
      <Modal visible={refreshing} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.fullScreenLoaderText}>Loading Orders...</Text>
        </View>
      </Modal>

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <View style={{ flex: 1 }}>
        <Animated.View
          onLayout={(e) => setStatsHeight(e.nativeEvent.layout.height)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
            transform: [{ translateY: statsTranslateY }],
            opacity: statsOpacity,
            backgroundColor: theme.background,
            paddingHorizontal: 16,
            paddingTop: 8,
          }}
        >
          <DashboardStats
            vegCount={stats.veg}
            oilCount={stats.oil}
            attaCount={stats.atta}
            paneerCount={stats.paneer}
            mangoCount={stats.mango}
            spicesCount={stats.spices}
            pulsesCount={stats.pulses}
            todaysOrderCount={
              orders.filter((order) => order?.node?.status !== "CANCELED")
                .length
            }
            totalOrdersCount={currentMonthOrderCount}
            onPress={() => navigation.navigate("Performance")}
            activeFilter={activeFilter}
            onFilterSelect={setActiveFilter}
          />
        </Animated.View>

        <Animated.View
          onLayout={(e) => setSearchHeight(e.nativeEvent.layout.height)}
          style={{
            position: "absolute",
            top: statsHeight,
            left: 0,
            right: 0,
            zIndex: 2,
            transform: [{ translateY: searchTranslateY }],
            backgroundColor: theme.background,
            paddingHorizontal: 16,
            paddingBottom: 10,
          }}
        >
          <View style={styles.searchCreateContainer}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholderTextColor="#A9A9A9"
                placeholder="Search order"
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

          <View style={styles.dateRowContainer}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowPicker(true)}
            >
              <View style={styles.dateInputHeader}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={theme.secondary}
                />
                <Text style={styles.dateLabelText}>
                  {dateFilterType === "deliveryDate"
                    ? "Delivery Date"
                    : "Created Date"}
                </Text>
              </View>
              <Text style={styles.datePickerStyle}>{displayDate}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.draftsButton}
              onPress={() => {
                setShowDraftsModal(true);
                if (refetchDrafts) refetchDrafts();
              }}
            >
              <Text style={styles.draftsButtonText}>Draft </Text>
              <Text style={styles.draftsButtonText}>Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="filter-outline" size={20} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color={theme.text} />
              ) : (
                <Ionicons name="refresh-outline" size={20} color={theme.text} />
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>

        {totalHeaderHeight > 0 && (
          <Animated.FlatList
            data={displayedOrders}
            keyExtractor={(item) => item?.node?.id}
            contentContainerStyle={[
              styles.flatListContent,
              { paddingTop: totalHeaderHeight },
            ]}
            showsVerticalScrollIndicator={false}
            renderItem={renderOrderItem}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: true },
            )}
            scrollEventThrottle={16}
            ListEmptyComponent={
              !loading && !hasOrders ? (
                <View style={styles.messageContainer}>
                  <Text style={styles.errorText}>No orders found.</Text>
                </View>
              ) : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
          />
        )}
      </View>

      <FAB
        icon="download-outline"
        style={styles.fab}
        size="medium"
        onPress={() => navigation.navigate("purchasePriceOrder")}
        color="white"
      />

      <WarehouseModal
        visible={showWarehouseModal}
        onClose={() => setShowWarehouseModal(false)}
        onSelect={handleFulfillConfirm}
        warehouses={warehouseData?.warehouses?.edges || []}
        loading={warehouseLoading}
      />

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter By Date</Text>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setDateFilterType("deliveryDate");
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.modalText}>Delivery Date</Text>
              {dateFilterType === "deliveryDate" && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.textSecondary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalItem}
              onPress={() => {
                setDateFilterType("created");
                setShowFilterModal(false);
              }}
            >
              <Text style={styles.modalText}>Created Date</Text>
              {dateFilterType === "created" && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.textSecondary}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={{ color: colors.CANCELED }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmOrderModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmOrderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Order</Text>

            <Text
              style={{
                fontSize: 16,
                marginBottom: 24,
                color: theme.text,
                textAlign: "center",
              }}
            >
              Once confirmed, you will not be able to modify product quantities
              or remove items from this order.{" "}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
              }}
            >
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={() => setConfirmOrderModalVisible(false)}
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
                onPress={() => {
                  setConfirmOrderModalVisible(false);
                  handleConfirmOrder(confirmTargetOrderId);
                }}
              >
                <Text
                  style={{
                    color: theme.deliveryDate || "#4ade80",
                    fontWeight: "600",
                    fontSize: 16,
                  }}
                >
                  Yes, Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showChannelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChannelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Channel</Text>

            {channelsLoading ? (
              <ActivityIndicator size="large" color={theme.textSecondary} />
            ) : (
              <FlatList
                data={channelsData?.publicChannels || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleChannelSelect(item.id)}
                  >
                    <Text style={styles.modalText}>{item.name}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={theme.secondary}
                    />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text
                    style={{
                      textAlign: "center",
                      color: theme.secondary,
                      marginVertical: 20,
                    }}
                  >
                    No channels available.
                  </Text>
                }
              />
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowChannelModal(false)}
            >
              <Text style={{ color: colors.CANCELED }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDraftsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDraftsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <Text style={styles.modalTitle}>Draft Orders</Text>

            {draftsLoading ? (
              <ActivityIndicator
                size="large"
                color={theme.textSecondary}
                style={{ marginVertical: 20 }}
              />
            ) : (
              <FlatList
                data={draftData?.draftOrders?.edges || []}
                keyExtractor={(item) => item.node.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                  const dateStr = new Date(
                    item.node.created,
                  ).toLocaleDateString("en-CA");
                  const timeStr = new Date(
                    item.node.created,
                  ).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleDraftSelect(item.node.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.modalText, { fontWeight: "600" }]}>
                          Draft #{item.node.number}
                        </Text>
                        {item.node.billingAddress?.firstName && (
                          <Text
                            style={[styles.modalText, { fontWeight: "600" }]}
                          >
                            {`${item.node.billingAddress?.firstName} ${item.node.billingAddress?.lastName}`}
                          </Text>
                        )}
                        <Text style={[styles.modalText, { fontWeight: "600" }]}>
                          {`Order Total: ${item.node.total?.gross?.amount}`}
                        </Text>

                        <Text
                          style={{
                            color: theme.secondary,
                            fontSize: 13,
                            marginTop: 4,
                          }}
                        >
                          Created: {dateStr} at {timeStr}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.secondary}
                      />
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <Text
                    style={{
                      textAlign: "center",
                      color: theme.secondary,
                      marginVertical: 30,
                    }}
                  >
                    No draft orders found.
                  </Text>
                }
              />
            )}

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowDraftsModal(false)}
            >
              <Text style={{ color: colors.CANCELED }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
