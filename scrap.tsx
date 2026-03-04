// import React, {
//   useCallback,
//   useState,
//   useEffect,
//   useContext,
//   useMemo,
//   useRef,
// } from "react";
// import { useFocusEffect } from "@react-navigation/native";
// import {
//   View,
//   TextInput,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   RefreshControl,
//   Modal,
//   Alert,
//   Animated,
// } from "react-native";
// import { Card, Text, FAB } from "react-native-paper";
// import Ionicons from "react-native-vector-icons/Ionicons";
// import DateTimePicker from "@react-native-community/datetimepicker";
// import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
// import { debounce } from "lodash";
// import ScreenLayout from "../ScreenLayout";
// import ShimmerPlaceholder from "../../../components/custom/shimmerLoaderPlaceholder";
// import ErrorMessage from "../../../components/custom/errorMessage";
// import { colors } from "../../../constant/Colors";
// import {
//   ORDER_LIST_QUERY,
//   MONTH_TOTAL_ORDERS,
//   WAREHOUSE_LIST,
//   ORDER_FULFILL_DATA,
// } from "../../../graphql/Query";
// import {
//   ORDER_DRAFT_CREATE,
//   ORDER_CONFIRM,
//   ORDER_MARK_AS_PAID,
//   FULFILL_ORDER,
// } from "../../../graphql/Mutation";
// import { generateAndShareInvoice } from "../../../utils/Invoice";
// import { AuthContext } from "../../../constant/AuthProvider";
// import { toast } from "sonner-native";
// import { useTheme } from "../../../constant/ThemeContext";
// import DashboardStats from "../productsTab/DashboardStats";
// import moment from "moment";
// import { Select } from "../../../components/ui/Select";

// // Status color mapping
// const STATUS_COLORS = {
//   CANCELED: colors.CANCELED,
//   UNCONFIRMED: colors.UNCONFIRMED,
//   UNFULFILLED: colors.UNFULFILLED,
//   DEFAULT: colors.WHITE,
// };

// const useStyle = (theme) =>
//   useMemo(
//     () =>
//       StyleSheet.create({
//         // --- LAYOUT & SPACING ---
//         searchCreateContainer: {
//           flexDirection: "row",
//           gap: 12, // Increased gap for better breathing room
//           marginBottom: 16,
//         },
//         messageContainer: {
//           alignItems: "center",
//           justifyContent: "center",
//           marginTop: 60,
//         },
//         errorText: {
//           fontSize: 16,
//           color: theme.secondary, // Use muted text for errors/empty states
//         },
//         flatListContent: {
//           gap: 12,
//           paddingTop: 10,
//           paddingBottom: 80, // Space for FAB
//         },

//         // --- CARDS (The core "Black Item" look) ---
//         card: {
//           borderRadius: 8, // Slightly sharper corners (Shadcn style)
//           padding: 16,
//           marginHorizontal: 0, // Remove side margins if inside a padded container
//           backgroundColor: theme.primary, // Zinc 900
//           borderColor: theme.border, // Zinc 800
//           borderWidth: 1,
//         },
//         cardInner: {
//           flexDirection: "row",
//           justifyContent: "space-between",
//           alignItems: "flex-start", // Align top to handle variable text heights
//         },
//         cardTitle: {
//           color: theme.heading, // White
//           fontSize: 16,
//           fontWeight: "600", // Semi-bold looks cleaner than bold in dark mode
//           marginBottom: 6,
//           lineHeight: 22,
//         },
//         cardText: {
//           color: theme.secondary, // Zinc 400 (Muted)
//           fontSize: 14,
//           marginBottom: 4,
//         },
//         addressTitle: {
//           color: theme.text, // Zinc 50 (Brighter than secondary)
//           fontWeight: "500",
//         },
//         deliveryText: {
//           marginTop: 8,
//           color: theme.deliveryDate, // Green 400
//           fontWeight: "600",
//           fontSize: 13,
//           backgroundColor: `${theme.deliveryDate}15`, // Very subtle background tint
//           alignSelf: "flex-start",
//           paddingHorizontal: 8,
//           paddingVertical: 2,
//           borderRadius: 4,
//           overflow: "hidden",
//         },

//         // --- INPUTS & SEARCH ---
//         searchContainer: {
//           flex: 1,
//           flexDirection: "row",
//           alignItems: "center",
//           borderWidth: 1,
//           borderColor: theme.border,
//           borderRadius: 8,
//           paddingHorizontal: 12,
//           height: 48,
//           backgroundColor: theme.primary, // Zinc 900
//         },
//         searchInput: {
//           flex: 1,
//           marginLeft: 8,
//           color: theme.text, // White text
//           fontSize: 15,
//         },
//         dateInput: {
//           height: 48,
//           paddingHorizontal: 12,
//           flexDirection: "row",
//           alignItems: "center",
//           gap: 10,
//           borderWidth: 1,
//           borderColor: theme.border,
//           borderRadius: 8,
//           marginTop: 0, // Removed top margin to fit better in layout
//           marginBottom: 16,
//           backgroundColor: theme.primary,
//         },
//         datePickerStyle: {
//           color: theme.text,
//           fontWeight: "500",
//           fontSize: 15,
//         },

//         // --- BUTTONS ---
//         createButton: {
//           borderWidth: 1,
//           borderColor: theme.textSecondary, // White border
//           paddingHorizontal: 20,
//           borderRadius: 8,
//           height: 48,
//           backgroundColor: theme.textSecondary, // White Background (Inverted)
//           justifyContent: "center",
//           alignItems: "center",
//         },
//         createButtonText: {
//           color: theme.background, // **FIX: Black text on White button**
//           fontWeight: "600",
//           fontSize: 14,
//         },

//         // --- ACTION BUTTONS (Subtle Dark Mode Style) ---
//         actionContainer: {
//           flexDirection: "row",
//           justifyContent: "flex-end", // Align actions to right
//           marginTop: 16,
//           paddingTop: 16,
//           borderTopWidth: 1,
//           borderTopColor: theme.border, // Separator line
//           gap: 10,
//         },
//         actionBtn: {
//           paddingVertical: 8,
//           paddingHorizontal: 16,
//           borderRadius: 6,
//           alignItems: "center",
//           justifyContent: "center",
//           minWidth: 80,
//         },
//         // Using slightly desaturated colors for dark mode to reduce eye strain
//         confirmBtn: { backgroundColor: "#059669", borderWidth: 0 }, // Emerald 600
//         fulfillBtn: { backgroundColor: "#2563eb", borderWidth: 0 }, // Blue 600
//         paidBtn: { backgroundColor: "#d97706", borderWidth: 0 }, // Amber 600
//         btnText: {
//           color: "#FFFFFF",
//           fontWeight: "600",
//           fontSize: 13,
//         },

//         // --- ICONS & EXTRAS ---
//         shareButton: {
//           backgroundColor: theme.shareButtonColor, // Zinc 800
//           padding: 8,
//           borderRadius: 8, // Square-ish with radius looks more modern than circle
//           borderWidth: 1,
//           borderColor: theme.border,
//         },
//         fab: {
//           position: "absolute",
//           right: 20,
//           bottom: 30,
//           backgroundColor: "#18181b",
//           borderWidth: 1,
//           borderColor: "#27272a",

//           width: 60,
//           height: 60,
//           borderRadius: 30,
//           justifyContent: "center",
//           alignItems: "center",
//           elevation: 6,
//           shadowColor: "#000000",
//           shadowOffset: { width: 0, height: 4 },
//           shadowOpacity: 0.3,
//           shadowRadius: 4,
//         },
//         fabIconColor: "#fafafa",

//         // --- MODAL ---
//         modalOverlay: {
//           flex: 1,
//           backgroundColor: "rgba(0,0,0,0.8)", // Darker overlay for focus
//           justifyContent: "center",
//           alignItems: "center",
//         },
//         modalContent: {
//           width: "90%",
//           backgroundColor: theme.primary, // Zinc 900
//           borderRadius: 12,
//           padding: 24,
//           borderWidth: 1,
//           borderColor: theme.border,
//         },
//         modalTitle: {
//           fontSize: 20,
//           fontWeight: "bold",
//           color: theme.heading,
//           marginBottom: 20,
//           textAlign: "center",
//         },
//         warehouseItem: {
//           paddingVertical: 16,
//           borderBottomWidth: 1,
//           borderBottomColor: theme.border,
//         },
//         warehouseText: {
//           color: theme.text,
//           fontSize: 16,
//         },
//         closeBtn: {
//           marginTop: 20,
//           padding: 12,
//           backgroundColor: theme.shareButtonColor,
//           borderRadius: 8,
//           alignItems: "center",
//         },

//         // --- SKELETON ---
//         shimmerCard: {
//           backgroundColor: theme.primary,
//           borderWidth: 1,
//           borderColor: theme.border,
//           borderRadius: 8,
//           padding: 16,
//           marginBottom: 12,
//         },
//       }),
//     [theme],
//   );

// // --- COMPONENT: Warehouse Selection Modal ---
// const WarehouseModal = ({
//   visible,
//   onClose,
//   onSelect,
//   warehouses,
//   loading,
// }) => {
//   const { theme } = useTheme();
//   const styles = useStyle(theme);

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="fade"
//       onRequestClose={onClose}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <Text style={styles.modalTitle}>Select Warehouse</Text>
//           {loading ? (
//             <ActivityIndicator
//               size="large"
//               color={colors.PRIMARY_BUTTON_BACKGROUND}
//             />
//           ) : (
//             <FlatList
//               data={warehouses}
//               keyExtractor={(item) => item.node.id}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={styles.warehouseItem}
//                   onPress={() => onSelect(item.node.id)}
//                 >
//                   <Text style={styles.warehouseText}>{item.node.name}</Text>
//                 </TouchableOpacity>
//               )}
//             />
//           )}
//           <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
//             <Text style={{ color: colors.CANCELED }}>Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// // ... imports remain the same

// const OrderItem = React.memo(
//   ({
//     item,
//     onPress,
//     onShare,
//     invoiceLoadder,
//     selectedOrderId,
//     onConfirm,
//     onFulfill,
//     onMarkPaid,
//     loadingActionId,
//   }) => {
//     const order = item?.node;
//     const { theme } = useTheme();
//     const styles = useStyle(theme);

//     // --- COLOR LOGIC ---
//     const lines = order?.lines || [];

//     const hasOil = lines.some((l) =>
//       l.productName?.toLowerCase().includes("oil"),
//     );
//     const hasAtta = lines.some((l) =>
//       l.productName?.toLowerCase().includes("atta"),
//     );

//     // Default Style (Vegetable / Standard) - Zinc Style
//     let cardStyle = styles.card;
//     let statusColor = colors.UNCONFIRMED;

//     // PRIORITY 1: OIL (Yellow)
//     let dynamicCardStyle = {};

//     if (hasOil) {
//       dynamicCardStyle = {
//         backgroundColor: "rgba(234, 179, 8, 0.15)", // Yellow tint
//         borderColor: "#eab308",
//       };
//     } else if (hasAtta) {
//       dynamicCardStyle = {
//         backgroundColor: "rgba(249, 115, 22, 0.15)", // Orange tint
//         borderColor: "#f97316",
//       };
//     } else {
//       dynamicCardStyle = {
//         backgroundColor: "#18181b", // Veg subtle green
//         borderColor: theme.border,
//       };
//     }

//     // ─── 2. APPLY CANCELED OPACITY ───
//     const isCanceled = order?.status === "CANCELED";

//     const finalCardStyle = [
//       styles.card,
//       dynamicCardStyle,
//       isCanceled && {
//         opacity: 0.4, // Dim the card significantly
//         borderColor: theme.border, // Reset border to muted color
//         backgroundColor: theme.primary, // Reset to standard dark background
//       },
//     ];

//     const fullName =
//       `${order?.billingAddress?.firstName ?? ""} ${order?.billingAddress?.lastName ?? ""}`.trim();
//     const addressLine1 = order?.billingAddress?.streetAddress1 ?? "";

//     // Helper to list items nicely
//     const itemNames = lines.map((l) => l.productName).join(", ");

//     return (
//       <TouchableOpacity onPress={() => onPress(order?.id)}>
//         <Card style={finalCardStyle}>
//           <View style={styles.cardInner}>
//             <View style={{ flex: 1 }}>
//               <Text style={styles.cardTitle}>{addressLine1}</Text>

//               <Text style={styles.cardText}>
//                 Name: <Text style={styles.addressTitle}>{fullName}</Text>
//               </Text>

//               {/* Show Items for easier identification */}
//               <Text style={styles.cardText} numberOfLines={1}>
//                 Items: <Text style={{ color: theme.text }}>{itemNames}</Text>
//               </Text>

//               <Text style={styles.cardText}>
//                 Status:{" "}
//                 <Text
//                   style={{
//                     color:
//                       STATUS_COLORS[order?.status] || STATUS_COLORS.DEFAULT,
//                     fontWeight: "700",
//                   }}
//                 >
//                   {order?.status}
//                 </Text>
//               </Text>

//               <Text style={styles.cardText}>
//                 Amount: {order?.total?.gross?.currency}{" "}
//                 {order?.total?.gross?.amount}
//               </Text>

//               <Text style={styles.deliveryText}>
//                 Delivery: {order?.deliveryDate ?? "-"}
//               </Text>
//             </View>

//             {/* ... Right side buttons (Share, etc) ... */}
//             <TouchableOpacity
//               style={styles.shareButton}
//               onPress={() => onShare(order?.id, order?.status)}
//               disabled={
//                 order?.status === "UNCONFIRMED" || order?.status === "DRAFT"
//               }
//             >
//               {invoiceLoadder && selectedOrderId === order.id ? (
//                 <ActivityIndicator size="small" color={colors.WHITE} />
//               ) : (
//                 <Ionicons
//                   name="share-social-outline"
//                   size={20}
//                   color={colors.WHITE}
//                 />
//               )}
//             </TouchableOpacity>
//           </View>
//           <View style={styles.actionContainer}>
//             {order?.status === "UNCONFIRMED" && (
//               <TouchableOpacity
//                 style={[styles.actionBtn, styles.confirmBtn]}
//                 onPress={() => onConfirm(order.id)}
//                 disabled={loadingActionId === order.id}
//               >
//                 {loadingActionId === order.id ? (
//                   <ActivityIndicator color="#FFF" size="small" />
//                 ) : (
//                   <Text style={styles.btnText}>Confirm</Text>
//                 )}
//               </TouchableOpacity>
//             )}
//           </View>
//         </Card>
//       </TouchableOpacity>
//     );
//   },
// );

// const LoadingSkeleton = ({ theme }) => {
//   const styles = useStyle(theme);
//   return (
//     <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
//       {[...Array(6)].map((_, index) => (
//         <View key={index} style={styles.shimmerCard}>
//           <ShimmerPlaceholder height={30} width="60%" borderRadius={6} />
//           <ShimmerPlaceholder height={20} width="60%" borderRadius={6} />
//           <View style={{ marginTop: 5 }}>
//             <ShimmerPlaceholder height={16} width="80%" borderRadius={4} />
//           </View>
//         </View>
//       ))}
//     </View>
//   );
// };

// export default function ProductSelectionScreen({ navigation }) {
//   const { theme } = useTheme();
//   const styles = useStyle(theme);

//   const { globalRefresh, setGlobalRefresh } = useContext(AuthContext);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedDate, setSelectedDate] = useState(new Date());
//   const [showPicker, setShowPicker] = useState(false);
//   const [invoiceLoadder, setInvoiceLoading] = useState(false);
//   const [selectedOrderId, setSelectedOrderId] = useState(null);
//   const [refreshing, setRefreshing] = useState(false);

//   // New State for Actions
//   const [loadingActionId, setLoadingActionId] = useState(null);
//   const [showWarehouseModal, setShowWarehouseModal] = useState(false);
//   const [fulfillTargetOrderId, setFulfillTargetOrderId] = useState(null);

//   const scrollY = useRef(new Animated.Value(0)).current;

//   // ── Measure real heights dynamically ──
//   const [statsHeight, setStatsHeight] = useState(0);
//   const [searchHeight, setSearchHeight] = useState(0);
//   const totalHeaderHeight = statsHeight + searchHeight;

//   // Stats slides up and fades
//   const statsTranslateY = scrollY.interpolate({
//     inputRange: [0, statsHeight || 1],
//     outputRange: [0, -statsHeight],
//     extrapolate: "clamp",
//   });
//   const statsOpacity = scrollY.interpolate({
//     inputRange: [0, (statsHeight || 1) * 0.6],
//     outputRange: [1, 0],
//     extrapolate: "clamp",
//   });

//   // Search bar moves up by the same amount as stats height
//   const searchTranslateY = scrollY.interpolate({
//     inputRange: [0, statsHeight || 1],
//     outputRange: [0, -statsHeight],
//     extrapolate: "clamp",
//   });

//   const getCurrentMonthDateRange = useMemo(
//     () => ({
//       gte: moment().startOf("month").format("YYYY-MM-DD"),
//       lte: moment().endOf("month").format("YYYY-MM-DD"),
//     }),
//     [],
//   );

//   const todayDate = useMemo(
//     () => selectedDate?.toLocaleDateString("en-CA"),
//     [selectedDate],
//   );

//   // --- QUERIES & MUTATIONS ---

//   const [
//     fetchOrders,
//     { data: orderList, loading, error: orderListError, refetch },
//   ] = useLazyQuery(ORDER_LIST_QUERY);

//   const { data: monthlyOrdersData } = useQuery(MONTH_TOTAL_ORDERS, {
//     variables: getCurrentMonthDateRange,
//   });

//   const { data: warehouseData, loading: warehouseLoading } =
//     useQuery(WAREHOUSE_LIST);

//   // Used to get lines before fulfilling
//   const [fetchFulfillData] = useLazyQuery(ORDER_FULFILL_DATA, {
//     fetchPolicy: "network-only",
//   });

//   const [createDraftOrder, { loading: draftOrderLoading }] =
//     useMutation(ORDER_DRAFT_CREATE);
//   const [confirmOrder] = useMutation(ORDER_CONFIRM);
//   const [fulfillOrder] = useMutation(FULFILL_ORDER);
//   const [markAsPaid] = useMutation(ORDER_MARK_AS_PAID);

//   const orders = useMemo(() => orderList?.orders?.edges ?? [], [orderList]);
//   console.log("==>", orders);
//   const hasOrders = orders.length > 0;
//   const currentMonthOrderCount = monthlyOrdersData?.orders?.totalCount ?? 0;

//   const stats = useMemo(() => {
//     let atta = 0;
//     let oil = 0;
//     let veg = 0;

//     orders.forEach((edge) => {
//       const lines = edge.node.lines || [];
//       const hasAtta = lines.some((l) =>
//         l.productName?.toLowerCase().includes("atta"),
//       );
//       const hasOil = lines.some((l) =>
//         l.productName?.toLowerCase().includes("oil"),
//       );
//       const hasVeg = lines.some(
//         (l) =>
//           !l.productName?.toLowerCase().includes("atta") &&
//           !l.productName?.toLowerCase().includes("oil"),
//       );
//       if (hasAtta) atta++;
//       if (hasOil) oil++;
//       if (hasVeg) veg++;
//     });

//     return { atta, oil, veg };
//   }, [orders]);

//   // --- HANDLERS ---

//   // 1. Confirm Order
//   const handleConfirmOrder = async (id) => {
//     setLoadingActionId(id);
//     try {
//       const { data } = await confirmOrder({ variables: { id } });
//       if (data?.orderConfirm?.errors?.length > 0) {
//         toast.error(data.orderConfirm.errors[0].message);
//       } else {
//         toast.success("Order Confirmed!");
//         handleRefresh(); // Refresh list to update status
//       }
//     } catch (e) {
//       console.log("err", e);

//       toast.error("Failed to confirm order");
//     } finally {
//       setLoadingActionId(null);
//     }
//   };

//   // 2. Mark as Paid
//   const handleMarkPaid = async (id) => {
//     setLoadingActionId(id);
//     try {
//       const { data } = await markAsPaid({ variables: { id } });
//       if (data?.orderMarkAsPaid?.errors?.length > 0) {
//         toast.error(data.orderMarkAsPaid.errors[0].message);
//       } else {
//         toast.success("Marked as Paid!");
//         handleRefresh();
//       }
//     } catch (e) {
//       toast.error("Failed to mark as paid");
//     } finally {
//       setLoadingActionId(null);
//     }
//   };

//   // 3. Fulfill - Step 1: Open Warehouse Modal
//   const onFulfillClick = (id) => {
//     setFulfillTargetOrderId(id);
//     setShowWarehouseModal(true);
//   };

//   // 3. Fulfill - Step 2: Select Warehouse & Execute
//   const handleFulfillConfirm = async (warehouseId) => {
//     setShowWarehouseModal(false);
//     if (!fulfillTargetOrderId) return;

//     setLoadingActionId(fulfillTargetOrderId);
//     try {
//       // A. Get Order Lines first (needed for input construction)
//       const { data: lineData } = await fetchFulfillData({
//         variables: { orderId: fulfillTargetOrderId },
//       });

//       const lines = lineData?.order?.lines || [];

//       // Filter lines that actually need fulfillment
//       const linesInput = lines
//         .filter((l) => l.quantityToFulfill > 0)
//         .map((l) => ({
//           orderLineId: l.id,
//           stocks: [{ quantity: l.quantityToFulfill, warehouse: warehouseId }],
//         }));

//       if (linesInput.length === 0) {
//         toast.message("Nothing to fulfill or Order already fulfilled");
//         return;
//       }

//       // B. Run Mutation
//       const { data } = await fulfillOrder({
//         variables: {
//           orderId: fulfillTargetOrderId,
//           input: { lines: linesInput },
//         },
//       });

//       if (data?.orderFulfill?.errors?.length > 0) {
//         toast.error(data.orderFulfill.errors[0].message);
//       } else {
//         toast.success("Order Fulfilled!");
//         handleRefresh();
//       }
//     } catch (e) {
//       console.error(e);
//       toast.error("Fulfillment failed");
//     } finally {
//       setLoadingActionId(null);
//       setFulfillTargetOrderId(null);
//     }
//   };

//   const debouncedSearch = useMemo(
//     () =>
//       debounce((query) => {
//         const safeQuery = query ?? "";
//         fetchOrders({
//           variables: {
//             first: 100,
//             filter: {
//               created: { gte: todayDate, lte: todayDate },
//               ...(safeQuery.trim() && { search: safeQuery }),
//             },
//             sort: { direction: "DESC", field: "NUMBER" },
//           },
//           fetchPolicy: "network-only",
//         });
//       }, 500),
//     [fetchOrders, todayDate],
//   );

//   const handleSearchChange = useCallback(
//     (text) => {
//       setSearchQuery(text);
//       debouncedSearch(text);
//     },
//     [debouncedSearch],
//   );

//   const orderDraftCreateHandler = useCallback(async () => {
//     try {
//       const result = await createDraftOrder();
//       const orderId = result?.data?.draftOrderCreate?.order?.id || "";
//       navigation.navigate("createOrder", { order_id: orderId });
//     } catch {}
//   }, [createDraftOrder, navigation]);

//   const handleOrderDetails = useCallback(
//     (order_id) => {
//       if (order_id) {
//         navigation.navigate("createOrder", {
//           order_id,
//           cancellationOrder: true,
//         });
//       }
//     },
//     [navigation],
//   );

//   const handleGenerateInvoice = useCallback(async (orderId, status) => {
//     setSelectedOrderId(orderId);
//     setInvoiceLoading(true);
//     try {
//       await generateAndShareInvoice(orderId, status);
//     } finally {
//       setInvoiceLoading(false);
//     }
//   }, []);

//   const onChangeDate = useCallback(
//     (event, date) => {
//       setShowPicker(false);
//       if (date) setSelectedDate(date);
//       debouncedSearch(searchQuery);
//     },
//     [debouncedSearch, searchQuery],
//   );

//   const handleRefresh = useCallback(async () => {
//     setRefreshing(true);
//     try {
//       await refetch({
//         first: 100,
//         filter: {
//           created: { gte: todayDate, lte: todayDate },
//           ...(searchQuery.trim() && { search: searchQuery }),
//         },
//         sort: { direction: "DESC", field: "NUMBER" },
//       });
//     } catch (e) {
//       toast.error("Refresh error", e);
//     } finally {
//       setRefreshing(false);
//     }
//   }, [refetch, todayDate, searchQuery]);

//   const renderOrderItem = useCallback(
//     ({ item }) => (
//       <OrderItem
//         item={item}
//         onPress={handleOrderDetails}
//         onShare={handleGenerateInvoice}
//         invoiceLoadder={invoiceLoadder}
//         selectedOrderId={selectedOrderId}
//         onConfirm={handleConfirmOrder}
//         onFulfill={onFulfillClick}
//         onMarkPaid={handleMarkPaid}
//         loadingActionId={loadingActionId}
//       />
//     ),
//     [
//       handleOrderDetails,
//       handleGenerateInvoice,
//       invoiceLoadder,
//       selectedOrderId,
//       loadingActionId,
//     ],
//   );

//   useFocusEffect(
//     useCallback(() => {
//       if (globalRefresh) {
//         debouncedSearch("");
//         setTimeout(() => setGlobalRefresh(false), 300);
//       }
//       return () => debouncedSearch.cancel();
//     }, [debouncedSearch, globalRefresh, setGlobalRefresh]),
//   );

//   useEffect(() => {
//     debouncedSearch(searchQuery);
//   }, [selectedDate]);

//   useEffect(() => {
//     return () => debouncedSearch.cancel();
//   }, []);

//   if (orderListError) return <ErrorMessage errorMessage={orderListError} />;

//   return (
//     <ScreenLayout>
//       {showPicker && (
//         <DateTimePicker
//           value={selectedDate}
//           mode="date"
//           display="default"
//           onChange={onChangeDate}
//         />
//       )}

//       <View style={{ flex: 1 }}>
//         {/* ── LAYER 1: DashboardStats ── */}
//         <Animated.View
//           onLayout={(e) => setStatsHeight(e.nativeEvent.layout.height)}
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             right: 0,
//             zIndex: 1,
//             transform: [{ translateY: statsTranslateY }],
//             opacity: statsOpacity,
//             backgroundColor: theme.background,
//             paddingHorizontal: 16,
//             paddingTop: 8,
//           }}
//         >
//           <DashboardStats
//             vegCount={stats.veg}
//             oilCount={stats.oil}
//             attaCount={stats.atta}
//             todaysOrderCount={orders.length}
//             totalOrdersCount={currentMonthOrderCount}
//             onPress={() => navigation.navigate("Performance")}
//           />
//         </Animated.View>

//         {/* ── LAYER 2: Search + Date (sits below stats, sticks after stats hide) ── */}
//         <Animated.View
//           onLayout={(e) => setSearchHeight(e.nativeEvent.layout.height)}
//           style={{
//             position: "absolute",
//             top: statsHeight, // ← starts right below measured stats
//             left: 0,
//             right: 0,
//             zIndex: 2,
//             transform: [{ translateY: searchTranslateY }],
//             backgroundColor: theme.background,
//             paddingHorizontal: 16,
//             paddingBottom: 10,
//           }}
//         >
//           <View style={styles.searchCreateContainer}>
//             <View style={styles.searchContainer}>
//               <Ionicons name="search" size={20} color="#999" />
//               <TextInput
//                 style={styles.searchInput}
//                 placeholderTextColor="#A9A9A9"
//                 placeholder="Search by name order"
//                 value={searchQuery}
//                 onChangeText={handleSearchChange}
//               />
//             </View>
//             <TouchableOpacity
//               style={styles.createButton}
//               onPress={orderDraftCreateHandler}
//               disabled={draftOrderLoading}
//             >
//               <Text style={styles.createButtonText}>
//                 {draftOrderLoading ? "Creating..." : "Create Order"}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           <TouchableOpacity
//             style={styles.dateInput}
//             onPress={() => setShowPicker(true)}
//           >
//             <Ionicons name="calendar-outline" size={20} color={colors.WHITE} />
//             <Text style={styles.datePickerStyle}>{todayDate}</Text>
//           </TouchableOpacity>
//         </Animated.View>

//         {/* ── LAYER 3: FlatList — paddingTop = exact combined header height ── */}
//         {totalHeaderHeight > 0 && ( // ← only render once heights are known
//           <Animated.FlatList
//             data={orders}
//             keyExtractor={(item) => item?.node?.id}
//             contentContainerStyle={[
//               styles.flatListContent,
//               { paddingTop: totalHeaderHeight }, // ← exact measured value
//             ]}
//             showsVerticalScrollIndicator={false}
//             renderItem={renderOrderItem}
//             onScroll={Animated.event(
//               [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//               { useNativeDriver: true },
//             )}
//             scrollEventThrottle={16}
//             ListEmptyComponent={
//               !loading && !hasOrders ? (
//                 <View style={styles.messageContainer}>
//                   <Text style={styles.errorText}>No orders found.</Text>
//                 </View>
//               ) : null
//             }
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={handleRefresh}
//               />
//             }
//           />
//         )}

//         {loading && <LoadingSkeleton theme={theme} />}
//       </View>

//       <FAB
//         icon="download-outline"
//         style={styles.fab}
//         size="medium"
//         onPress={() => navigation.navigate("purchasePriceOrder")}
//         color="white"
//       />

//       <WarehouseModal
//         visible={showWarehouseModal}
//         onClose={() => setShowWarehouseModal(false)}
//         onSelect={handleFulfillConfirm}
//         warehouses={warehouseData?.warehouses?.edges || []}
//         loading={warehouseLoading}
//       />
//     </ScreenLayout>
//   );
// }


import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useContext } from "react";
import { AuthContext } from "../../../constant/AuthProvider";
import { toast } from "sonner-native";
import {
  SpecificDateData,
  SpcificDateRangeData,
  UpdatePurchasePrice,
  GenerateSpcificDatePdf,
} from "../../../axiosServices/services";
import { colors } from "../../../constant/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../constant/ThemeContext";
import RNFetchBlob from "react-native-blob-util";

const useStyle = (theme) => {
  return useMemo(() => {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 16,
      },
      header: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 10,
        color: theme.heading,
        marginTop: 10,
      },
      dateInput: {
        flex: 1,
        padding: 12,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: theme.primary,
        justifyContent: "center",
      },
      datePickerStyle: {
        color: theme.text,
        fontWeight: "500",
      },
      dateSection: { marginBottom: 25 },
      dateHeader: {
        fontSize: 17,
        fontWeight: "bold",
        marginBottom: 6,
        color: theme.heading,
      },
      slotHeader: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
        color: theme.secondary,
      },
      card: {
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.primary,
        borderRadius: 10,
        padding: 12,
        marginBottom: 12,
      },
      title: {
        fontWeight: "bold",
        fontSize: 16,
        color: theme.heading,
        marginBottom: 4,
      },
      subText: { fontSize: 13, color: theme.text, marginBottom: 2 },

      // Inputs Section
      inputsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        gap: 12,
      },
      inputWrapper: {
        flex: 1,
      },
      label: {
        marginBottom: 6,
        fontSize: 12,
        color: theme.secondary,
        fontWeight: "500",
      },
      inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 6,
        paddingHorizontal: 10,
        height: 40,
        backgroundColor: theme.background,
      },
      dollar: { marginRight: 4, color: theme.text, fontSize: 14 },
      input: {
        flex: 1,
        paddingVertical: 0, // Fix alignment on Android
        fontSize: 14,
        color: theme.text,
        height: "100%",
      },

      // Buttons
      updateBtn: {
        backgroundColor: theme.textSecondary,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 16,
        alignItems: "center",
        justifyContent: "center",
      },
      updateBtnText: {
        color: theme.background, // Inverted text color
        fontWeight: "600",
      },
      downloadBtn: {
        backgroundColor: theme.textSecondary,
        padding: 16,
        borderRadius: 10,
        alignItems: "center",
        marginVertical: 16,
      },
      applyBtn: {
        backgroundColor: theme.textSecondary,
        padding: 14,
        borderRadius: 10,
        marginVertical: 15,
        alignItems: "center",
      },
      btnText: {
        color: theme.background,
        fontWeight: "600",
        fontSize: 15,
      },
      disabledBtn: {
        backgroundColor: theme.border,
        opacity: 0.7,
      },
      emptyContainer: {
        padding: 40,
        alignItems: "center",
      },
      emptyText: {
        fontSize: 16,
        color: theme.secondary,
      },
      row: {
        flexDirection: "row",
        gap: 10,
      },
    });
  }, [theme]);
};

const ProductPriceUpdateScreen = () => {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const { token } = useContext(AuthContext);

  const [selectProductId, setSelectProductId] = useState(null);
  const [showPicker, setShowPicker] = useState({ visible: false, field: null });
  const [specificDate, setSpecificDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [priceMap, setPriceMap] = useState({});
  const [sellingPrice, setSellingPrice] = useState({});
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [loadingStates, setLoadingStates] = useState({
    specific: false,
    dateRange: false,
    updatePrice: false,
  });

  const openDatePicker = useCallback((field) => {
    setShowPicker({ visible: true, field });
  }, []);

  useEffect(() => {
    if (filteredData.length > 0) {
      const initialPriceMap = {};
      const intialSellingPrice = {};

      filteredData.forEach((item) => {
        // Find the key that is NOT 'delivery_date' (e.g., 'Morning Slot')
        const slotKey = Object.keys(item).find(
          (key) => key !== "delivery_date",
        );
        if (slotKey) {
          const products = item[slotKey] || [];
          products.forEach((product) => {
            initialPriceMap[product.id] =
              product.purchase_price?.toString() || "";
            intialSellingPrice[product.id] =
              product.selling_price?.toString() || "";
          });
        }
      });

      setPriceMap(initialPriceMap);
      setSellingPrice(intialSellingPrice);
    }
  }, [filteredData]);

  const handlePriceChange = useCallback((productId, newPrice, type) => {
    if (type === "purchase") {
      setPriceMap((prev) => ({ ...prev, [productId]: newPrice }));
    } else {
      setSellingPrice((prev) => ({ ...prev, [productId]: newPrice }));
    }
  }, []);

  const formatDate = useCallback((date) => {
    return date?.toLocaleDateString("en-CA");
  }, []);

  const onChangeDate = useCallback(
    (event, selectedDate) => {
      // Must check event type for Android dismissal
      if (event.type === "dismissed") {
        setShowPicker({ visible: false, field: null });
        return;
      }

      const currentDate = selectedDate || new Date();

      if (showPicker.field === "specific") {
        setSpecificDate(currentDate);
        setStartDate(null);
        setEndDate(null);
      } else if (showPicker.field === "start") {
        setStartDate(currentDate);
        setSpecificDate(null);
      } else if (showPicker.field === "end") {
        setEndDate(currentDate);
        setSpecificDate(null);
      }

      setShowPicker({ visible: false, field: null });
    },
    [showPicker.field],
  );

  const updatePrice = useCallback(
    async (productId) => {
      // Validate inputs
      if (!priceMap[productId]) {
        toast.warning("Please enter a purchase price");
        return;
      }

      setSelectProductId(productId);
      setLoadingStates((prev) => ({ ...prev, updatePrice: true }));

      try {
        const pPrice = parseFloat(priceMap[productId]) || 0;
        const sPrice = parseFloat(sellingPrice[productId]) || 0;

        await UpdatePurchasePrice(productId, pPrice, sPrice);

        // Optimistic UI Update
        setFilteredData((prevData) =>
          prevData.map((item) => {
            const slotKey = Object.keys(item).find(
              (key) => key !== "delivery_date",
            );
            if (!slotKey) return item;

            const products = item[slotKey];
            const hasProduct = products.some((p) => p.id === productId);

            if (!hasProduct) return item;

            return {
              ...item,
              [slotKey]: products.map((product) =>
                product.id === productId
                  ? {
                      ...product,
                      purchase_price: pPrice,
                      selling_price: sPrice,
                    }
                  : product,
              ),
            };
          }),
        );

        toast.success("Price updated successfully");
      } catch (err) {
        toast.error("Failed to update price");
        console.error(err);
      } finally {
        setLoadingStates((prev) => ({ ...prev, updatePrice: false }));
        setSelectProductId(null);
      }
    },
    [priceMap, sellingPrice],
  );

  const applyDateFilter = useCallback(async () => {
    if (startDate && endDate) {
      setLoadingStates((prev) => ({ ...prev, dateRange: true }));
      try {
        const startStr = formatDate(startDate);
        const endStr = formatDate(endDate);
        const response = await SpcificDateRangeData(startStr, endStr, token);
        setFilteredData(response);
      } catch (err) {
        setFilteredData([]);
        toast.error("No data found or error occurred");
      } finally {
        setLoadingStates((prev) => ({ ...prev, dateRange: false }));
      }
    } else if (specificDate) {
      setLoadingStates((prev) => ({ ...prev, specific: true }));
      try {
        const dateStr = formatDate(specificDate);
        const response = await SpecificDateData(dateStr, token);
        setFilteredData(response);
      } catch (err) {
        setFilteredData([]);
        toast.error("No data found or error occurred");
      } finally {
        setLoadingStates((prev) => ({ ...prev, specific: false }));
      }
    } else {
      toast.warning("Please select a date first");
    }
  }, [startDate, endDate, specificDate, formatDate, token]);

  const handlePdfActions = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      if (!specificDate) {
        toast.warning("Please select a specific date for PDF");
        return;
      }

      // 1. Request Permission (Required for Android 9 and below, good practice for all)
      if (Platform.OS === "android") {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log("Permission denied");
          }
        } catch (err) {
          console.warn(err);
        }
      }

      const dateString = formatDate(specificDate);
      const { dirs } = RNFetchBlob.fs;

      // 2. Define Path
      // We use DownloadDir so the user can find it easily
      const fileName = `purchase_${dateString}.pdf`;
      const filePath =
        Platform.OS === "ios"
          ? `${dirs.DocumentDir}/${fileName}`
          : `${dirs.DownloadDir}/${fileName}`;

      // 3. API URL
      const BASE_URL = "https://api.kisanbasket.com/api/purchases";
      const FULL_URL = `${BASE_URL}/specific-date-pdf`;

      // 4. CONFIG: DISABLE 'addAndroidDownloads'
      // We remove the Android Download Manager config so RNFetchBlob uses its own
      // internal engine. This guarantees headers (Auth token) are sent correctly.
      const configOptions = {
        fileCache: true,
        path: filePath,
      };

      console.log("Starting internal download...");

      // 5. FETCH
      const res = await RNFetchBlob.config(configOptions).fetch(
        "GET",
        `${FULL_URL}?date=${dateString}`,
        {
          // Headers are now guaranteed to work because we are using the internal engine
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-store",
        },
      );

      const info = res.info();
      if (info && info.status !== 200) {
        toast.error(`Server Error: ${info.status}`);
        setIsGeneratingPdf(false);
        return;
      }

      console.log("File saved to:", res.path());

      // 7. OPEN THE FILE
      const finalPath = res.path();

      if (Platform.OS === "android") {
        // Open the PDF viewer
        RNFetchBlob.android.actionViewIntent(finalPath, "application/pdf");

        // Optional: Scan the file so it shows up in the 'Downloads' app immediately
        // (This might fail on some Android versions, so we catch it silently)
        try {
          await RNFetchBlob.fs.scanFile([
            { path: finalPath, mime: "application/pdf" },
          ]);
        } catch (e) {}
      } else {
        RNFetchBlob.ios.previewDocument(finalPath);
      }

      toast.success("PDF Downloaded");
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [specificDate, token, formatDate]);

  const renderProductItem = useCallback(
    (product) => {
      const isUpdating =
        selectProductId === product.id && loadingStates.updatePrice;

      return (
        <View key={product.id} style={styles.card}>
          <Text style={styles.title}>{product.product_name}</Text>
          <Text style={styles.subText}>Location: {product.location}</Text>
          <Text style={styles.subText}>Variant: {product.variant}</Text>
          <Text style={styles.subText}>Qty: {product.quantity}</Text>

          <View style={styles.inputsContainer}>
            {/* Purchase Price Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Purchase Price</Text>
              <View style={styles.inputRow}>
                <Text style={styles.dollar}>₹</Text>
                <TextInput
                  style={styles.input}
                  value={priceMap[product.id]}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    handlePriceChange(product.id, text, "purchase")
                  }
                  placeholder="0"
                  placeholderTextColor={theme.secondary}
                />
              </View>
            </View>

            {/* Selling Price Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Selling Price</Text>
              <View style={styles.inputRow}>
                <Text style={styles.dollar}>₹</Text>
                <TextInput
                  style={styles.input}
                  value={sellingPrice[product.id]}
                  keyboardType="numeric"
                  onChangeText={(text) =>
                    handlePriceChange(product.id, text, "selling")
                  }
                  placeholder="0"
                  placeholderTextColor={theme.secondary}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.updateBtn, isUpdating && styles.disabledBtn]}
            onPress={() => updatePrice(product.id)}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator size="small" color={theme.heading} />
            ) : (
              <Text style={styles.updateBtnText}>Update</Text>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [
      priceMap,
      sellingPrice,
      selectProductId,
      loadingStates.updatePrice,
      handlePriceChange,
      updatePrice,
      styles,
      theme,
    ],
  );

  const renderDateSection = useCallback(
    (item, index) => {
      const deliveryDate = item?.delivery_date;
      const slotKey = Object.keys(item).find((key) => key !== "delivery_date");
      const products = item[slotKey] || [];

      return (
        <View key={`${deliveryDate}-${index}`} style={styles.dateSection}>
          <Text style={styles.dateHeader}>{deliveryDate}</Text>
          <Text style={styles.slotHeader}>
            {slotKey || "No Slot Information"}
          </Text>
          {products.map((product) => renderProductItem(product))}
        </View>
      );
    },
    [renderProductItem, styles],
  );

  // Helper for DatePicker value to ensure it's always a valid Date object
  const getPickerDate = () => {
    if (showPicker.field === "specific") return specificDate || new Date();
    if (showPicker.field === "start") return startDate || new Date();
    if (showPicker.field === "end") return endDate || new Date();
    return new Date();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text style={styles.header}>Select Specific Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => openDatePicker("specific")}
        >
          <Text style={styles.datePickerStyle}>
            {specificDate ? formatDate(specificDate) : "Tap to select a date"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.header}>Select Date Range</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => openDatePicker("start")}
          >
            <Text style={styles.datePickerStyle}>
              {startDate ? formatDate(startDate) : "Start Date"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => openDatePicker("end")}
          >
            <Text style={styles.datePickerStyle}>
              {endDate ? formatDate(endDate) : "End Date"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.applyBtn}
          onPress={applyDateFilter}
          disabled={loadingStates.specific || loadingStates.dateRange}
        >
          {loadingStates.specific || loadingStates.dateRange ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={styles.btnText}>Apply Filters</Text>
          )}
        </TouchableOpacity>

        {/* List Data */}
        {filteredData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No data available for selected filters
            </Text>
          </View>
        ) : (
          filteredData.map(renderDateSection)
        )}
      </ScrollView>

      {/* Floating Action / Bottom Button for PDF */}
      <View style={{ position: "absolute", bottom: 20, left: 16, right: 16 }}>
        <TouchableOpacity
          style={[styles.downloadBtn, isGeneratingPdf && styles.disabledBtn]}
          disabled={isGeneratingPdf}
          onPress={handlePdfActions}
        >
          {isGeneratingPdf ? (
            <ActivityIndicator color={theme.background} />
          ) : (
            <Text style={styles.btnText}>Download PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Global Date Picker */}
      {showPicker.visible && (
        <DateTimePicker
          value={getPickerDate()}
          mode="date"
          display="default"
          onChange={onChangeDate}
          minimumDate={showPicker.field === "end" ? startDate : undefined}
          maximumDate={showPicker.field === "start" ? endDate : undefined}
        />
      )}
    </SafeAreaView>
  );
};

export default ProductPriceUpdateScreen;
