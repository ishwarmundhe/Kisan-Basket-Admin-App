import React, {
  useCallback,
  useState,
  useEffect,
  useContext,
  useMemo,
  useRef,
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
  Modal,
  Alert,
  Animated,
} from "react-native";
import { Card, Text, FAB } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { debounce } from "lodash";
import ScreenLayout from "../ScreenLayout";
import ShimmerPlaceholder from "../../../components/custom/shimmerLoaderPlaceholder";
import ErrorMessage from "../../../components/custom/errorMessage";
import { colors } from "../../../constant/Colors";
import {
  ORDER_LIST_QUERY,
  MONTH_TOTAL_ORDERS,
  WAREHOUSE_LIST,
  ORDER_FULFILL_DATA,
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
import { Select } from "../../../components/ui/Select";

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
        // --- LAYOUT & SPACING ---
        searchCreateContainer: {
          flexDirection: "row",
          gap: 12, // Increased gap for better breathing room
          marginBottom: 16,
        },
        messageContainer: {
          alignItems: "center",
          justifyContent: "center",
          marginTop: 60,
        },
        errorText: {
          fontSize: 16,
          color: theme.secondary, // Use muted text for errors/empty states
        },
        flatListContent: {
          gap: 12,
          paddingTop: 10,
          paddingBottom: 80, // Space for FAB
        },

        // --- CARDS (The core "Black Item" look) ---
        card: {
          borderRadius: 8, // Slightly sharper corners (Shadcn style)
          padding: 16,
          marginHorizontal: 16, // Remove side margins if inside a padded container
          backgroundColor: theme.primary, // Zinc 900
          borderColor: theme.border, // Zinc 800
          borderWidth: 1,
        },
        cardInner: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start", // Align top to handle variable text heights
        },
        cardTitle: {
          color: theme.heading, // White
          fontSize: 16,
          fontWeight: "600", // Semi-bold looks cleaner than bold in dark mode
          marginBottom: 6,
          lineHeight: 22,
        },
        cardText: {
          color: theme.secondary, // Zinc 400 (Muted)
          fontSize: 14,
          marginBottom: 4,
        },
        addressTitle: {
          color: theme.text, // Zinc 50 (Brighter than secondary)
          fontWeight: "500",
        },
        deliveryText: {
          marginTop: 8,
          color: theme.deliveryDate, // Green 400
          fontWeight: "600",
          fontSize: 13,
          backgroundColor: `${theme.deliveryDate}15`, // Very subtle background tint
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
          backgroundColor: theme.primary, // Zinc 900
        },
        searchInput: {
          flex: 1,
          marginLeft: 8,
          color: theme.text, // White text
          fontSize: 15,
        },
        dateInput: {
          height: 48,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          marginTop: 0, // Removed top margin to fit better in layout
          marginBottom: 16,
          backgroundColor: theme.primary,
        },
        datePickerStyle: {
          color: theme.text,
          fontWeight: "500",
          fontSize: 15,
        },

        // --- BUTTONS ---
        createButton: {
          borderWidth: 1,
          borderColor: theme.textSecondary, // White border
          paddingHorizontal: 20,
          borderRadius: 8,
          height: 48,
          backgroundColor: theme.textSecondary, // White Background (Inverted)
          justifyContent: "center",
          alignItems: "center",
        },
        createButtonText: {
          color: theme.background, // **FIX: Black text on White button**
          fontWeight: "600",
          fontSize: 14,
        },

        // --- ACTION BUTTONS (Subtle Dark Mode Style) ---
        actionContainer: {
          flexDirection: "row",
          justifyContent: "flex-end", // Align actions to right
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: theme.border, // Separator line
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
        // Using slightly desaturated colors for dark mode to reduce eye strain
        confirmBtn: { backgroundColor: "#059669", borderWidth: 0 }, // Emerald 600
        fulfillBtn: { backgroundColor: "#2563eb", borderWidth: 0 }, // Blue 600
        paidBtn: { backgroundColor: "#d97706", borderWidth: 0 }, // Amber 600
        btnText: {
          color: "#FFFFFF",
          fontWeight: "600",
          fontSize: 13,
        },

        // --- ICONS & EXTRAS ---
        shareButton: {
          backgroundColor: theme.shareButtonColor, // Zinc 800
          padding: 8,
          borderRadius: 8, // Square-ish with radius looks more modern than circle
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
        fabIconColor: "#fafafa",

        // --- MODAL ---
        modalOverlay: {
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.8)", // Darker overlay for focus
          justifyContent: "center",
          alignItems: "center",
        },
        modalContent: {
          width: "90%",
          backgroundColor: theme.primary, // Zinc 900
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
        warehouseItem: {
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        warehouseText: {
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

        // --- SKELETON ---
        shimmerCard: {
          backgroundColor: theme.primary,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          padding: 16,
          marginBottom: 12,
        },
      }),
    [theme],
  );

// --- COMPONENT: Warehouse Selection Modal ---
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
                  style={styles.warehouseItem}
                  onPress={() => onSelect(item.node.id)}
                >
                  <Text style={styles.warehouseText}>{item.node.name}</Text>
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

// ... imports remain the same

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

    // --- COLOR LOGIC (Now checking Category Name first) ---
    const lines = order?.lines || [];
    
    // Helper to check both category name and fallback to product name
    const matchesCategory = (line, keyword) => {
      const categoryName = line?.variant?.product?.category?.name?.toLowerCase() || "";
      const productName = line?.productName?.toLowerCase() || "";
      return categoryName.includes(keyword) || productName.includes(keyword);
    };

    const hasOil = lines.some((l) => matchesCategory(l, "oil"));
    const hasAtta = lines.some((l) => matchesCategory(l, "atta"));
    const hasSpices = lines.some((l) => matchesCategory(l, "spice") || matchesCategory(l, "masala") || matchesCategory(l, "powder"));
    const hasPulses = lines.some((l) => matchesCategory(l, "pulse") || matchesCategory(l, "dal"));
    // You can also add a specific check for Vegetables if you want a custom color for them later
    // const hasVeg = lines.some((l) => matchesCategory(l, "vegetable"));

    // Default Style
    let dynamicCardStyle = {
      backgroundColor: "#18181b",
      borderColor: theme.border,
    };

    // Priority color matching
    if (hasOil) {
      dynamicCardStyle = {
        backgroundColor: "rgba(234, 179, 8, 0.15)", // Amber/Yellow
        borderColor: "#eab308",
      };
    } else if (hasAtta) {
      dynamicCardStyle = {
        backgroundColor: "rgba(249, 115, 22, 0.15)", // Orange
        borderColor: "#f97316",
      };
    } else if (hasSpices) {
      dynamicCardStyle = {
        backgroundColor: "rgba(239, 68, 68, 0.15)", // Red for Spices
        borderColor: "#ef4444",
      };
    } else if (hasPulses) {
      dynamicCardStyle = {
        backgroundColor: "rgba(16, 185, 129, 0.15)", // Emerald for Pulses
        borderColor: "#10b981",
      };
    }

    // CANCELED OPACITY
    const isCanceled = order?.status === "CANCELED";
    const finalCardStyle = [
      styles.card,
      dynamicCardStyle,
      isCanceled && {
        opacity: 0.4,
        borderColor: theme.border,
        backgroundColor: theme.primary,
      },
    ];

    const fullName =
      `${order?.billingAddress?.firstName ?? ""} ${order?.billingAddress?.lastName ?? ""}`.trim();
    const addressLine1 = order?.billingAddress?.streetAddress1 ?? "";
    const itemNames = lines.map((l) => l.productName).join(", ");

    return (
      <TouchableOpacity onPress={() => onPress(order?.id)}>
        <Card style={finalCardStyle}>
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

          {/* --- ACTION BUTTONS --- */}
          <View style={styles.actionContainer}>
            {order?.status === "UNCONFIRMED" && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.confirmBtn]}
                onPress={() => onConfirm(order.id)}
                disabled={loadingActionId === order.id}
              >
                {loadingActionId === order.id ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.btnText}>Confirm</Text>
                )}
              </TouchableOpacity>
            )}

            {(order?.status === "UNFULFILLED" ||
              order?.status === "PARTIALLY_FULFILLED") && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.fulfillBtn]}
                onPress={() => onFulfill(order.id)}
                disabled={loadingActionId === order.id}
              >
                <Text style={styles.btnText}>Fulfill</Text>
              </TouchableOpacity>
            )}

            {order?.status === "FULFILLED" && !order?.isPaid && (
              <TouchableOpacity
                style={[styles.actionBtn, styles.paidBtn]}
                onPress={() => onMarkPaid(order.id)}
                disabled={loadingActionId === order.id}
              >
                <Text style={styles.btnText}>Mark Paid</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>
      </TouchableOpacity>
    );
  },
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
  const [activeFilter, setActiveFilter] = useState("All");

  // New State for Actions
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [fulfillTargetOrderId, setFulfillTargetOrderId] = useState(null);

  const scrollY = useRef(new Animated.Value(0)).current;

  // ── Measure real heights dynamically ──
  const [statsHeight, setStatsHeight] = useState(0);
  const [searchHeight, setSearchHeight] = useState(0);
  const totalHeaderHeight = statsHeight + searchHeight;

  // Stats slides up and fades
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

  // Search bar moves up by the same amount as stats height
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
    [selectedDate] // Dependency array ensures it updates when you pick a new date
  );

  const todayDate = useMemo(
    () => selectedDate?.toLocaleDateString("en-CA"),
    [selectedDate],
  );

  // --- QUERIES & MUTATIONS ---

  const [
    fetchOrders,
    { data: orderList, loading, error: orderListError, refetch },
  ] = useLazyQuery(ORDER_LIST_QUERY);

const { data: monthlyOrdersData } = useQuery(MONTH_TOTAL_ORDERS, {
    variables: getSelectedMonthDateRange,
  });

  const { data: warehouseData, loading: warehouseLoading } =
    useQuery(WAREHOUSE_LIST);

  // Used to get lines before fulfilling
  const [fetchFulfillData] = useLazyQuery(ORDER_FULFILL_DATA, {
    fetchPolicy: "network-only",
  });

  const [createDraftOrder, { loading: draftOrderLoading }] =
    useMutation(ORDER_DRAFT_CREATE);
  const [confirmOrder] = useMutation(ORDER_CONFIRM);
  const [fulfillOrder] = useMutation(FULFILL_ORDER);
  const [markAsPaid] = useMutation(ORDER_MARK_AS_PAID);

  const orders = useMemo(() => orderList?.orders?.edges ?? [], [orderList]);
  console.log("==>", orders);
  const hasOrders = orders.length > 0;
  const currentMonthOrderCount = monthlyOrdersData?.orders?.totalCount ?? 0;

const stats = useMemo(() => {
    let atta = 0;
    let oil = 0;
    let veg = 0;
    let spices = 0;
    let pulses = 0;

    orders.forEach((edge) => {
      // Skip the entire order if it is canceled
      if (edge.node.status === "CANCELED") {
        return; 
      }

      const lines = edge.node.lines || [];
      
      const checkCategory = (line, keyword) => {
        const cat = line?.variant?.product?.category?.name?.toLowerCase() || "";
        const name = line?.productName?.toLowerCase() || "";
        return cat.includes(keyword) || name.includes(keyword);
      };

      const hasAtta = lines.some((l) => checkCategory(l, "atta"));
      const hasOil = lines.some((l) => checkCategory(l, "oil"));
      const hasSpices = lines.some((l) => checkCategory(l, "spice") || checkCategory(l, "masala") || checkCategory(l, "powder"));
      const hasPulses = lines.some((l) => checkCategory(l, "pulse") || checkCategory(l, "dal"));
      
      // Specifically look for 'vegetable' category first, then fallback to anything that doesn't match the others
      const hasVeg = lines.some((l) => {
        const cat = l?.variant?.product?.category?.name?.toLowerCase() || "";
        if (cat.includes("vegetable")) return true;
        
        // Fallback for uncategorized items
        return !checkCategory(l, "atta") && 
               !checkCategory(l, "oil") && 
               !checkCategory(l, "spice") && 
               !checkCategory(l, "masala") && 
               !checkCategory(l, "powder") && 
               !checkCategory(l, "pulse") && 
               !checkCategory(l, "dal");
      });

      if (hasAtta) atta++;
      if (hasOil) oil++;
      if (hasSpices) spices++;
      if (hasPulses) pulses++;
      if (hasVeg) veg++;
    });

    return { atta, oil, veg, spices, pulses };
  }, [orders]);

  // --- HANDLERS ---

  // --- NEW: Filter the orders based on selected dashboard card ---
  const displayedOrders = useMemo(() => {
    if (activeFilter === "All") return orders;

    return orders.filter((edge) => {
      const lines = edge.node.lines || [];

      // Reusable checking function
      const checkCategory = (line, keyword) => {
        const cat = line?.variant?.product?.category?.name?.toLowerCase() || "";
        const name = line?.productName?.toLowerCase() || "";
        return cat.includes(keyword) || name.includes(keyword);
      };

      if (activeFilter === "Atta") return lines.some(l => checkCategory(l, "atta"));
      if (activeFilter === "Oil") return lines.some(l => checkCategory(l, "oil"));
      if (activeFilter === "Spices") return lines.some(l => checkCategory(l, "spice") || checkCategory(l, "masala") || checkCategory(l, "powder"));
      if (activeFilter === "Pulses") return lines.some(l => checkCategory(l, "pulse") || checkCategory(l, "dal"));
      if (activeFilter === "Vegetable") return lines.some(l => {
        const cat = l?.variant?.product?.category?.name?.toLowerCase() || "";
        if (cat.includes("vegetable")) return true;
        // Fallback for Veg/Other
        return !checkCategory(l, "atta") && !checkCategory(l, "oil") && !checkCategory(l, "spice") && !checkCategory(l, "masala") && !checkCategory(l, "powder") && !checkCategory(l, "pulse") && !checkCategory(l, "dal");
      });

      return true;
    });
  }, [orders, activeFilter]);

  // 1. Confirm Order
  const handleConfirmOrder = async (id) => {
    setLoadingActionId(id);
    try {
      const { data } = await confirmOrder({ variables: { id } });
      if (data?.orderConfirm?.errors?.length > 0) {
        toast.error(data.orderConfirm.errors[0].message);
      } else {
        toast.success("Order Confirmed!");
        handleRefresh(); // Refresh list to update status
      }
    } catch (e) {
      console.log("err", e);

      toast.error("Failed to confirm order");
    } finally {
      setLoadingActionId(null);
    }
  };

  // 2. Mark as Paid
  // In ProductSelectionScreen.js

  const handleMarkPaid = async (id) => {
    setLoadingActionId(id);
    try {
      const { data } = await markAsPaid({ variables: { id } });
      console.log("data", data);
      const errors = data?.orderMarkAsPaid?.errors || [];

      if (errors.length > 0) {
        const error = errors[0];

        // Handle the specific "Payment Exists" error
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
        handleRefresh();
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to mark as paid");
    } finally {
      setLoadingActionId(null);
    }
  };

  // 3. Fulfill - Step 1: Open Warehouse Modal
  const onFulfillClick = (id) => {
    setFulfillTargetOrderId(id);
    setShowWarehouseModal(true);
  };

  // 3. Fulfill - Step 2: Select Warehouse & Execute
  const handleFulfillConfirm = async (warehouseId) => {
    setShowWarehouseModal(false);
    if (!fulfillTargetOrderId) return;

    setLoadingActionId(fulfillTargetOrderId);
    try {
      // A. Get Order Lines first (needed for input construction)
      const { data: lineData } = await fetchFulfillData({
        variables: { orderId: fulfillTargetOrderId },
      });

      const lines = lineData?.order?.lines || [];

      // Filter lines that actually need fulfillment
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

      // B. Run Mutation
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
        handleRefresh();
      }
    } catch (e) {
      console.error(e);
      toast.error("Fulfillment failed");
    } finally {
      setLoadingActionId(null);
      setFulfillTargetOrderId(null);
    }
  };

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
    [fetchOrders, todayDate],
  );

  const handleSearchChange = useCallback(
    (text) => {
      setSearchQuery(text);
      debouncedSearch(text);
    },
    [debouncedSearch],
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
      if (date) setSelectedDate(date);
      debouncedSearch(searchQuery);
    },
    [debouncedSearch, searchQuery],
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
        onConfirm={handleConfirmOrder}
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

  useFocusEffect(
    useCallback(() => {
      if (globalRefresh) {
        debouncedSearch("");
        setTimeout(() => setGlobalRefresh(false), 300);
      }
      return () => debouncedSearch.cancel();
    }, [debouncedSearch, globalRefresh, setGlobalRefresh]),
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
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <View style={{ flex: 1 }}>
        {/* ── LAYER 1: DashboardStats ── */}
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
            spicesCount={stats.spices} // Add this line
            pulsesCount={stats.pulses} // Add this line
            todaysOrderCount={orders.filter((order) => order?.node?.status !== "CANCELED").length}
            totalOrdersCount={currentMonthOrderCount}
            onPress={() => navigation.navigate("Performance")}
            activeFilter={activeFilter} // <-- ADD THIS
            onFilterSelect={setActiveFilter}
          />
        </Animated.View>

        {/* ── LAYER 2: Search + Date (sits below stats, sticks after stats hide) ── */}
        <Animated.View
          onLayout={(e) => setSearchHeight(e.nativeEvent.layout.height)}
          style={{
            position: "absolute",
            top: statsHeight, // ← starts right below measured stats
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
        </Animated.View>

        {/* ── LAYER 3: FlatList — paddingTop = exact combined header height ── */}
        {totalHeaderHeight > 0 && ( // ← only render once heights are known
          <Animated.FlatList
            data={displayedOrders}
            keyExtractor={(item) => item?.node?.id}
            contentContainerStyle={[
              styles.flatListContent,
              { paddingTop: totalHeaderHeight }, // ← exact measured value
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

        {loading && <LoadingSkeleton theme={theme} />}
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
    </ScreenLayout>
  );
}
