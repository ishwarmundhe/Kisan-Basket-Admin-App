import React, {
  useCallback,
  useState,
  useEffect,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useDispatch } from "react-redux";
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
  ScrollView,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { Card, Text, FAB } from "react-native-paper";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client/react";
import { debounce } from "lodash";
import dayjs from "dayjs";
import moment from "moment";

// --- React Native CLI PDF & Sharing Imports ---
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import FileViewer from 'react-native-file-viewer';

import ScreenLayout from "../ScreenLayout";
import ErrorMessage from "../../../components/custom/errorMessage";
import { colors } from "../../../constant/Colors";
import { AuthContext } from "../../../constant/AuthProvider";
import { toast } from "sonner-native";
import { useTheme } from "../../../constant/ThemeContext";

import {
  ORDER_LIST_QUERY,
  MONTH_TOTAL_ORDERS,
  WAREHOUSE_LIST,
  ORDER_FULFILL_DATA,
} from "../../../graphql/Query";

import {
  ORDER_CONFIRM,
  ORDER_MARK_AS_PAID,
  FULFILL_ORDER,
} from "../../../graphql/Mutation";
import { generateAndShareInvoice } from "../../../utils/Invoice";

const STATUS_COLORS = {
  CANCELED: colors.CANCELED,
  UNCONFIRMED: colors.UNCONFIRMED,
  UNFULFILLED: colors.UNFULFILLED,
  DEFAULT: colors.WHITE,
};

const STATUS_FILTERS = ["All", "Payment Pending", "Paid", "Unconfirmed", "Fulfilled"];
let persistedSelectedDate = new Date();

const useStyle = (theme) =>
  useMemo(
    () =>
      StyleSheet.create({
        statusFiltersContainer: {
          marginTop: 12,
          marginBottom: 8,
        },
        statusScrollContent: {
          gap: 10,
          paddingHorizontal: 4,
        },
        statusChip: {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          backgroundColor: theme.background,
          borderWidth: 1,
          borderColor: theme.border,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6
        },
        statusChipActive: {
          backgroundColor: theme.textSecondary,
          borderColor: theme.textSecondary,
        },
        statusChipText: {
          color: theme.text,
          fontSize: 13,
          fontWeight: "600",
        },
        statusChipTextActive: {
          color: theme.background,
        },
        countBadge: {
          backgroundColor: theme.primary,
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 10,
        },
        countBadgeText: {
          color: theme.text,
          fontSize: 11,
          fontWeight: "700",
        },

        // --- SUMMARY BAR ---
        summaryContainer: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 8,
          marginBottom: 8,
          paddingBottom: 8,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
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

        orderLoadingOverlay: {
          ...StyleSheet.absoluteFillObject,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 12,
          zIndex: 10,
        },
        searchCreateContainer: { flexDirection: "row", gap: 12, marginBottom: 16 },
        messageContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
        errorText: { fontSize: 16, color: theme.secondary },
        flatListContent: { gap: 12, paddingTop: 12, paddingBottom: 100 },

        card: {
          borderRadius: 12,
          padding: 16,
          marginHorizontal: 16,
          backgroundColor: theme.primary,
          borderColor: theme.border,
          borderWidth: 1,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        cardInner: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
        cardTitle: { color: theme.heading, fontSize: 16, fontWeight: "700", marginBottom: 6, lineHeight: 22 },
        cardText: { color: theme.secondary, fontSize: 14, marginBottom: 4 },
        addressTitle: { color: theme.text, fontWeight: "500" },
        deliveryText: {
          marginTop: 8, color: theme.deliveryDate || "#4ade80", fontWeight: "600", fontSize: 13,
          backgroundColor: `${theme.deliveryDate || "#4ade80"}15`, alignSelf: "flex-start",
          paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, overflow: "hidden",
        },

        searchContainer: { flex: 1, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, height: 48, backgroundColor: theme.primary },
        searchInput: { flex: 1, marginLeft: 8, color: theme.text, fontSize: 15 },
        dateRowContainer: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
        dateInput: { flex: 1, height: 48, paddingHorizontal: 12, flexDirection: "column", alignItems: "flex-start", justifyContent: "center", borderWidth: 1, borderColor: theme.border, borderRadius: 10, backgroundColor: theme.primary },
        dateInputHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
        dateLabelText: { color: theme.secondary, fontSize: 12, fontWeight: "500" },
        datePickerStyle: { color: theme.text, fontWeight: "600", fontSize: 14 },
        iconButton: { width: 44, height: 48, borderWidth: 1, borderColor: theme.border, borderRadius: 10, backgroundColor: theme.primary, justifyContent: "center", alignItems: "center" },

        actionContainer: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: theme.border, gap: 10 },
        actionBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignItems: "center", justifyContent: "center", minWidth: 80 },
        confirmBtn: { backgroundColor: "#059669", borderWidth: 0 },
        fulfillBtn: { backgroundColor: "#2563eb", borderWidth: 0 },
        paidBtn: { backgroundColor: "#d97706", borderWidth: 0 },
        orderPaid: { borderWidth: 1, borderColor: "#88E788", backgroundColor: "#ecfcec" },
        orderPaidText: { color: "#059669", fontWeight: "700" },
        btnText: { color: "#FFFFFF", fontWeight: "600", fontSize: 13 },

        shareButton: { backgroundColor: theme.shareButtonColor || "#3f3f46", padding: 8, borderRadius: 8, borderWidth: 1, borderColor: theme.border },
        fab: { position: "absolute", right: 20, bottom: 30, backgroundColor: "#18181b", borderWidth: 1, borderColor: "#27272a", borderRadius: 16 },

        modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
        modalContent: { width: "90%", backgroundColor: theme.primary, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: theme.border },
        modalTitle: { fontSize: 20, fontWeight: "bold", color: theme.heading, marginBottom: 20, textAlign: "center" },
        modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
        modalText: { color: theme.text, fontSize: 16 },
        closeBtn: { marginTop: 20, padding: 14, backgroundColor: theme.shareButtonColor || "#3f3f46", borderRadius: 10, alignItems: "center" },

        rightActions: { alignItems: "flex-end" },
        unpaidBadge: { backgroundColor: "rgba(239, 68, 68, 0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "rgba(239, 68, 68, 0.4)", marginBottom: 10 },
        unpaidBadgeText: { color: theme.error || "#ef4444", fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
      }),
    [theme],
  );

const WarehouseModal = ({ visible, onClose, onSelect, warehouses, loading }) => {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Warehouse</Text>
          {loading ? (
            <ActivityIndicator size="large" color={colors.PRIMARY_BUTTON_BACKGROUND} />
          ) : (
            <FlatList
              data={warehouses}
              keyExtractor={(item) => item.node.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => onSelect(item.node.id)}>
                  <Text style={styles.modalText}>{item.node.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: colors.CANCELED || "#ef4444", fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const OrderItem = React.memo(
  ({ item, onPress, onShare, invoiceLoadder, selectedOrderId, onConfirm, onFulfill, onMarkPaid, loadingActionId }) => {
    const order = item?.node;
    const { theme } = useTheme();
    const styles = useStyle(theme);
    const lines = order?.lines || [];

    const isCanceled = order?.status === "CANCELED";
    const finalCardStyle = [ styles.card, isCanceled && { opacity: 0.5 }, { overflow: "hidden" } ];
    const fullName = `${order?.billingAddress?.firstName ?? ""} ${order?.billingAddress?.lastName ?? ""}`.trim();
    const addressLine1 = order?.billingAddress?.streetAddress1 ?? "";
    const itemNames = lines.map((l) => l.productName).join(", ");
    const isActionLoading = loadingActionId === order?.id;

    return (
      <TouchableOpacity style={{ position: "relative" }} onPress={() => onPress(order?.id)} disabled={isActionLoading}>
        <Card style={finalCardStyle}>
          <View style={styles.rightActions}>
            {!order?.isPaid && !isCanceled && !["UNCONFIRMED", "UNFULFILLED", "PARTIALLY_FULFILLED"].includes(order?.status) && (
              <View style={styles.unpaidBadge}>
                <Text style={styles.unpaidBadgeText}>Payment Pending</Text>
              </View>
            )}
          </View>

          <View style={styles.cardInner}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.cardTitle}>{addressLine1 || "No Address Provided"}</Text>
              <Text style={styles.cardText}>Customer: <Text style={styles.addressTitle}>{fullName || "N/A"}</Text></Text>
              <Text style={styles.cardText} numberOfLines={2}>Items: <Text style={{ color: theme.text }}>{itemNames}</Text></Text>
              <Text style={styles.cardText}>
                Status: <Text style={{ color: STATUS_COLORS[order?.status] || STATUS_COLORS.DEFAULT, fontWeight: "700" }}>{order?.status}</Text>
              </Text>
              <Text style={styles.cardText}>
                Amount: <Text style={{ color: theme.text, fontWeight: "600" }}>{order?.total?.gross?.currency} {order?.total?.gross?.amount}</Text>
              </Text>
              <Text style={styles.deliveryText}>Delivery: {order?.deliveryDate ?? "-"}</Text>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={() => onShare(order?.id, order?.status)} disabled={order?.status === "UNCONFIRMED" || order?.status === "DRAFT"}>
              {invoiceLoadder && selectedOrderId === order.id ? <ActivityIndicator size="small" color={colors.WHITE} /> : <Ionicons name="share-social-outline" size={20} color="#FFF" />}
            </TouchableOpacity>
          </View>

          <View style={styles.actionContainer}>
            {order?.status === "UNCONFIRMED" && (
              <TouchableOpacity style={[styles.actionBtn, styles.confirmBtn]} onPress={() => onConfirm(order.id)}><Text style={styles.btnText}>Confirm</Text></TouchableOpacity>
            )}
            {(order?.status === "UNFULFILLED" || order?.status === "PARTIALLY_FULFILLED") && (
              <TouchableOpacity style={[styles.actionBtn, styles.fulfillBtn]} onPress={() => onFulfill(order.id)}><Text style={styles.btnText}>Fulfill</Text></TouchableOpacity>
            )}
            {order?.status === "FULFILLED" && order?.isPaid && (
              <View style={[styles.actionBtn, styles.orderPaid]}><Text style={styles.orderPaidText}>Order Paid</Text></View>
            )}
            {order?.status === "FULFILLED" && !order?.isPaid && (
              <TouchableOpacity style={[styles.actionBtn, styles.paidBtn]} onPress={() => onMarkPaid(order.id)}><Text style={styles.btnText}>Mark Paid</Text></TouchableOpacity>
            )}
          </View>
        </Card>
        {isActionLoading && <View style={styles.orderLoadingOverlay}><ActivityIndicator size="large" color="#ffffff" /></View>}
      </TouchableOpacity>
    );
  }
);

export default function AllOrdersScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useStyle(theme);
  const { globalRefresh, setGlobalRefresh } = useContext(AuthContext);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState(persistedSelectedDate);
  const [showPicker, setShowPicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [dateFilterType, setDateFilterType] = useState("deliveryDate");
  const [refreshing, setRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState("All");

  const [invoiceLoadder, setInvoiceLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [fulfillTargetOrderId, setFulfillTargetOrderId] = useState(null);
  const [confirmOrderModalVisible, setConfirmOrderModalVisible] = useState(false);
  const [confirmTargetOrderId, setConfirmTargetOrderId] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchHeight, setSearchHeight] = useState(0);

  const getSelectedMonthDateRange = useMemo(() => ({
    gte: moment(selectedDate).startOf("month").format("YYYY-MM-DD"),
    lte: moment(selectedDate).endOf("month").format("YYYY-MM-DD"),
  }), [selectedDate]);

  const todayDate = useMemo(() => selectedDate?.toLocaleDateString("en-CA"), [selectedDate]);
  const displayDate = dayjs(selectedDate).format("DD-MM-YYYY");

  const [fetchOrders, { data: orderList, loading, refetch }] = useLazyQuery(ORDER_LIST_QUERY);
  const { data: monthlyOrdersData, refetch: refetchMonthlyData } = useQuery(MONTH_TOTAL_ORDERS, { variables: getSelectedMonthDateRange });
  const { data: warehouseData, loading: warehouseLoading } = useQuery(WAREHOUSE_LIST);
  const [fetchFulfillData] = useLazyQuery(ORDER_FULFILL_DATA, { fetchPolicy: "network-only" });

  const [confirmOrder] = useMutation(ORDER_CONFIRM);
  const [fulfillOrder] = useMutation(FULFILL_ORDER);
  const [markAsPaid] = useMutation(ORDER_MARK_AS_PAID);

  const orders = useMemo(() => orderList?.orders?.edges ?? [], [orderList]);

  // Calculate counts for filters
  const filterCounts = useMemo(() => {
    let counts = { "All": orders.length, "Payment Pending": 0, "Paid": 0, "Unconfirmed": 0, "Fulfilled": 0 };
    orders.forEach((edge) => {
      const o = edge.node;
      if (!o.isPaid && !["CANCELED", "UNCONFIRMED", "UNFULFILLED"].includes(o.status)) counts["Payment Pending"]++;
      if (o.isPaid) counts["Paid"]++;
      if (o.status === "UNCONFIRMED") counts["Unconfirmed"]++;
      if (o.status === "FULFILLED") counts["Fulfilled"]++;
    });
    return counts;
  }, [orders]);

  const displayedOrders = useMemo(() => {
    let filtered = orders;
    if (statusFilter !== "All") {
      filtered = filtered.filter((edge) => {
        const o = edge.node;
        if (statusFilter === "Payment Pending") return !o.isPaid && !["CANCELED", "UNCONFIRMED", "UNFULFILLED"].includes(o.status);
        if (statusFilter === "Paid") return o.isPaid;
        if (statusFilter === "Unconfirmed") return o.status === "UNCONFIRMED";
        if (statusFilter === "Fulfilled") return o.status === "FULFILLED";
        return true;
      });
    }
    return filtered;
  }, [orders, statusFilter]);

  // Calculate current list total
  const currentListTotalAmount = useMemo(() => {
    return displayedOrders.reduce((sum, edge) => sum + (edge.node.total?.gross?.amount || 0), 0);
  }, [displayedOrders]);

  const handlePrintPendingReport = async () => {
    setIsPrinting(true);
    try {
      const pendingList = orders.filter(edge => {
        const o = edge.node;
        return !o.isPaid && !["CANCELED", "UNCONFIRMED", "UNFULFILLED"].includes(o.status);
      });

      if (pendingList.length === 0) {
        toast.info("No pending payments found to print.");
        setIsPrinting(false);
        return;
      }

      const totalAmount = pendingList.reduce((sum, edge) => sum + (edge.node.total?.gross?.amount || 0), 0);

      // --- Build the PDF with pdf-lib (pure JS, no native module) ---
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const pageWidth = 595; // A4 width in points
      const pageHeight = 842; // A4 height in points
      const margin = 40;
      const rowHeight = 24;
      const colX = { number: margin, name: margin + 90, date: margin + 260, amount: margin + 380 };

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      const drawHeader = () => {
        page.drawText("Pending Payments Report", { x: margin, y, size: 18, font: boldFont, color: rgb(0.07, 0.07, 0.07) });
        y -= 20;
        page.drawText(`Generated on: ${new Date().toLocaleDateString()}`, { x: margin, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
        y -= 24;

        page.drawText("Order #", { x: colX.number, y, size: 11, font: boldFont });
        page.drawText("Customer Name", { x: colX.name, y, size: 11, font: boldFont });
        page.drawText("Delivery Date", { x: colX.date, y, size: 11, font: boldFont });
        page.drawText("Amount", { x: colX.amount, y, size: 11, font: boldFont });
        y -= 8;
        page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.7, 0.7, 0.7) });
        y -= rowHeight;
      };

      drawHeader();

      pendingList.forEach((edge) => {
        const o = edge.node;
        const name = `${o.billingAddress?.firstName || ""} ${o.billingAddress?.lastName || ""}`.trim() || "N/A";
        const amountText = `${o.total?.gross?.currency ?? ""} ${o.total?.gross?.amount ?? ""}`;

        if (y < margin + rowHeight) {
          page = pdfDoc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
          drawHeader();
        }

        page.drawText(String(o.number ?? ""), { x: colX.number, y, size: 10, font });
        page.drawText(name, { x: colX.name, y, size: 10, font });
        page.drawText(String(o.deliveryDate ?? "-"), { x: colX.date, y, size: 10, font });
        page.drawText(amountText, { x: colX.amount, y, size: 10, font });
        y -= rowHeight;
      });

      if (y < margin + 40) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      y -= 10;
      page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1.2, color: rgb(0.2, 0.2, 0.2) });
      y -= 20;
      page.drawText(`Total Pending: Rs.${totalAmount.toFixed(2)}`, {
        x: pageWidth - margin - 180, y, size: 13, font: boldFont, color: rgb(0.9, 0.2, 0.2),
      });

      // --- Save the PDF ---
      const base64Pdf = await pdfDoc.saveAsBase64();
      const fileName = `Pending_Payments_${dayjs().format('DD_MM_YYYY_HHmmss')}.pdf`;

      // On Android, write to the PUBLIC Downloads folder so the file is actually
      // visible in the device's Downloads app / file manager. DocumentDirectoryPath
      // is sandboxed to the app and is never visible outside it.
      // On iOS there's no public "Downloads" folder; files live in the app's
      // Documents dir and are surfaced to the Files app if the app enables that
      // (UIFileSharingEnabled / LSSupportsOpeningDocumentsInPlace in Info.plist).
      let filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
      let savedToPublicDownloads = false;

      if (Platform.OS === "android") {
        try {
          // Only required on Android 5.1–9 (API 22–28); on API 29+ (Android 10+)
          // writing to the public Downloads dir via a raw path generally still
          // works for legacy-storage apps, and PermissionsAndroid.request is a
          // no-op / auto-granted on API 29+.
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Storage Permission",
              message: "Allow the app to save the PDF report to your Downloads folder.",
              buttonPositive: "Allow",
            },
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            const downloadsPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
            await RNFS.writeFile(downloadsPath, base64Pdf, "base64");
            filePath = downloadsPath;
            savedToPublicDownloads = true;
          }
        } catch (permErr) {
          console.warn("Could not save to public Downloads, falling back to app storage:", permErr?.message);
        }
      }

      // Fallback (iOS, or Android when permission/write to Downloads failed):
      // save into the app's own sandbox so the file still exists somewhere.
      if (!savedToPublicDownloads) {
        await RNFS.writeFile(filePath, base64Pdf, "base64");
      }

      // --- Try to open the saved PDF directly; fall back to the share sheet ---
      // Direct open (FileViewer) requires an app registered to VIEW application/pdf,
      // AND a correctly configured FileProvider. Many devices/emulators have neither.
      try {
        await FileViewer.open(filePath, {
          showOpenWithDialog: true,
          displayName: fileName,
        });
      } catch (viewerError) {
        console.warn("Direct PDF open failed, falling back to share sheet:", viewerError?.message);
        try {
          // Pass the PDF as a base64 data URI rather than a file:// / content:// path.
          // This avoids Android having to resolve a FileProvider Uri at all, which is
          // what was throwing "Attempt to invoke virtual method ... Uri.getScheme()"
          // when the FileProvider wasn't set up correctly.
          await Share.open({
            title: "Share Pending Report",
            url: `data:application/pdf;base64,${base64Pdf}`,
            filename: fileName,
            type: "application/pdf",
            failOnCancel: false,
          });
        } catch (shareError) {
          // failOnCancel: false means the user simply dismissing the sheet won't land here.
          console.error("Share fallback also failed:", shareError);
          toast.error(
            savedToPublicDownloads
              ? `PDF saved to Downloads as ${fileName}, but no app could open or share it directly.`
              : "PDF saved, but no app could open or share it. Install a PDF viewer to open it.",
          );
        }
      }

      toast.success(
        savedToPublicDownloads
          ? `PDF saved to Downloads: ${fileName}`
          : `PDF saved: ${fileName}`,
      );
    } catch (error) {
      console.error("Print Error:", error);
      toast.error("Failed to generate PDF report.");
    } finally {
      setIsPrinting(false);
    }
  };

  const debouncedSearch = useMemo(() => debounce((query, filterType = dateFilterType) => {
    const safeQuery = query ?? "";
    fetchOrders({ variables: { first: 100, filter: { [filterType]: { gte: todayDate, lte: todayDate }, ...(safeQuery.trim() && { search: safeQuery }) }, sort: { direction: "DESC", field: "NUMBER" } }, fetchPolicy: "network-only" });
  }, 500), [fetchOrders, todayDate, dateFilterType]);

  const handleSearchChange = useCallback((text) => { setSearchQuery(text); debouncedSearch(text); }, [debouncedSearch]);
  const onChangeDate = useCallback((event, date) => { setShowPicker(false); if (date) { setSelectedDate(date); persistedSelectedDate = date; } debouncedSearch(searchQuery); }, [debouncedSearch, searchQuery]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (refetch) await refetch({ first: 100, filter: { [dateFilterType]: { gte: todayDate, lte: todayDate }, ...(searchQuery.trim() && { search: searchQuery }) }, sort: { direction: "DESC", field: "NUMBER" } });
      if (refetchMonthlyData) await refetchMonthlyData();
    } catch (e) { toast.error("Refresh error: " + e.message); } finally { setRefreshing(false); }
  }, [refetch, refetchMonthlyData, todayDate, searchQuery, dateFilterType]);

  useFocusEffect(useCallback(() => {
    if (globalRefresh) { const timer = setTimeout(() => { handleRefresh(); setGlobalRefresh(false); }, 100); return () => clearTimeout(timer); }
  }, [globalRefresh, handleRefresh, setGlobalRefresh]));

  const handleConfirmOrder = async (id) => { /* omitted for brevity, same as before */ };
  const handleMarkPaid = async (id) => { /* omitted for brevity, same as before */ };
  const onFulfillClick = (id) => { setFulfillTargetOrderId(id); setShowWarehouseModal(true); };
  const handleFulfillConfirm = async (warehouseId) => { /* omitted for brevity, same as before */ };
  const handleOrderDetails = useCallback((order_id) => { if (order_id) navigation.navigate("createOrder", { order_id, cancellationOrder: true }); }, [navigation]);
  const handleGenerateInvoice = useCallback(async (orderId, status) => { setSelectedOrderId(orderId); setInvoiceLoading(true); try { await generateAndShareInvoice(orderId, status); } finally { setInvoiceLoading(false); } }, []);

  const renderOrderItem = useCallback(({ item }) => (
    <OrderItem item={item} onPress={handleOrderDetails} onShare={handleGenerateInvoice} invoiceLoadder={invoiceLoadder} selectedOrderId={selectedOrderId} onConfirm={(id) => { setConfirmTargetOrderId(id); setConfirmOrderModalVisible(true); }} onFulfill={onFulfillClick} onMarkPaid={handleMarkPaid} loadingActionId={loadingActionId} />
  ), [handleOrderDetails, handleGenerateInvoice, invoiceLoadder, selectedOrderId, loadingActionId]);

  useEffect(() => { debouncedSearch(searchQuery, dateFilterType); return () => debouncedSearch.cancel(); }, [selectedDate, dateFilterType]);

  return (
    <ScreenLayout>
      {/* Modals & Picker */}
      {showPicker && <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onChangeDate} />}

      <View style={{ flex: 1 }}>

        {/* SEARCH & FILTERS HEADER */}
        <Animated.View onLayout={(e) => setSearchHeight(e.nativeEvent.layout.height)} style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2, backgroundColor: theme.background, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 }}>
          <View style={styles.searchCreateContainer}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput style={styles.searchInput} placeholder="Search order" placeholderTextColor="#A9A9A9" value={searchQuery} onChangeText={handleSearchChange} />
            </View>
          </View>

          <View style={styles.dateRowContainer}>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker(true)}>
              <View style={styles.dateInputHeader}><Ionicons name="calendar-outline" size={14} color={theme.secondary} /><Text style={styles.dateLabelText}>{dateFilterType === "deliveryDate" ? "Delivery Date" : "Created Date"}</Text></View>
              <Text style={styles.datePickerStyle}>{displayDate}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => setShowFilterModal(true)}><Ionicons name="filter-outline" size={20} color={theme.text} /></TouchableOpacity>
            {/* <TouchableOpacity style={styles.iconButton} onPress={handlePrintPendingReport} disabled={isPrinting}>{isPrinting ? <ActivityIndicator size="small" color={theme.text} /> : <Ionicons name="print-outline" size={20} color={theme.text} />}</TouchableOpacity> */}
            <TouchableOpacity style={styles.iconButton} onPress={handleRefresh} disabled={refreshing}>{refreshing && !isPrinting ? <ActivityIndicator size="small" color={theme.text} /> : <Ionicons name="refresh-outline" size={20} color={theme.text} />}</TouchableOpacity>
          </View>

          <View style={styles.statusFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statusScrollContent}>
              {STATUS_FILTERS.map(status => (
                <TouchableOpacity
                  key={status}
                  style={[styles.statusChip, statusFilter === status && styles.statusChipActive]}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text style={[styles.statusChipText, statusFilter === status && styles.statusChipTextActive]}>
                    {status}
                  </Text>
                  <View style={[styles.countBadge, statusFilter === status && { backgroundColor: theme.background }]}>
                    <Text style={[styles.countBadgeText, statusFilter === status && { color: theme.textSecondary }]}>
                      {filterCounts[status]}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Summary Row */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Showing {displayedOrders.length} orders</Text>
            <Text style={styles.summaryAmount}>Total: ₹{currentListTotalAmount.toFixed(2)}</Text>
          </View>

        </Animated.View>

        {/* ORDER LIST */}
        {searchHeight > 0 && (
          <Animated.FlatList
            data={displayedOrders}
            keyExtractor={(item) => item?.node?.id}
            contentContainerStyle={[styles.flatListContent, { paddingTop: searchHeight }]}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
            scrollEventThrottle={16}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={!loading && displayedOrders.length === 0 ? <View style={styles.messageContainer}><Text style={styles.errorText}>No orders found.</Text></View> : null}
            renderItem={renderOrderItem}
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

      {/* Modals omitted for brevity, keep the ones from previous step */}
      <WarehouseModal visible={showWarehouseModal} onClose={() => setShowWarehouseModal(false)} onSelect={handleFulfillConfirm} warehouses={warehouseData?.warehouses?.edges || []} loading={warehouseLoading} />

      <Modal visible={showFilterModal} transparent={true} animationType="fade" onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter By Date</Text>

            <TouchableOpacity style={styles.modalItem} onPress={() => {
              setDateFilterType("deliveryDate");
              setShowFilterModal(false);
            }}>
              <Text style={styles.modalText}>Delivery Date</Text>
              {dateFilterType === "deliveryDate" && (
                <Ionicons name="checkmark" size={20} color={theme.textSecondary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalItem} onPress={() => {
              setDateFilterType("created");
              setShowFilterModal(false);
            }}>
              <Text style={styles.modalText}>Created Date</Text>
              {dateFilterType === "created" && (
                <Ionicons name="checkmark" size={20} color={theme.textSecondary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowFilterModal(false)}>
              <Text style={{ color: colors.CANCELED || "#ef4444", fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={confirmOrderModalVisible} transparent={true} animationType="fade" onRequestClose={() => setConfirmOrderModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Order</Text>
            <Text style={{ fontSize: 16, marginBottom: 24, color: theme.text, textAlign: "center" }}>
              Once confirmed, you will not be able to modify product quantities or remove items from this order.
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20 }}>
              <TouchableOpacity style={{ padding: 10 }} onPress={() => setConfirmOrderModalVisible(false)}>
                <Text style={{ color: theme.secondary, fontWeight: "600", fontSize: 16 }}>No, Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 10 }} onPress={() => {
                setConfirmOrderModalVisible(false);
                handleConfirmOrder(confirmTargetOrderId);
              }}>
                <Text style={{ color: theme.deliveryDate || "#4ade80", fontWeight: "600", fontSize: 16 }}>Yes, Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScreenLayout>
  );
}
